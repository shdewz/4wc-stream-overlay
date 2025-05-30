import exitHook from 'exit-hook';
import { OBSWebSocket, OBSWebSocketError } from 'obs-websocket-js';

import { createLogger, get as nodecg } from './util/nodecg';
import { OBSStatusReplicant } from './util/replicants';

const logger = createLogger('obs');

let ws: undefined | OBSWebSocket;
let reconnectTimeout: NodeJS.Timeout;

async function open() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  if (ws) {
    const oldWs = ws;
    ws = undefined;
    await oldWs.disconnect();
  }

  ws = new OBSWebSocket();

  ws.on('ConnectionOpened', () => {
    logger.info('Connection opened.');
  });
  ws.on('Hello', () => {
    logger.info('Received Hello message.');
  });
  ws.on('Identified', () => {
    logger.info('Connected and Identified.');
    OBSStatusReplicant.value.wsStatus = 'OPEN';
  });

  ws.on('ConnectionClosed', () => {
    logger.info('Connection closed.');
    OBSStatusReplicant.value.wsStatus = 'CLOSED';
  });

  ws.on('ConnectionError', () => {
    logger.warn('Connection errored.');
    OBSStatusReplicant.value.wsStatus = 'CLOSED';
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

  // ws.onopen = () => {
  //   OBSStatusReplicant.value.wsStatus = 'OPEN';
  //   logger.info('Connected to OBS!');
  // };
  // ws.onmessage = ({ type, data }) => {
  //   logger.info(`got ws message fo type ${type}, data: ${data}`);
  //   // if (type === 'message') {
  //   //   const msg = data.toString();
  //   //   if (currentDataRaw === msg) {
  //   //     return;
  //   //   }
  //   //   let json: undefined | CurrentGosumemoryData;
  //   //   try {
  //   //     json = JSON.parse(msg);
  //   //   } catch (err) {
  //   //     logger.warn('Couldn\'t parse JSON', msg);
  //   //   }
  //   //   if (json) {
  //   //     currentDataRaw = msg;
  //   //     applyData(json);
  //   //   }
  //   // }
  // };
  // ws.onclose = () => {
  //   OBSStatusReplicant.value.wsStatus = 'CLOSED';
  //   if (OBSStatusReplicant.value.automaticReconnect && currentWs === ws) {
  //     logger.error('Connection to OBS has been closed. Will attempt auto reconnect in 5s');
  //     if (reconnectTimeout) {
  //       clearTimeout(reconnectTimeout);
  //     }
  //     reconnectTimeout = setTimeout(() => {
  //       open();
  //     }, 5000);
  //   } else {
  //     logger.info('Connection to OBS has been closed.');
  //   }
  // };
  // ws.onerror = (error) => {
  //   OBSStatusReplicant.value.wsStatus = 'CLOSED';
  //   if (OBSStatusReplicant.value.automaticReconnect) {
  //     logger.error('Cannot connect to OBS. Will attempt auto reconnect in 5s', { error });
  //     if (reconnectTimeout) {
  //       clearTimeout(reconnectTimeout);
  //     }
  //     reconnectTimeout = setTimeout(() => {
  //       open();
  //     }, 5000);
  //   } else {
  //     logger.error('Cannot connect to OBS. Will not auto reconnect', { error });
  //   }
  // };
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
