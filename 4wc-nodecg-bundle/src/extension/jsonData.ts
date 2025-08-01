import { promises as fs } from 'fs';
import { get as nodecg } from './util/nodecg';
import { tournamentMappool, tournamentTeams, tournamentSchedule } from './util/replicants';

async function loadJson(filePath: string): Promise<any> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    nodecg().log.warn('Error loading JSON:', error);
    throw error;
  }
}

const reloadData = async () => {
  tournamentMappool.value = await loadJson('../_data/beatmaps.json');
  tournamentTeams.value = await loadJson('../_data/teams.json');

  try {
    tournamentSchedule.value = await loadJson('../_data/schedule.json');
  } catch (error) {
    nodecg().log.warn('[matches] Failed to load schedule data!');
  }
  nodecg().log.info('[matches] Successfully loaded teams and mappool!');
};

const exiting = false;
reloadData()
  .then(() => {
    if (exiting) {
      return;
    }

    nodecg().log.info('[jsonData] Loaded static JSON data.');
  })
  .catch((err) => {
    nodecg().log.error('[matches] Couldn\'t do initial JSON data load', err instanceof Error ? err.stack : err);
  });

nodecg().listenFor('jsondata:fetch', async (_, ack) => {
  try {
    await reloadData();
    if (ack && !ack?.handled) {
      ack(null);
    }
  } catch (err: unknown) {
    nodecg().log.error(err instanceof Error ? err.stack : err);
    if (ack && !ack?.handled) {
      ack(err);
    }
  }
});
