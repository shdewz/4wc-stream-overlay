<script setup lang="ts">
import {useReplicant} from '@4wc-stream-overlay/browser_shared/vue-replicants';
import CountUp from 'countup.js'
import $ from "jquery"
import {delay, formatLength} from "@4wc-stream-overlay/browser_shared/utils";
import {computed, ref, watch} from "vue";
import '../../assets/common.css';
import { getModdedStats } from "@4wc-stream-overlay/browser_shared/utils";


// const TEAMSIZE = 4;
// const DEBUG = false;
//
// const cache = {};
// const timer = {
//   in_progress: false,
//   object: null,
//   object_blink: null
// };

const mappoolReplicant = useReplicant('tournamentMappool');
const teamsReplicant = useReplicant('tournamentTeams');

const tourneyDataReplicant = useReplicant('osuTourney');
const songDataReplicant = useReplicant('osuSong');


// let mappool, teams;
// (async () => {
//   $.ajaxSetup({ cache: false });
//   mappool = await $.getJSON('../_data/beatmaps.json');
//   teams = await $.getJSON('../_data/teams.json');
//   const stage = mappool.stage;
//   if (stage) {
//     $('#stage').text(stage);
//     if (stage.toUpperCase() === 'QUARTERFINALS') $('#stage').addClass('qf');
//   }
// })();
//
const hidePickByLabel = async () => {
  const pickedByContainer = $('#picked_by_container');
  pickedByContainer.css('animation', 'none');
  void (pickedByContainer[0].offsetWidth); // Trigger reflow
  pickedByContainer.css('animation', 'pickerIn 300ms ease forwards reverse');
  await delay(300);
  $('#picked_by').text('');
};

// window.setInterval(async () => {
//   const currentPick = localStorage.getItem('current_pick');
//
//   const checkValid = async () => {
//     if (!cache.mapid) return -9;
//
//     const pickValue = currentPick.split('/');
//     if (pickValue.length !== 2) return -1;
//
//     const parsedBeatmapID = parseInt(pickValue[0]);
//     if (isNaN(parsedBeatmapID)) return -2;
//
//     if (currentPick === cache.currentPick && cache.mapid == parsedBeatmapID) return -5;
//     if (cache.mapid !== parsedBeatmapID) return -6;
//
//     const parsedTeam = pickValue[1];
//     if (parsedTeam !== 'red' && parsedTeam !== 'blue') return -3;
//
//     cache.currentPick = currentPick;
//
//     // if (true) {  // bypass beatmap id checking during development
//     if (cache.mapid === parsedBeatmapID) {
//       const mapObj = mappool.beatmaps.find(m => m.beatmap_id === cache.mapid);
//       if (mapObj?.identifier?.toUpperCase().includes('TB')) return -4;
//       if (cache.nameRed && cache.nameBlue) {
//         if (cache.pickLabelEnabled) {
//           await hidePickByLabel();
//         }
//
//         requestAnimationFrame(_ => {
//           $('#picked_by').text(`PICKED BY ${(parsedTeam === 'red' ? cache.nameRed : cache.nameBlue).toUpperCase()}`);
//           $('#picked_by_container').css('animation', 'none');
//           void $('#picked_by_container')[0].offsetWidth; // Trigger reflow
//           $('#picked_by_container').css('animation', 'pickerIn 300ms 100ms ease forwards');
//         });
//
//         cache.pickLabelEnabled = true;
//       }
//       else {
//         await hidePickByLabel();
//         cache.pickLabelEnabled = false;
//       }
//       return 0;
//     }
//     return -255;
//   };
//
//   const validityState = await checkValid();
//
//   if (validityState === -5)
//     return;
//
//   if (validityState !== 0) {
//     if (cache.pickLabelEnabled) {
//       await hidePickByLabel();
//       cache.pickLabelEnabled = false;
//     }
//   }
// }, 500);

