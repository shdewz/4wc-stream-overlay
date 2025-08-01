import exitHook from 'exit-hook';
import WebSocket from 'ws';
import { CurrentGosumemoryData, CurrentOsuSongReplicant, OsuTourneyData } from '@4wc-stream-overlay/types/schemas';
import { get as nodecg } from './util/nodecg';
import {
  osuSongOverridesReplicant,
  osuSongReplicant,
  gosumemoryStatusReplicant,
  osuTourneyReplicant,
} from './util/replicants';
import { formatLength, getModdedStats } from "@4wc-stream-overlay/browser_shared/utils";

let ws: undefined | WebSocket;
let currentDataRaw: string;
let reconnectTimeout: NodeJS.Timeout;

const ipcStateMapping: Record<number, OsuTourneyData['state'] | undefined> = {
  3: 'spectating',
  4: 'results',
};
let currentOsuTourneyReplicantRaw: string;

function findOverrides(beatmapId: number, md5: string) {
  const overrides = osuSongOverridesReplicant.value;
  return overrides[beatmapId] || overrides[md5] || {};
}

function formatBPM({ min, max }: { min: number; max: number }) {
  const formattedMin = Math.round(min);
  const formattedMax = Math.round(max);
  if (formattedMin === formattedMax) return `${formattedMin}`;
  return `${formattedMin}-${formattedMax}`;
}

function formatSR(sr: number) {
  return (Math.round(sr * 100) / 100).toFixed(2);
}

function formatDifficultyProperty(prop: number) {
  return (Math.round(prop * 100) / 100).toFixed(1);
}

function osuSongEquals(a: CurrentOsuSongReplicant, b: CurrentOsuSongReplicant) {
  if (a === b) return true;

  if (a.id !== b.id) return false;
  if (a.setId !== b.setId) return false;
  if (a.artist !== b.artist) return false;
  if (a.title !== b.title) return false;
  if (a.difficulty !== b.difficulty) return false;
  if (a.creator !== b.creator) return false;
  if (a.SR !== b.SR) return false;
  if (a.length !== b.length) return false;
  if (a.OD !== b.OD) return false;
  if (a.AR !== b.AR) return false;
  if (a.CS !== b.CS) return false;
  if (a.BPM !== b.BPM) return false;
  if (a.stage !== b.stage) return false;
  if (a.index !== b.index) return false;
  if (a.category !== b.category) return false;
  if (a.coverUrl !== b.coverUrl) return false;
  if (a.localBackgroundPath !== b.localBackgroundPath) return false;

  return true;
}

function applyData(val: CurrentGosumemoryData) {
  if (val) {
    const overrides = findOverrides(val.menu.bm.id, val.menu.bm.md5);
    const setId = (overrides.setId !== undefined && overrides.setId > 0) ? overrides.setId : val.menu.bm.set;

    // Read AR/OD/CS from memory instead of from .osu if gosumemory .osu parsing and pp calc is disabled
    const moddedStats = getModdedStats(
        val.menu.pp[99] === 0 ? val.menu.bm.stats.memoryCS : val.menu.bm.stats.CS,
        val.menu.pp[99] === 0 ? val.menu.bm.stats.memoryAR : val.menu.bm.stats.AR,
        val.menu.pp[99] === 0 ? val.menu.bm.stats.memoryOD : val.menu.bm.stats.OD,
        val.menu.bm.time.full,
        val.menu.mods.str
    );

    const newSongDataObj = {
      id: val.menu.bm.id,
      setId,
      artist: overrides.artist || val.menu.bm.metadata.artist || 'Unknown Artist',
      title: overrides.title || val.menu.bm.metadata.title || 'Unknown Title',
      difficulty: overrides.difficulty || val.menu.bm.metadata.difficulty,
      creator: overrides.creator || val.menu.bm.metadata.mapper,
      SR: overrides.SR || formatSR(val.menu.bm.stats.fullSR),
      // eslint-disable-next-line no-bitwise
      length: overrides.length || formatLength(moddedStats.length),
      lengthRaw: moddedStats.lengthRaw,
      OD: overrides.OD || formatDifficultyProperty(moddedStats.od),
      ODRaw: moddedStats.odRaw,
      AR: overrides.AR || formatDifficultyProperty(moddedStats.ar),
      ARRaw: moddedStats.arRaw,
      CS: overrides.CS || formatDifficultyProperty(moddedStats.cs),
      CSRaw: moddedStats.csRaw,
      BPM: overrides.BPM || formatBPM(val.menu.bm.stats.BPM),
      BPMRaw: val.menu.bm.stats.BPM,
      mods: val.menu.mods.str,
      stage: overrides.stage,
      index: overrides.index,
      category: overrides.category,
      coverUrl: overrides.coverUrl || `https://assets.ppy.sh/beatmaps/${setId}/covers/cover.jpg`,
      localBackgroundPath: overrides.localBackgroundPath || val.menu.bm.path.full || '',
      songsFolderPath: val.settings.folders.songs,
    };
    if (!osuSongReplicant.value || !osuSongEquals(osuSongReplicant.value, newSongDataObj)) {
      osuSongReplicant.value = newSongDataObj;
    }

    const newOsuTourneyReplicant = {
      state: ipcStateMapping[val.tourney.manager.ipcState] ?? 'unknown',
      scoresVisible: val.tourney.manager.bools.scoreVisible,
      starsVisible: val.tourney.manager.bools.starsVisible,
      teamName: val.tourney.manager.teamName,
      bestOf: val.tourney.manager.bestOF,
      stars: val.tourney.manager.stars,
      chat: val.tourney.manager.chat,
      clients: val.tourney.ipcClients?.map((client) => ({
        mods: client.gameplay.mods.str,
        score: client.gameplay.score,
        unstableRate: client.gameplay.hits.unstableRate,
        hits300: client.gameplay.hits[300],
        hits100: client.gameplay.hits[100],
        hits50: client.gameplay.hits[50],
        hits0: client.gameplay.hits[0],
      })) ?? [],
      time: val.menu.bm.time,
    };
    const newOsuTourneyReplicantRaw = JSON.stringify(newOsuTourneyReplicant);
    if (!currentOsuTourneyReplicantRaw) {
      currentOsuTourneyReplicantRaw = JSON.stringify(osuTourneyReplicant.value);
    }
    if (currentOsuTourneyReplicantRaw !== newOsuTourneyReplicantRaw) {
      osuTourneyReplicant.value = newOsuTourneyReplicant;
      currentOsuTourneyReplicantRaw = newOsuTourneyReplicantRaw;
    }
  }
}

