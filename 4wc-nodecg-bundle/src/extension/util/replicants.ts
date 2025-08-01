/* eslint-disable max-len */

import { namespace, replicantOptions, ReplicantTypes } from '@4wc-stream-overlay/browser_shared/replicants';
import { get as nodecg } from './nodecg';

/**
 * This is where you can declare all your replicant to import easily into other files,
 * and to make sure they have any correct settings on startup.
 */
function getReplicant<N extends keyof ReplicantTypes, T extends ReplicantTypes[N]>(name: N) {
  return nodecg().Replicant<T>(name, namespace, { ...replicantOptions[name], defaultValue: undefined as unknown as T });
}
export const countdownReplicant = getReplicant('countdown');
export const gosumemoryStatusReplicant = getReplicant('gosumemoryStatus');
export const OBSStatusReplicant = getReplicant('obsStatus');
export const obsDataReplicant = getReplicant('obsData');
export const obsAutoAdvanceReplicant = getReplicant('obsAutoAdvanceSettings');
export const osuSongReplicant = getReplicant('osuSong');
export const osuSongOverridesReplicant = getReplicant('osuSongOverrides');
export const osuTourneyReplicant = getReplicant('osuTourney');
export const tournamentTeams = getReplicant('tournamentTeams');
export const tournamentMappool = getReplicant('tournamentMappool');
export const tournamentPickBans = getReplicant('tournamentPickBans');
export const tournamentPickBansSettings = getReplicant('tournamentPickBansSettings');
export const tournamentSchedule = getReplicant('tournamentSchedule');