const animation = {
  red_score: new CountUp('score_red', 0, 0, 0, .3, { useEasing: true, useGrouping: true, separator: ',', decimal: '.', suffix: '' }),
  blue_score: new CountUp('score_blue', 0, 0, 0, .3, { useEasing: true, useGrouping: true, separator: ',', decimal: '.', suffix: '' }),
  score_diff: new CountUp('score_diff', 0, 0, 0, .3, { useEasing: true, useGrouping: true, separator: ',', decimal: '.', suffix: '' }),
}

// const socket = new ReconnectingWebSocket(DEBUG ? 'ws://127.0.0.1:24051/' : `ws://${location.host}/websocket/v2`);
// socket.onopen = () => { console.log('Successfully Connected'); };
// socket.onclose = event => { console.log('Socket Closed Connection: ', event); socket.send('Client Closed!'); };
// socket.onerror = error => { console.log('Socket Error: ', error); };
//
// socket.onmessage = async event => {
//   const data = JSON.parse(event.data);
//   const now = Date.now();
//
//   if (cache.scoreVisible !== data.tourney.scoreVisible) {
//     cache.scoreVisible = data.tourney.scoreVisible;
//
//     if (cache.scoreVisible) {
//       $('#chat_container').css('animation', 'chatIn 300ms ease forwards reverse');
//       $('#score_area').css('opacity', 1);
//       // $('#map_title_container').addClass('expanded');
//     } else {
//       $('#chat_container').css('animation', 'chatIn 300ms ease forwards');
//       $('#score_area').css('opacity', 0);
//       // $('#map_title_container').removeClass('expanded');
//     }
//   }
//
//   if (mappool && cache.md5 !== data.beatmap.checksum) {
//     cache.md5 = data.beatmap.checksum;
//     setTimeout(() => { cache.update_stats = true }, 250);
//   }
//
//   if (cache.scoreVisible) {
//     const scores = [];
//     const ez_multiplier = cache.map?.ez_multiplier || 1;
//     for (let i = 0; i < TEAMSIZE * 2; i++) {
//       let score = data.tourney.clients[i]?.play?.score || 0;
//       if (data.tourney.clients[i]?.play?.mods?.name?.toUpperCase().includes('EZ')) score *= ez_multiplier;
//       scores.push({ id: i, score });
//     }
//
//     cache.scoreRed = scores.filter(s => s.id < TEAMSIZE).map(s => s.score).reduce((a, b) => a + b);
//     cache.scoreBlue = scores.filter(s => s.id >= TEAMSIZE).map(s => s.score).reduce((a, b) => a + b);
//     // cache.scoreRed = 1665624;
//     // cache.scoreBlue = 796743;
//     const scorediff = Math.abs(cache.scoreRed - cache.scoreBlue);
//
//     animation.red_score.update(cache.scoreRed);
//     animation.blue_score.update(cache.scoreBlue);
//     animation.score_diff.update(scorediff);
//
//     const lead_bar_width = `${Math.max(10, 360 * (Math.min(0.5, Math.pow(scorediff / 1000000, 0.7)) * 2))}px`;
//
//     if (cache.scoreRed > cache.scoreBlue) {
//       $('#score_red').addClass('winning');
//       $('#score_blue').removeClass('winning');
//
//       $('#score_diff_red').addClass('visible');
//       $('#score_diff_blue').removeClass('visible');
//
//       $('#lead_bar').css('width', lead_bar_width);
//       $('#lead_bar').addClass('red').removeClass('blue');
//     }
//     else if (cache.scoreBlue > cache.scoreRed) {
//       $('#score_red').removeClass('winning');
//       $('#score_blue').addClass('winning');
//
//       $('#score_diff_red').removeClass('visible');
//       $('#score_diff_blue').addClass('visible');
//
//       $('#lead_bar').css('width', lead_bar_width);
//       $('#lead_bar').removeClass('red').addClass('blue');
//     }
//     else {
//       $('#score_red').removeClass('winning');
//       $('#score_blue').removeClass('winning');
//
//       $('#score_diff_red').removeClass('visible');
//       $('#score_diff_blue').removeClass('visible');
//
//       $('#lead_bar').css('width', '0px');
//       $('#lead_bar').removeClass('red blue');
//     }
//   }
//
//   if (cache.chatLen !== data.tourney.chat.length && teams) {
//     const current_chat_len = data.tourney.chat.length;
//     if (cache.chatLen === 0 || (cache.chatLen > 0 && cache.chatLen > current_chat_len)) { $('#chat').html(''); cache.chatLen = 0; }
//
//     for (let i = cache.chatLen || 0; i < current_chat_len; i++) {
//       const chat = data.tourney.chat[i];
//       const body = chat.message;
//       const timestamp = chat.timestamp;
//       if (body.toLowerCase().startsWith('!mp')) {
//         if (!cache.chat_loaded) continue;
//         const command = body.toLowerCase();
//         const command_value = Number(command.match(/\d+/)) ?? 0;
//
//         if (command.startsWith('!mp timer')) {
//           if (isNaN(command_value)) { stop_timer(); continue; }
//           else start_timer(command_value);
//         }
//         else if ((command.startsWith('!mp aborttimer') && command.startsWith('!mp start')) && timer_in_progress) stop_timer();
//         else continue;
//       }
//
//       const player = chat.name;
//       if (player === 'BanchoBot' && body.startsWith('Match history')) continue;
//
//       const team = team_lookup[chat.team] ?? 'unknown';
//       const team_actual = teams.find(t => t.players.map(p => p.username).includes(player))?.team;
//       const teamcode_actual = team_actual ? team_actual === cache.nameRed ? 'red' : team_actual === cache.nameBlue ? 'blue' : null : null;
//
//       const chatParent = $('<div></div>').addClass(`chat-message ${teamcode_actual || team}`);
//
//       chatParent.append($('<div></div>').addClass('chat-time').text(timestamp));
//       chatParent.append($('<div></div>').addClass(`chat-name ${team}`).text(player));
//       chatParent.append($('<div></div>').addClass('chat-body').text(body));
//       $('#chat').prepend(chatParent);
//     }
//
//     cache.chatLen = data.tourney.chat.length;
//     cache.chat_loaded = true;
//   }
// }
//
// const really_start_timer = length => {
//   timer_in_progress = true;
//   $('#timer_progress').css('animation', 'none');
//   $('#timer_container').addClass('visible');
//   $('#timer_progress').css('animation', `progress ${length}s linear`);
//
//   if (length > 3) {
//     timer.object_blink = setTimeout(() => {
//       if (!timer_in_progress) return;
//       $('#timer_progress').css('animation', `progress ${length}s linear, progress_blink 0.5s infinite ease 0.5s`);
//     }, (length - 3) * 1000);
//   }
//
//   timer.object = setTimeout(() => {
//     if (!timer_in_progress) return;
//     stop_timer();
//   }, length * 1000);
// }
//
// const start_timer = length => {
//   window.requestAnimationFrame(() => {
//     stop_timer();
//     window.requestAnimationFrame(() => {
//       really_start_timer(length);
//     })
//   })
// }
//
// const stop_timer = () => {
//   clearTimeout(timer.object);
//   clearTimeout(timer.object_blink);
//   timer_in_progress = false;
//   $('#timer_progress').css('animation', 'none');
//   $('#timer_container').removeClass('visible');
// }
//
// const team_lookup = {
//   bot: 'bot',
//   left: 'red',
//   right: 'blue'
// }
//