function open() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  if (ws) {
    let _ws = ws;
    ws = undefined;
    _ws.terminate();
  }

  gosumemoryStatusReplicant.value.wsStatus = 'CONNECTING';
  const currentWs = new WebSocket(gosumemoryStatusReplicant.value.wsUrl);
  ws = currentWs;
  nodecg().log.info('[gosumemory] Connecting to gosumemory...');
  ws.onopen = () => {
    gosumemoryStatusReplicant.value.wsStatus = 'OPEN';
    nodecg().log.info('[gosumemory] Connected to gosumemory!');
  };
  ws.onmessage = ({ type, data }) => {
    if (type === 'message') {
      const msg = data.toString();
      if (currentDataRaw === msg) {
        return;
      }
      let json: undefined | CurrentGosumemoryData;
      try {
        json = JSON.parse(msg);
      } catch (err) {
        nodecg().log.warn('[gosumemory] Couldn\'t parse JSON', msg);
      }
      if (json) {
        currentDataRaw = msg;
        applyData(json);
      }
    }
  };
  ws.onclose = () => {
    gosumemoryStatusReplicant.value.wsStatus = 'CLOSED';
    if (gosumemoryStatusReplicant.value.automaticReconnect && currentWs === ws) {
      nodecg().log.error('[gosumemory] Connection to gosumemory has been closed. Will attempt auto reconnect in 5s');
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      reconnectTimeout = setTimeout(() => {
        open();
      }, 5000);
    } else {
      nodecg().log.info('[gosumemory] Connection to gosumemory has been closed.');
    }
  };
  ws.onerror = (error) => {
    gosumemoryStatusReplicant.value.wsStatus = 'CLOSED';
    if (gosumemoryStatusReplicant.value.automaticReconnect) {
      nodecg().log.error('[gosumemory] Cannot connect to gosumemory. Will attempt auto reconnect in 5s', { error });
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      reconnectTimeout = setTimeout(() => {
        open();
      }, 5000);
    } else {
      nodecg().log.error('[gosumemory] Cannot connect to gosumemory. Will not auto reconnect', { error });
    }
  };
}

gosumemoryStatusReplicant.value.wsStatus = 'CLOSED';

nodecg().listenFor('gosumemory-open', (wsUrl: string) => {
  gosumemoryStatusReplicant.value.wsUrl = wsUrl;
  open();
});
nodecg().listenFor('gosumemory-close', () => {
  gosumemoryStatusReplicant.value.automaticReconnect = false;
  ws?.terminate();
});

osuSongOverridesReplicant.on('change', () => {
  if (currentDataRaw) {
    applyData(JSON.parse(currentDataRaw));
  }
});

if (gosumemoryStatusReplicant.value.automaticReconnect) {
  open();
} else {
  nodecg().log.info('[gosumemory] Automatic reconnection is disabled.');
}
gosumemoryStatusReplicant.on('change', (newVal, oldVal) => {
  if (oldVal && !newVal.automaticReconnect && oldVal.automaticReconnect && reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
});

exitHook(() => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  const _ws = ws;
  ws = undefined;
  _ws?.terminate();
});
