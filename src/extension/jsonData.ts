import {get as nodecg} from './util/nodecg';
import {tournamentMappool} from './util/replicants';
import {promises as fs} from 'fs';

async function loadJson(filePath: string): Promise<any> {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading JSON:', error);
        throw error;
    }
}

const reloadData = async () => {

    // const { data: { values: rows } } = await sheetsClient.spreadsheets.values.get({
    //     spreadsheetId: config.countdown.matches.spreadsheetId,
    //     range: config.countdown.matches.range,
    // }) as { data: { values: string[][] } };
    //
    // if (!Array.isArray(rows) || rows.length === 0) {
    //     throw new Error('No rows returned');
    // }
    //
    // const matches: Match[] = [];
    // // eslint-disable-next-line no-restricted-syntax
    // for (const row of rows) {
    //     const match: Match = getDefaultMatch();
    //     let i = 0;
    //     for (const cell of row) {
    //         // eslint-disable-next-line default-case
    //         switch (config.countdown.matches.columns[i]) {
    //             case 'id': {
    //                 match.id = Number(cell) || null;
    //                 break;
    //             }
    //             case 'score1':
    //                 if (!match.players[0]) {
    //                     match.players[0] = getDefaultPlayer();
    //                 }
    //                 match.players[0].score = transformScore(cell);
    //                 break;
    //             case 'name1':
    //                 if (!match.players[0]) {
    //                     match.players[0] = getDefaultPlayer();
    //                 }
    //                 match.players[0].name = cell.trim();
    //                 break;
    //             case 'name2':
    //                 if (!match.players[1]) {
    //                     match.players[1] = getDefaultPlayer();
    //                 }
    //                 match.players[1].name = cell.trim();
    //                 break;
    //             case 'score2':
    //                 if (!match.players[1]) {
    //                     match.players[1] = getDefaultPlayer();
    //                 }
    //                 match.players[1].score = transformScore(cell);
    //                 break;
    //             case 'schedule':
    //                 match.schedule = cell.trim();
    //                 break;
    //             case 'shoutcasters':
    //                 match.shoutcasters = cell.split(/[&,]/).map((s) => s.trim());
    //                 break;
    //             case 'mpLink':
    //                 match.mpLink = cell.trim();
    //                 break;
    //         }
    //         i++;
    //     }
    //
    //     if (match.id !== null && !Number.isNaN(match.id) && schedulesFilter.test(match.schedule ?? '')) {
    //         matches.push(match);
    //     }
    // }

    tournamentMappool.value = await loadJson('_data/beatmaps.json');
    nodecg().log.info('[matches] Successfully loaded mappool!');
};

let exiting = false;
let interval: ReturnType<typeof setInterval>;
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