const team_flags = computed(() => {
  const redFlagName = teamsReplicant.data?.find(t => t.team === tourneyDataReplicant.data?.teamName?.left)?.flag;
  const blueFlagName = teamsReplicant.data?.find(t => t.team === tourneyDataReplicant.data?.teamName?.right)?.flag;

  return [new URL(`../../assets/flags/${redFlagName ?? 'XX'}.png`, import.meta.url).href,
    new URL(`../../assets/flags/${blueFlagName ?? 'XX'}.png`, import.meta.url).href];
});

const team_seeds = computed(() => {
  const { left: redTeamName, right: blueTeamName } = tourneyDataReplicant.data?.teamName ?? {};

  return [teamsReplicant.data?.find(t => t.team === redTeamName)?.seed ?? '?',
    teamsReplicant.data?.find(t => t.team === blueTeamName)?.seed ?? '?'];
});

const firstTo = computed(() => {
  return Math.ceil((tourneyDataReplicant.data?.bestOf ?? 0) / 2);
});

const mappoolMap = computed(() => { return mappoolReplicant.data?.beatmaps.find(m => m.beatmap_id === songDataReplicant.data?.id) });

const mapStatsAfterMods = computed(() => {
  return getModdedStats(songDataReplicant.data?.CSRaw ?? 0,
      songDataReplicant.data?.ARRaw ?? 0,
      songDataReplicant.data?.ODRaw ?? 0,
      songDataReplicant.data?.lengthRaw ?? 0,
      mappoolMap?.value?.mods ?? songDataReplicant.data?.mods ?? ""
  )
})

