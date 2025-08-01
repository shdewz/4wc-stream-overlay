import type {
  CountdownReplicant,
  CurrentGosumemoryConnectionStatus,
  CurrentOsuSongOverrides,
  CurrentOsuSongReplicant,
  // CurrentRefereeHelperConnectionStatus,
  // CurrentRefereeHelperData,
  // MatchesReplicant,
  OsuTourneyData,
  TournamentMappoolData,
  // OpponentSeedingsReplicant,
  // ShoutcastersReplicant,
  // SpotifyReplicant,
  // SpotifyTokensReplicant,
  // SheetsKeyValueStoreReplicant,
  // UserExtendedReplicant,
  // ShowCamerasReplicant,
  TournamentTeamsData,
  TournamentPicksAndBans,
  TournamentPicksAndBansSettings,
  TournamentScheduleData,
} from '../types/schemas';

export const namespace = '4wc-nodecg-bundle';

export interface ReplicantTypes {
  countdown: CountdownReplicant;
  gosumemoryStatus: CurrentGosumemoryConnectionStatus;
  // matches: MatchesReplicant;
  osuSong: CurrentOsuSongReplicant;
  osuSongOverrides: CurrentOsuSongOverrides;
  osuTourney: OsuTourneyData;
  // refereeHelper: CurrentRefereeHelperData;
  // refereeHelperStatus: CurrentRefereeHelperConnectionStatus;
  // seeding: OpponentSeedingsReplicant;
  // sheetsKv: SheetsKeyValueStoreReplicant;
  // sheetsKvSecond: SheetsKeyValueStoreReplicant;
  // sheetsQualsUsers: SheetsKeyValueStoreReplicant;
  // shoutcasters: ShoutcastersReplicant;
  // showCasterCams: ShowCamerasReplicant;
  // spotifyReplicant: SpotifyReplicant;
  // spotifyTokensReplicant: SpotifyTokensReplicant;
  // userMetadata: UserExtendedReplicant;
  tournamentTeams: TournamentTeamsData;
  tournamentMappool: TournamentMappoolData;
  tournamentPickBans: TournamentPicksAndBans;
  tournamentPickBansSettings: TournamentPicksAndBansSettings;
  tournamentSchedule: TournamentScheduleData;
}

export const replicantOptions = {
  countdown: { persistent: true },
  gosumemoryStatus: { persistent: true },
  matches: { persistent: true },
  osuSong: { persistent: false },
  osuSongOverrides: { persistent: true },
  osuTourney: { persistent: false },
  refereeHelper: { persistent: false },
  refereeHelperStatus: { persistent: true },
  seeding: { persistent: true },
  sheetsKv: { persistent: true },
  sheetsKvSecond: { persistent: true },
  sheetsQualsUsers: { persistent: true },
  shoutcasters: { persistent: true },
  spotifyReplicant: { persistent: true },
  spotifyTokensReplicant: { persistent: true },
  userMetadata: { persistent: true },
  showCasterCams: { persistent: false },
  tournamentTeams: { persistent: false },
  tournamentMappool: { persistent: false },
  tournamentPickBans: { persistent: true }, // helpful when needing to refresh page/restart nodecg
  tournamentPickBansSettings: { persistent: true },
  tournamentSchedule: { persistent: false },
} as const;
