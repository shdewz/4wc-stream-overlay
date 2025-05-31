import exitHook from 'exit-hook';
import { OBSWebSocket, OBSWebSocketError } from 'obs-websocket-js';

import { ObsSceneItem, ObsIndexedSceneItem } from '@4wc-stream-overlay/types/schemas';
import { createLogger, get as nodecg } from './util/nodecg';
import { obsDataReplicant, OBSStatusReplicant } from './util/replicants';

const logger = createLogger('obs');

let ws: undefined | OBSWebSocket;
let reconnectTimeout: NodeJS.Timeout;

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

  ws.on('ConnectionError', () => {
    OBSStatusReplicant.value.wsStatus = 'CLOSED';
    if (obsDataReplicant.value) obsDataReplicant.value.scenes.length = 0;

    tryReconnect();
  });

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
  if (!ws) {
    logger.warn('Cannot set Program scene: not connected');
    return;
  }

  logger.info(`Setting Program to scene '${sceneName}'`);
  await ws.call('SetCurrentProgramScene', { sceneName });
});

OBSStatusReplicant.on('change', (newVal, oldVal) => {
  if (oldVal && !newVal.automaticReconnect && oldVal.automaticReconnect && reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
});

exitHook(async () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
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

init().then(() => logger.info('Extension loaded'));