const mapSlotActive = ref(false);
const mapSlotAnimatingOut = ref(false);

watch(() => mappoolMap.value?.identifier, async (newIdentifier, _) => {
  if (newIdentifier) {
    // Map is present - animate in
    console.log(`got a new identifier: ${newIdentifier}`);
    mapSlotActive.value = true
    mapSlotAnimatingOut.value = false
  } else {
    // Map is not present
    if (mapSlotActive.value) {
      // Was previously active, animate out

      // fixme: this seems to be broken atm?
      mapSlotActive.value = false;
      mapSlotAnimatingOut.value = true;
      await delay(3500)
      mapSlotAnimatingOut.value = false;
    }
  }
}, {immediate: true})
</script>

<template>
  <div class="main">
    <div class="header">
      <div class="header-square-accent-container">
        <div class="header-square inner"></div>
        <div class="header-square outer"></div>
      </div>
      <div class="header-team red">
        <div class="team-border red">
          <div class="team-seed" id="red_seed">SEED {{ team_seeds[0] }}</div>
        </div>
        <div class="team-text red">
          <div class="team-name">
            <div class="team-flag" id="red_flag" :style="{ backgroundImage: `url(${team_flags[0]})` }"></div>
            <div class="team-name-text" id="red_name">{{ tourneyDataReplicant.data?.teamName?.left ?? 'loading...' }}</div>
          </div>
          <div class="team-points red" id="red_points" :style="{ opacity: tourneyDataReplicant.data?.starsVisible === true ? 1 : 0 }">
            <div class="team-point red"
                 v-for="i in firstTo"
                 :class="{'filled': (tourneyDataReplicant.data?.stars.left ?? 0) >= i}"
                 :key="`starRed${i}`"
                 :id="`red${i}`" />
          </div>
        </div>
      </div>
      <div class="header-middle">
        <div class="logo"></div>
        <div class="stage-container" id="stage_container">
          <div class="stage-background"></div>
          <div id="stage" class="stage"></div>
        </div>
      </div>
      <div class="header-team blue">
        <div class="team-text blue">
          <div class="team-name">
            <div class="team-name-text" id="blue_name">{{ tourneyDataReplicant.data?.teamName?.right ?? 'loading...' }}</div>
            <div class="team-flag" id="blue_flag" :style="{ backgroundImage: `url(${team_flags[1]})` }"></div>
          </div>
          <div class="team-points blue" id="blue_points" :style="{ opacity: tourneyDataReplicant.data?.starsVisible === true ? 1 : 0 }">
            <div class="team-point blue"
                 v-for="i in firstTo"
                 :class="{'filled': (tourneyDataReplicant.data?.stars.right ?? 0) >= i}"
                 :key="`starBlue${i}`"
                 :id="`blue${i}`" />
          </div>
        </div>
        <div class="team-border blue">
          <div class="team-seed" id="blue_seed">SEED {{ team_seeds[1] }}</div>
        </div>
      </div>
    </div>
    <div class="gameplay-area"></div>
    <div class="footer">
      <div class="footer-edge left"></div>
      <div class="footer-middle">
        <div class="score-area" id="score_area">
          <div class="lead-bar" id="lead_bar"></div>
          <div class="team-scores-container">
            <div class="team-scores">
              <div class="team-score red" id="score_red">0</div>
              <div class="team-score blue" id="score_blue">0</div>
            </div>
            <div class="score-diff-container">
              <div class="score-diff-side red" id="score_diff_red">
                <i class="fa-solid fa-caret-left"></i>
              </div>
              <div class="score-diff" id="score_diff" data-before="" data-after="">0</div>
              <div class="score-diff-side blue" id="score_diff_blue">
                <i class="fa-solid fa-caret-right"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom-footer">
          <div class="beatmap-container">
            <div class="beatmap-background-container">
              <div id="beatmap_slot_container"
                   class="beatmap-slot-container visible"
                   :class="{ 'map-slot-in': mapSlotActive, 'map-slot-out': mapSlotAnimatingOut }">
                <div class="beatmap-slot" id="beatmap_slot">{{ mappoolMap?.identifier }}</div>
              </div>
              <!-- TODO: use local path for cover image instead of remote asset -->
              <div class="beatmap-image" id="beatmap_image" :style="{ backgroundImage: `url(${songDataReplicant.data?.coverUrl})`}"></div>
              <div class="picked-by-container" id="picked_by_container">
                <div class="picked-by-text" id="picked_by">PICKED BY</div>
              </div>
            </div>
          </div>
          <div class="beatmap-stats-container">
            <div class="beatmap-title-container">
              <div class="beatmap-title" id="title">{{ songDataReplicant.data?.artist ?? 'unknown' }} - {{ songDataReplicant.data?.title ?? 'unknown' }}</div>
              <div class='beatmap-subtitle' id='subtitle'>[{{ songDataReplicant.data?.difficulty ?? 'unknown' }}] by {{ mappoolMap?.mapper || songDataReplicant.data?.creator || 'unknown' }}</div>
            </div>
            <div class="beatmap-attributes-container">
              <div class="beatmap-attribute">
                <div class="beatmap-attribute__title">CS</div>
                <div class="beatmap-attribute__value" id="cs">{{ (Math.round(mapStatsAfterMods.cs * 10) / 10).toFixed(1) }}</div>
              </div>
              <div class="beatmap-attribute">
                <div class="beatmap-attribute__title">AR</div>
                <div class="beatmap-attribute__value" id="ar">{{ (Math.round(mapStatsAfterMods.ar * 10) / 10).toFixed(1) }}</div>
              </div>
              <div class="beatmap-attribute">
                <div class="beatmap-attribute__title">OD</div>
                <div class="beatmap-attribute__value" id="od">{{ (Math.round(mapStatsAfterMods.od * 10) / 10).toFixed(1) }}</div>
              </div>
              <div class="beatmap-attribute">
                <div class="beatmap-attribute__title">BPM</div>
                <div class="beatmap-attribute__value" id="bpm">{{ mappoolMap?.bpm ?? 0 }}</div>
                <!-- NOTE: BPM is fetched from static json instead of being calculated via mods-->
              </div>
              <div class="beatmap-attribute">
                <div class="beatmap-attribute__title">LEN</div>
                <div class="beatmap-attribute__value" id="length">{{ formatLength(mapStatsAfterMods.length) }}</div>
              </div>
              <div class="beatmap-attribute">
                <div class="beatmap-attribute__title">SR</div>
                <div class="beatmap-attribute__value"><span id="sr">{{ mappoolMap?.sr ?? 0 }}</span><i class="fa-solid fa-star"></i></div>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-container" id="chat_container">
          <div class="chat-inner-container">
            <div class="chat-title">CHAT</div>
            <div class="chat" id="chat"></div>
          </div>
          <div class="chat-timer-container" id="timer_container">
            <div class="chat-timer__progress-container">
              <div class="chat-timer__progress" id="timer_progress"></div>
            </div>
            <div class="hourglass-container" id="hourglass_container">
              <i class="fa-solid fa-hourglass-start" id="hourglass"></i>
            </div>
          </div>
        </div>

      </div>
      <div class="footer-edge right"></div>
    </div>
  </div>
