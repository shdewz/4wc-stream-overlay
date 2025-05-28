import { createLogger } from './util/nodecg';
import { osuSongReplicant } from './util/replicants';

const logger = createLogger('autopick');

osuSongReplicant.on('change', (newSong, oldSong) => {
  logger.info('song changed!');
});
