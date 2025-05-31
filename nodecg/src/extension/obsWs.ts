import exitHook from 'exit-hook';
import { OBSWebSocket, OBSWebSocketError } from 'obs-websocket-js';

import { ObsSceneItem, ObsIndexedSceneItem } from '@4wc-stream-overlay/types/schemas';
import { createLogger, get as nodecg } from './util/nodecg';
import { obsAutoAdvanceReplicant, obsDataReplicant, OBSStatusReplicant, osuTourneyReplicant } from './util/replicants';

const logger = createLogger('obs');

let ws: undefined | OBSWebSocket;
let reconnectTimeout: NodeJS.Timeout;
let sceneTransitionTimeout: NodeJS.Timeout;

const refreshScenes = async () => {
  if (!ws) return;

  const { scenes } = await ws.call('GetSceneList');

  if (!obsDataReplicant.value) {
    obsDataReplicant.value = { scenes: [], currentScene: await ws.call('GetCurrentProgramScene') };
  }

  obsDataReplicant.value.scenes = ((scenes as unknown) as ObsIndexedSceneItem[]).sort((a, b) => b.sceneIndex - a.sceneIndex);
};

async function open() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  if (ws) {
    const oldWs = ws;
    ws = undefined;
    await oldWs.disconnect();
  }
  const currentWs = new OBSWebSocket();
  ws = currentWs;

  const tryReconnect = () => {
    if (OBSStatusReplicant.value.automaticReconnect && currentWs === ws) {
      logger.warn('Connection to OBS has been closed. Will attempt auto reconnect in 5s');
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      reconnectTimeout = setTimeout(() => {
        open();
      }, 5000);
    } else {
      logger.info('Connection to OBS has been closed.');
    }
  };

  ws.on('ConnectionOpened', () => {
    logger.info('Connection opened.');
  });
  ws.on('Hello', () => {
    logger.info('Received Hello message.');
  });
  ws.on('Identified', async () => {
    logger.info('Connected and Identified.');
    OBSStatusReplicant.value.wsStatus = 'OPEN';

    await refreshScenes();
  });
  ws.on('CurrentProgramSceneChanged', (eventData) => {
    if (!obsDataReplicant.value) {
      obsDataReplicant.value = { scenes: [] };
    }
    obsDataReplicant.value.currentScene = eventData as unknown as ObsSceneItem;
  });

  ws.on('SceneTransitionStarted', () => {
    if (!obsDataReplicant.value) {
      obsDataReplicant.value = { scenes: [] };
    }
    obsDataReplicant.value.sceneTransitionActive = true;
  });
  ws.on('SceneTransitionEnded', () => {
    if (!obsDataReplicant.value) {
      obsDataReplicant.value = { scenes: [] };
    }
    obsDataReplicant.value.sceneTransitionActive = false;
  });

  ws.on('ConnectionClosed', () => {
    OBSStatusReplicant.value.wsStatus = 'CLOSED';
    if (obsDataReplicant.value) obsDataReplicant.value.scenes.length = 0;

    tryReconnect();
  });

  // ConnectionClosed seems to be called regardless of a connection being closed or a connection erroring.
  // ws.on('ConnectionError', () => {
  //   OBSStatusReplicant.value.wsStatus = 'CLOSED';
  //   if (obsDataReplicant.value) obsDataReplicant.value.scenes.length = 0;
  //
  //   tryReconnect();
  // });

  try {
    logger.info('Connecting to OBS...');
    OBSStatusReplicant.value.wsStatus = 'CONNECTING';
    const { obsWebSocketVersion, negotiatedRpcVersion } = await ws.connect(OBSStatusReplicant.value.wsUrl, OBSStatusReplicant.value.wsPassword);

    logger.info(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
  } catch (error) {
    if (error instanceof OBSWebSocketError) {
      logger.warn('Failed to connect', error.code, error.message);
    } else if (error instanceof Error) {
      logger.warn('Failed to connect', error.message);
    } else {
      logger.warn('Unknown error:', error);
    }
  }
}

