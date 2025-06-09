import { createLogger, get as nodecg } from './util/nodecg';
import {
  obsAutoAdvanceReplicant,
  osuSongReplicant,
  tournamentMappool,
  tournamentPickBans,
  tournamentPickBansSettings,
} from './util/replicants';

const logger = createLogger('autopick');

tournamentPickBansSettings.on('change', (newSettings, oldSettings) => {
  if (!newSettings) return;

  if (newSettings.autopick.enabled !== oldSettings?.autopick.enabled) {
    logger.info(`autopick enabled: ${newSettings.autopick.enabled}`);
  }
});

osuSongReplicant.on('change', (newSong, oldSong) => {
  logger.info(`song changed: ${oldSong?.id} => ${newSong?.id}`);

  // don't autopick if autopick isn't enabled
  if (!tournamentPickBansSettings.value.autopick.enabled) return;

  // don't autopick if we don't have enough bans yet
  const bansCount = Object.values(tournamentPickBans.value).filter((pb) => pb.type === 'ban').length;
  if (bansCount < tournamentPickBansSettings.value.autopick.requiredBans) return;

  if (!newSong.id) return;

  const poolMap = tournamentMappool.value.beatmaps.find(
    (b) => b.beatmap_id === newSong.id,
  );

  if (!poolMap || tournamentPickBans.value[newSong.id.toString()]) {
    return; // no pool map found or map already picked
  }

  const currentColor = tournamentPickBansSettings.value.autopick.nextColor;

  const newObj = tournamentPickBans.value;
  newObj[newSong.id.toString()] = {
    beatmap_id: newSong.id,
    type: 'pick',
    color: currentColor,
    time: Date.now(),
  };
  tournamentPickBans.value = newObj;

  logger.info(`Added a pick for ${poolMap.identifier} by ${currentColor} team`);

  tournamentPickBansSettings.value.autopick.nextColor = currentColor === 'red' ? 'blue' : 'red';
});