</template>

<style scoped>
:global(:root) {
  --border-width: 0px;
  --border-color: none;
}

:global(body), :global(html) {
  padding: 0;
  margin: 0;
  /* overflow-y: hidden; */
  font-family: 'Din';
}

.main {
  position: relative;
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: column;
  /* background-image: url('../_shared/assets/base_bg.png'); */
  background-color: var(--light);
  overflow: hidden;
  color: var(--dark);
  z-index: 0;
}

.header {
  position: relative;
  width: 100%;
  height: calc(160px - var(--border-width));
  border-bottom: var(--border-width) solid var(--border-color);
  display: flex;
  justify-content: space-between;
  font-size: 3rem;
  z-index: 1;
}

.header-square-accent-container {
  position: absolute;
  top: 10px;
  width: 100%;
  height: calc(100% - 20px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  pointer-events: none;
}

.header-square {
  position: absolute;
  width: 400px;
  aspect-ratio: 1;
  border: 12px solid var(--dark);
  transform: rotate(26deg);
}

.header-square.outer {
  width: 500px;
  border: 12px solid var(--accent);
}

.header-team {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.header-team.blue {
  justify-content: flex-end;
}

.team-border {
  font-size: 1.4rem;
  writing-mode: vertical-lr;
  text-orientation: sideways;
  height: calc(100% - 40px);
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-weight: bold;
  letter-spacing: 1px;
  color: var(--light);
  background-color: var(--dark);
  border-left: 20px solid var(--accent);
}

.team-border.red {
  margin-left: 20px;
  transform: rotate(180deg);
}

.team-border.blue {
  margin-right: 20px;
}

.team-text {
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 4px;
  font-size: 3.6rem;
}

.team-text.red {
  padding-left: 20px;
}

.team-text.blue {
  align-items: flex-end;
  padding-right: 20px;
}

.team-flag {
  width: 70px;
  height: 47px;
  background-image: url('@4wc-stream-overlay/assets/flags/XX.png');
}

.team-name {
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-points {
  display: flex;
  gap: 8px;
  opacity: 1;
  transition: opacity 300ms ease;
}

.team-points.blue {
  flex-direction: row-reverse;
}

.team-point {
  width: 24px;
  height: 24px;
  border: 6px solid var(--dark);
  transition: 300ms ease;
}

.team-point.red {
  border: 6px solid var(--red);
}

.team-point.blue {
  border: 6px solid var(--red);
}

.team-point.filled.red {
  background-color: var(--red);
}

.team-point.filled.blue {
  background-color: var(--red);
}

.header-middle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  height: 100%;
}

.logo {
  width: 80px;
  height: 80px;
  background-image: url('@4wc-stream-overlay/assets/logo.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 16px;
}

.stage-container {
  position: relative;
}

.stage-background {
  position: absolute;
  width: 100%;
  height: 24px;
  background-color: var(--accent);
  transform: skew(-25deg) translateY(8px);
}

.stage-text-container {
  background-color: var(--accent);
}

.stage {
  position: relative;
  color: var(--light);
  padding-left: 16px;
  padding-right: 20px;
  font-size: 2.3rem;
  margin-bottom: 1px;
  letter-spacing: 3px;
  font-weight: 700;
  z-index: 10;
  text-transform: uppercase;
}

.stage.qf {
  font-family: 'Mont';
  font-size: 2.2rem;
  letter-spacing: 2px;
  transform: translateY(-3px);
}


.gameplay-area {
  width: 100%;
  height: 720px;
  /* background-color: #111111; */
}

.footer {
  position: relative;
  border-top: var(--border-width) solid var(--border-color);
  width: 100%;
  height: calc(200px - var(--border-width));
  color: var(--accent);
  display: flex;
  justify-content: space-between;
}

.footer-edge {
  height: 100%;
  width: 40px;
  background-color: var(--dark);
}

.footer-edge.left {
  border-right: 20px solid var(--accent);
}

.footer-edge.right {
  border-left: 20px solid var(--accent);
}

.footer-middle {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.score-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Noto Sans';
  opacity: 1;
  transition: opacity 300ms ease;
}

.top-footer {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Noto Sans';
  font-variant-numeric: tabular-nums;
}

.team-scores {
  margin-top: 24px;
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  font-size: 2.4rem;
  line-height: 2.4rem;
  gap: 24px;
}

.team-score {
  height: 2.8rem;
  width: 16rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--dark);
  font-weight: 800;
}

.team-score.red {
  justify-content: flex-end;
}

.team-score.blue {
  justify-content: flex-start;
}

.winning {
  font-weight: 900;
  font-size: 2.6rem;
  line-height: 2.6rem;
}

.score-diff-container {
  font-size: 1.2rem;
  font-weight: 900;
  display: flex;
  justify-content: center;
  color: var(--accent);
}

.score-diff {
  opacity: 1;
  transition: opacity 300ms ease;
}

.score-diff-side {
  opacity: 0;
  margin: 0 8px;
  font-size: 1.1em;
  transform: translateY(-1px);
  transition: opacity 300ms ease;
}

.score-diff-side.visible {
  opacity: 1;
}

.lead-bar {
  position: absolute;
  height: 20px;
  width: 0;
  background-color: var(--accent);
  left: calc(1800px / 2);
  transition: width 300ms ease;
}

.lead-bar.red {
  left: unset;
  right: calc(1800px / 2);
}

.lead-bar.blue {
  left: calc(1800px / 2);
  right: unset;
}

.lead-bar.red::before {
  content: '';
  border-top: 20px solid var(--accent);
  border-left: 10px solid transparent;
  position: absolute;
  left: -10px;
}

.lead-bar.blue::after {
  content: '';
  border-top: 20px solid var(--accent);
  border-right: 10px solid transparent;
  position: absolute;
  right: -10px;
}

.bottom-footer {
  display: flex;
  gap: 10px;
  height: 80px;
  color: var(--dark);
  padding: 10px;
}

.beatmap-container {
  position: relative;
  --border-width: 4px;
  border: var(--border-width) solid var(--accent);
  background-color: var(--dark);
  width: 400px;
  height: calc(100% - 2 * var(--border-width));
}

.beatmap-background-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.beatmap-slot-container {
  position: absolute;
  height: 100%;
  width: 44px;
  background-color: var(--accent);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: 700;
  transform: translateX(-44px);
  z-index: 10;
  color: var(--light);
}

.beatmap-slot {
  writing-mode: vertical-lr;
  text-orientation: sideways;
  transform: rotate(180deg);
  padding-left: 4px;
}

.picked-by-container {
  position: absolute;
  bottom: 0;
  right: 0;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--accent);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
  transform: translateY(25px);
  /* animation: pickerIn 300ms 1000ms ease forwards; */
}

.picked-by-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--light);
  padding: 0 8px;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
  transform: translateX(1px) translateY(1px);
}

