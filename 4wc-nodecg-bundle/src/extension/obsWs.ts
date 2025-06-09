import exitHook from 'exit-hook';
import { OBSWebSocket, OBSWebSocketError } from 'obs-websocket-js';

import { ObsSceneItem, ObsIndexedSceneItem } from '@4wc-stream-overlay/types/schemas';
import { delay } from '@4wc-stream-overlay/browser_shared/utils';
import { createLogger, get as nodecg } from './util/nodecg';
import {
  obsAutoAdvanceReplicant,
  obsDataReplicant,
  OBSStatusReplicant,
  osuTourneyReplicant,
  tournamentPickBans
} from './util/replicants';

const logger = createLogger('obs');

let ws: undefined | OBSWebSocket;
let reconnectTimeout: NodeJS.Timeout;
let sceneTransitionTimeout: NodeJS.Timeout;
let lastActionedTransitionTime = 0;

const refreshScenes = async () => {
  if (!ws) return;

  await delay(200); // Wait a bit to ensure the connection is stable before refreshing scenes

  logger.info('Refreshing OBS scenes...');

  const { scenes } = await ws.call('GetSceneList');

  try {
    if (!obsDataReplicant.value) {
      obsDataReplicant.value = { scenes: [], currentScene: await ws.call('GetCurrentProgramScene') };
    }

    obsDataReplicant.value.scenes = ((scenes as unknown) as ObsIndexedSceneItem[]).sort((a, b) => b.sceneIndex - a.sceneIndex);
  } catch (error) {
    if (error instanceof OBSWebSocketError) {
      logger.warn('Failed to list scenes', error.code, error.message);
    } else {
      logger.warn('Unexpected error while listing scenes: ', error);
    }
  }
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

  currentWs.on('ConnectionOpened', () => {
    logger.info('Connection opened.');
  });
  currentWs.on('Hello', () => {
    logger.info('Received Hello message.');
  });
  currentWs.on('Identified', async () => {
    logger.info('Connected and Identified.');
    OBSStatusReplicant.value.wsStatus = 'OPEN';

    await refreshScenes();
  });
  currentWs.on('CurrentProgramSceneChanged', (eventData) => {
    if (!obsDataReplicant.value) {
      obsDataReplicant.value = { scenes: [] };
    }
    obsDataReplicant.value.currentScene = eventData as unknown as ObsSceneItem;
  });

  currentWs.on('SceneTransitionStarted', () => {
    if (!obsDataReplicant.value) {
      obsDataReplicant.value = { scenes: [] };
    }
    obsDataReplicant.value.sceneTransitionActive = true;
  });
  currentWs.on('SceneTransitionEnded', () => {
    if (!obsDataReplicant.value) {
      obsDataReplicant.value = { scenes: [] };
    }
    obsDataReplicant.value.sceneTransitionActive = false;
  });

  currentWs.on('ConnectionClosed', () => {
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
    const { obsWebSocketVersion, negotiatedRpcVersion } = await currentWs.connect(OBSStatusReplicant.value.wsUrl, OBSStatusReplicant.value.wsPassword);

    logger.info(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);

    ws = currentWs;
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

  if (oldVal.state === newVal.state) return;

  logger.info(`tourney replicant state changed: ${oldVal.state} -> ${newVal.state} (autoadvance: ${obsAutoAdvanceReplicant.value.autoadvance})`);
  if (!obsAutoAdvanceReplicant.value.autoadvance) {
    logger.info('Not processing scene change, auto-advance is disabled.');
    return;
  }

  if (oldVal.state === 'spectating' && newVal.state === 'results') {
    // default to 20s after entering ranking state
    const delayMs = 24_000;
    obsAutoAdvanceReplicant.value.nextTransition = { sceneName: obsAutoAdvanceReplicant.value.scenes.mappool, time: Date.now() + delayMs };
  }

  if (oldVal.state === 'results' && newVal.state === 'idle') {
    obsAutoAdvanceReplicant.value.nextTransition = { sceneName: obsAutoAdvanceReplicant.value.scenes.mappool, time: Date.now() };
  }

  if (oldVal.state === 'idle' && (newVal.state === 'waitingForClients' || newVal.state === 'spectating')) {
    obsAutoAdvanceReplicant.value.nextTransition = { sceneName: obsAutoAdvanceReplicant.value.scenes.gameplay, time: Date.now() };
  }
});

tournamentPickBans.on('change', (newVal, oldVal) => {
  const newKeys = Object.entries(newVal).filter(([, value]) => value.type === 'pick').map(([k]) => k);
  const oldKeys = oldVal
    ? Object.entries(oldVal).filter(([, value]) => value.type === 'pick').map(([k]) => k)
    : [];

  if (newKeys.some((key) => !oldKeys.includes(key))) {
    obsAutoAdvanceReplicant.value.nextTransition = { sceneName: obsAutoAdvanceReplicant.value.scenes.gameplay, time: Date.now() + 10_000 };
  }
});

obsAutoAdvanceReplicant.on('change', async () => {
  if (obsAutoAdvanceReplicant.value?.autoadvance !== true) return;

  // logger.info(`obsAutoAdvanceReplicant changed: current nextTransition: ${JSON.stringify(obsAutoAdvanceReplicant.value?.nextTransition)} (new: ${JSON.stringify(newVal.nextTransition)})`);
  if (!obsAutoAdvanceReplicant.value?.nextTransition) return;

  if (obsAutoAdvanceReplicant.value?.nextTransition.time <= lastActionedTransitionTime) return;

  const targetSceneName = obsAutoAdvanceReplicant.value?.nextTransition.sceneName;
  if (!obsAutoAdvanceReplicant.value?.nextTransition || !targetSceneName) return;

  const timeNow = Date.now();
  const delayUntilTransition = obsAutoAdvanceReplicant.value.nextTransition.time - timeNow;

  clearTimeout(sceneTransitionTimeout);

  if (delayUntilTransition > 0) {
    logger.info(`Scheduled transition to ${targetSceneName} in ${delayUntilTransition.toLocaleString('en-US')}ms`);

    const transitionTime = obsAutoAdvanceReplicant.value.nextTransition.time;
    sceneTransitionTimeout = setTimeout(async () => {
      if (obsAutoAdvanceReplicant.value?.autoadvance !== true) {
        logger.warn('Executing delayed transition, but autoadvance is not enabled! Skipping transition');
        return;
      }

      if (obsDataReplicant.value?.currentScene?.sceneName !== targetSceneName) {
        await setProgramScene(targetSceneName);
      } else {
        logger.info(`OBS is already on scene ${targetSceneName}, not performing transition to ${targetSceneName}`);
      }
      lastActionedTransitionTime = transitionTime;
    }, delayUntilTransition);
    return;
  }

  if (obsDataReplicant.value?.currentScene?.sceneName !== targetSceneName) {
    await setProgramScene(targetSceneName);
  } else {
    logger.info(`OBS is already on scene ${targetSceneName}, not performing transition to ${targetSceneName}`);
  }
  lastActionedTransitionTime = obsAutoAdvanceReplicant.value.nextTransition.time;
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