const setProgramScene = async (sceneName: string) => {
  if (!ws) {
    logger.warn('Cannot set Program scene: not connected');
    return;
  }

  logger.info(`Setting Program to scene '${sceneName}'`);
  await ws.call('SetCurrentProgramScene', { sceneName });
};

OBSStatusReplicant.value.wsStatus = 'CLOSED';

nodecg().listenFor('OBS-open', async ({ wsUrl, wsPassword }: { wsUrl: string, wsPassword: string }) => {
  OBSStatusReplicant.value.wsUrl = wsUrl;
  OBSStatusReplicant.value.wsPassword = wsPassword;
  await open();
});
nodecg().listenFor('OBS-close', async () => {
  OBSStatusReplicant.value.automaticReconnect = false;
  if (ws) {
    await ws.disconnect();
  }
});

nodecg().listenFor('OBS-refreshScenes', async () => {
  await refreshScenes();
});

nodecg().listenFor('OBS-setProgram', async (sceneName: string) => {
  await setProgramScene(sceneName);
});

OBSStatusReplicant.on('change', (newVal, oldVal) => {
  if (oldVal && !newVal.automaticReconnect && oldVal.automaticReconnect && reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
});

// /**
//  * checks conditions and attempts to transition from gameplay scene to mappool scene
//  * @param data GosuData data sent by ws
//  * @returns {Promise<void>}
//  */
// async function transitionToMappool(data) {
//   let newState = data.tourney.manager.ipcState;
//   if (enableAutoAdvance) {
//     if (lastState === TourneyState.Ranking && newState === TourneyState.Idle) {
//       sceneTransitionTimeoutID = setTimeout(() => {
//         obsGetCurrentScene((scene) => {
//           if (scene.name !== gameplay_scene_name)  // e.g. on winner screen
//             return
//           obsSetCurrentScene(mappool_scene_name);
//         });
//       }, 2000);
//     }
//     if (lastState !== newState && newState !== TourneyState.Idle) {
//       clearTimeout(sceneTransitionTimeoutID);
//     }
//   }
//   lastState = newState;
// }

osuTourneyReplicant.on('change', async (newVal, oldVal) => {
  if (!oldVal) return;
  if (!newVal) return;

  logger.warn(`tourney replicant state changed: ${oldVal.state} -> ${newVal.state}`);

  if (oldVal.state === 'spectating' && newVal.state === 'results') {
    // default to 20s after entering ranking state
    const delayMs = 20_000;
    const targetScene = obsAutoAdvanceReplicant.value.scenes.gameplay;

    clearTimeout(sceneTransitionTimeout);
    obsAutoAdvanceReplicant.value.nextTransition = { sceneName: targetScene, time: Date.now() + delayMs };

    sceneTransitionTimeout = setTimeout(async () => {
      await setProgramScene(targetScene);
    }, delayMs);
  }

  if ((oldVal.state === 'spectating' || oldVal.state === 'results') && newVal.state === 'idle') {
    clearTimeout(sceneTransitionTimeout);
    obsAutoAdvanceReplicant.value.nextTransition = undefined;
    await setProgramScene(obsAutoAdvanceReplicant.value.scenes.mappool);
  }

  if (oldVal.state === 'idle' && (newVal.state === 'waitingForClients' || newVal.state === 'spectating')) {
    // todo: transition to gameplay if not already in gameplay and not in active transition
  }
});

exitHook(async () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  if (sceneTransitionTimeout) {
    clearTimeout(sceneTransitionTimeout);
  }

  const oldWs = ws;
  ws = undefined;
  await oldWs?.disconnect();
});

async function init() {
  if (OBSStatusReplicant.value.automaticReconnect) {
    await open();
  } else {
    logger.info('Automatic reconnection is disabled.');
  }
}

logger.info('Extension loaded');

// noinspection JSIgnoredPromiseFromCall
init();