.beatmap-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: saturate(70%) brightness(90%);
}


/* .picked-by {
	position: absolute;
	bottom: 0;
	right: 0;
	font-size: 1.2rem;
	text-transform: uppercase;
	letter-spacing: 0px;
	font-weight: 700;
	background-color: var(--accent);
	padding-top: 4px;
	padding-left: 12px;
	padding-right: 8px;
	opacity: 0;
	transition: opacity 300ms ease, background-color 300ms ease;
}

.picked-by.red {
	background-color: var(--red);
}

.picked-by.blue {
	background-color: var(--blue);
} */

.beatmap-stats-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.beatmap-title-container {
  display: flex;
  flex-direction: column;
}

.beatmap-title {
  font-size: 1.8rem;
  font-weight: 800;
}

.beatmap-subtitle {
  font-size: 1rem;
  font-weight: 600;
}

.beatmap-attributes-container {
  display: flex;
  gap: 12px;
  font-weight: 600;
  font-size: 1.2rem;
}

.beatmap-attribute {
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.beatmap-attribute__value {
  font-size: 1.3em;
  font-weight: 700;
  transform: translateY(1px);
  color: var(--accent);
}

.beatmap-attribute__value i {
  font-size: 0.7em;
  margin-left: 3px;
  transform: translateY(-3px);
}

.stats-container {
  width: 980px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  font-size: 1.2rem;
  margin-bottom: 9px;
  gap: 2px;
}

.stats-section {
  display: flex;
  gap: 12px;
  margin-left: 10px;
}

.title {
  font-size: 1.7rem;
  line-height: 1.7rem;
  font-weight: 700;
  margin-bottom: 2px;
  width: 980px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat {
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.stat-value {
  color: var(--accent);
  font-size: 1.6rem;
  line-height: 1.6rem;
  font-weight: 700;
  transform: translateY(1px);
}

/*--------------*/
/*     CHAT     */
/*--------------*/

.chat-container {
  position: absolute;
  bottom: 0;
  right: 0;
  height: 100%;
  width: 708px;
  color: var(--light);
  transform: translateX(100%);
}

.chat-inner-container {
  position: relative;
  width: 700px;
  height: 100%;
  background-color: var(--dark);
  border-left: 8px solid var(--accent);
  z-index: 5;
  overflow: hidden;
}

.chat-title {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--accent);
  padding: 4px 24px;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
}

.chat {
  padding: 10px;
  height: calc(100% - 2 * 10px);
  overflow: hidden;
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
  line-height: 1.32rem;
  transition: height 300ms ease, padding 300ms ease;
}

.chat-message {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.3rem;
}

.chat-message:nth-of-type(n+9) {
  display: none;
}

.chat-message.bot {
  background-color: var(--accent);
  padding: 2px 0;
  margin: 2px 0;
  color: var(--light);
}

.chat-name {
  font-weight: 700;
  color: var(--unknown-chat);
  white-space: nowrap;
}

.red>.chat-name {
  color: var(--red-chat);
}

.blue>.chat-name {
  color: var(--blue-chat);
}

.bot>.chat-name {
  color: var(--light);
}

.chat-name::after {
  content: ':';
  margin-right: 4px;
}

.chat-time {
  display: flex;
  justify-content: center;
  width: 40px;
  min-width: 40px;
  font-size: 1rem;
  text-align: center;
  color: var(--text-dark);
  transform: translateY(1px);
}

.chat-timer-container {
  position: absolute;
  height: 100%;
  width: 32px;
  bottom: 0;
  right: 100%;
  display: flex;
  flex-direction: column;
  transform: translateX(32px);
  transition: transform 300ms ease;
  z-index: 1;
}

.chat-timer-container.visible {
  transform: translateX(0);
}

.chat-timer__progress-container {
  width: 100%;
  height: 100%;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.chat-timer__progress {
  width: 100%;
  height: 100%;
  right: 0;
  bottom: 0;
  background-color: var(--accent);
  animation: none;
}

.hourglass-container {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: var(--accent);
}

.hourglass-container i {
  animation: spin, spinback;
  animation-delay: 1s, 1s;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}

/*Scrollbar*/
:global(::-webkit-scrollbar) {
  width: 0px;
  visibility: 0;
}

/* Track */
:global(::-webkit-scrollbar-track) {
  margin-top: 25px;
  margin-bottom: 25px;
  visibility: 0;
}

/* Handle */
:global(::-webkit-scrollbar-thumb) {
  background: grey;
  border-radius: 10px;
}
</style>

<style>
@keyframes spin {
  100% {
    transform: rotate(180deg)
  }
}

@keyframes spinback {
  0% {
    transform: rotate(181deg)
  }

  100% {
    transform: rotate(360deg)
  }
}

@keyframes progress {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(calc(100% - 32px));
  }
}

@keyframes progress_blink {
  0% {
    background-color: var(--accent);
  }

  15% {
    background-color: var(--light);
  }

  100% {
    background-color: var(--accent);
  }
}

@keyframes chatIn {
  from {
    transform: translateX(calc(100% + 60px + 32px));
  }

  to {
    transform: translateX(60px);
  }
}

@keyframes pickerIn {
  from {
    transform: translateY(25px);
  }

  to {
    transform: translateY(0px);
  }
}

.map-slot-in {
  animation: mapSlotIn 300ms 50ms ease forwards;
}

.map-slot-out {
  animation: mapSlotIn 300ms ease forwards reverse;
}

@keyframes mapSlotIn {
  from {
    transform: translateX(-44px);
  }

  to {
    transform: translateX(0px);
  }
}
</style>
