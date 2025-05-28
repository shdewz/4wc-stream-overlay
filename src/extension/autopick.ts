import { createLogger } from './util/nodecg';
import { osuSongReplicant, tournamentMappool, tournamentPickBans } from './util/replicants';

const logger = createLogger('autopick');

osuSongReplicant.on('change', (newSong, oldSong) => {
  logger.info(`song changed: ${oldSong?.id} => ${newSong?.id}`);

  if (!newSong.id) return;

  const poolMap = tournamentMappool.value.beatmaps.find(
    (b) => b.beatmap_id === newSong.id,
  );

  if (!poolMap || tournamentPickBans.value[newSong.id.toString()]) {
    return; // no pool map found or map already picked
  }

  const newObj = tournamentPickBans.value;
  newObj[newSong.id.toString()] = {
    beatmap_id: newSong.id,
    type: 'pick',
    color: 'red',
    time: Date.now(),
  };

  tournamentPickBans.value = newObj;
});
