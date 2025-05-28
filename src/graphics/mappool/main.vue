<script setup lang="ts">
// const obsGetCurrentScene = window.obsstudio?.getCurrentScene ?? (() => {});
// const obsGetScenes = window.obsstudio?.getScenes ?? (() => {});
// const obsSetCurrentScene = window.obsstudio?.setCurrentScene ?? (() => {});
// const obsGetControlLevel = window.obsstudio?.getControlLevel ?? (() => {});
//
// window.addEventListener('contextmenu', (e) => e.preventDefault());
//

//
// let socket = new ReconnectingWebSocket('ws://' + location.host + '/ws');
//
// socket.onopen = () => { console.log('Successfully Connected'); };
// socket.onclose = event => { console.log('Socket Closed Connection: ', event); socket.send('Client Closed!'); };
// socket.onerror = error => { console.log('Socket Error: ', error); };
//
// let gameState;
// let hasSetup = false;
// let lastPicked = null;
// let redName = 'Red Team', blueName = 'Blue Team';
// let tempMapID = 0;
// let currentPicker = 'red';
// let enableAutoPick = false;
// let selectedMaps = [];
//
// const sceneCollection = document.getElementById('sceneCollection');
// let autoadvance_button = document.getElementById('autoAdvanceButton');
// autoadvance_button.style.backgroundColor = '#fc9f9f';  // default to off
//
// let autoadvance_timer_container = document.getElementById('autoAdvanceTimer');
// let autoadvance_cancel_transition = document.getElementById('cancelAdvanceButton');
// let autoadvance_timer_label = document.getElementById('autoAdvanceTimerLabel');
// let autoadvance_timer_time = new CountUp('autoAdvanceTimerTime', 10, 0, 1, 10, {useEasing: false, suffix: 's'});
// autoadvance_timer_container.style.opacity = '0';
// autoadvance_cancel_transition.style.opacity = '0';
//
// let enableAutoAdvance = false;
// let sceneTransitionTimeoutID;
// let lastState;
// const gameplay_scene_name = 'gameplay';
// const mappool_scene_name = 'mappool';
// let selectedMapsTransitionTimeout = {};
// const pick_to_transition_delay_ms = 10000;
//
// /**
//  * @typedef {number} Level - The level of permissions.
//  * 0 for NONE,
//  * 1 for READ_OBS (OBS data),
//  * 2 for READ_USER (User data),
//  * 3 for BASIC,
//  * 4 for ADVANCED
//  * 5 for ALL
//  */
// obsGetControlLevel(level => {
//   // don't display auto advance if access level to OBS isn't sufficient
//   if (level < 4) {
//     document.getElementById('autoAdvanceSection').style.display='none';
//   }
// })
//
// obsGetScenes(scenes => {
//   if (scenes === null) {
//     return;
//   }
//
//   for (const scene of scenes) {
//     let clone = document.getElementById('sceneButtonTemplate').content.cloneNode(true);
//     let buttonNode = clone.querySelector('div');
//     buttonNode.id = `scene__${scene}`;
//     buttonNode.textContent = `GO TO: ${scene}`;
//     buttonNode.onclick = function() { obsSetCurrentScene(scene); };
//     sceneCollection.appendChild(clone);
//   }
//
//   obsGetCurrentScene((scene) => {
//     document.getElementById(`scene__${scene.name}`).classList.add('activeScene');
//   });
// });
//
// window.addEventListener('obsSceneChanged', function(event) {
//   let activeButton = document.getElementById(`scene__${event.detail.name}`);
//
//   for (const scene of sceneCollection.children) {
//     scene.classList.remove('activeScene');
//   }
//   activeButton.classList.add('activeScene');
//
// });
//
// class Beatmap {
//   constructor(beatmap) {
//     this.id = beatmap.beatmap_id;
//     this.beatmap = beatmap;
//   }
//   generate() {
//     this.parent = $('<div></div>').addClass('map').attr('id', `map-${this.beatmap.identifier.toLowerCase()}`);
//     this.parent.append($('<div></div>').addClass('map-image').css('background-image', `url('https://assets.ppy.sh/beatmaps/${this.beatmap.beatmapset_id}/covers/cover.jpg')`));
//
//     const content = $('<div></div>').addClass('map-content');
//     this.picked_by_label = $('<div></div>').addClass('picked-by-label').attr('id', `picked-by-label-${this.beatmap.identifier.toLowerCase()}`);
//     content.append(this.picked_by_label);
//     this.mod_icon = $('<div></div>').addClass(`mod-icon ${this.beatmap.mods.toLowerCase()}`).text(this.beatmap.identifier.toUpperCase());
//     content.append(this.mod_icon);
//
//     const stats = $('<div></div>').addClass('map-stats');
//     stats.append($('<div></div>').addClass('map-stats-section map-top').append($('<div></div>').addClass('map-title').text(`${this.beatmap.artist} - ${this.beatmap.title}`)));
//     const bottom = $('<div></div>').addClass('map-stats-section map-bottom');
//     bottom.append($('<div></div>').addClass('map-difficulty-container').append($('<div></div>').addClass('map-difficulty').text(this.beatmap.difficulty)));
//     bottom.append($('<div></div>').addClass('map-mapper').text(this.beatmap.mapper));
//     stats.append(bottom);
//     content.append(stats);
//     this.parent.append(content);
//
//     this.blink_overlay = $('<div></div>').addClass('blink-overlay');
//     this.parent.append(this.blink_overlay);
//     $(`#mod-container-${this.beatmap.mods.toLowerCase()}`).append(this.parent);
//   }
// }
//
// socket.onmessage = async (event) => {
//   let data = JSON.parse(event.data);
//
//   if (mappool && !hasSetup) setupBeatmaps();
//
//   if (redName !== data.tourney.manager.teamName.left && data.tourney.manager.teamName.left) {
//     redName = data.tourney.manager.teamName.left || 'Red Team';
//   }
//
//   if (blueName !== data.tourney.manager.teamName.right && data.tourney.manager.teamName.right) {
//     blueName = data.tourney.manager.teamName.right || 'Blue Team';
//   }
//
//   if (mappool && tempMapID !== data.menu.bm.id && data.menu.bm.id !== 0) {
//     if (tempMapID === 0) tempMapID = data.menu.bm.id;
//     else {
//       tempMapID = data.menu.bm.id;
//       let pickedMap = Array.from(beatmaps).find(b => b.id === tempMapID);
//       if (pickedMap && enableAutoPick && !selectedMaps.includes(tempMapID)) pickMap(pickedMap, currentPicker === 'red' ? redName : blueName, currentPicker);
//     }
//   }
//
//   await transitionToMappool(data);
// };
//
// /**
//  * checks conditions and attempts to transition from gameplay scene to mappool scene
//  * @param data GosuData data sent by ws
//  * @returns {Promise<void>}
//  */
// async function transitionToMappool(data) {
//   let newState = data.tourney.manager.ipcState;
//   if (enableAutoAdvance) {
//     if (lastState === TourneyState.Ranking && newState === TourneyState.Idle) {
//       sceneTransitionTimeoutID = setTimeout(() => {
//         obsGetCurrentScene((scene) => {
//           if (scene.name !== gameplay_scene_name)  // e.g. on winner screen
//             return
//           obsSetCurrentScene(mappool_scene_name);
//         });
//       }, 2000);
//     }
//     if (lastState !== newState && newState !== TourneyState.Idle) {
//       clearTimeout(sceneTransitionTimeoutID);
//     }
//   }
//   lastState = newState;
// }
//
// async function setupBeatmaps() {
//   hasSetup = true;
//   const maps = mappool.beatmaps;
//   if (!maps || maps.length == 0) return;
//
//   localStorage.setItem('current_pick', '');
//
//
//
//
//
//   for (const beatmap of maps) {
//     const bm = new Beatmap(beatmap);
//     bm.generate();
//     bm.parent.on('click', event => {
//       if (!event.originalEvent.shiftKey) event.originalEvent.ctrlKey ? banMap(bm, redName, 'red') : pickMap(bm, redName, 'red');
//       else resetMap(bm);
//     });
//     bm.parent.on('contextmenu', event => {
//       if (!event.originalEvent.shiftKey) event.originalEvent.ctrlKey ? banMap(bm, blueName, 'blue') : pickMap(bm, blueName, 'blue');
//       else resetMap(bm);
//     });
//     beatmaps.add(bm);
//   }
// }
//
// const getDataSet = (stored_beatmaps, beatmap_id) => stored_beatmaps.find(b => b.beatmap_id == beatmap_id) || null;
//
// const pickMap = (bm, teamName, color) => {
//   if (lastPicked !== null) lastPicked.blink_overlay.css('animation', 'none');
//   lastPicked = bm;
//   switchPick(color);
//
//   if (bm.beatmap.mods.includes('TB')) {
//     localStorage.setItem('current_pick', '');
//     bm.parent.addClass(`picked`).removeClass('banned red blue');
//     bm.picked_by_label.text('Tiebreaker').addClass(`picked`).removeClass('banned red blue');
//   }
//   else {
//     localStorage.setItem('current_pick', `${bm.id}/${color.toLowerCase()}`);
//     bm.parent.addClass(`picked ${color}`).removeClass(`banned ${opposite_team(color)}`);
//     bm.picked_by_label.text(`Picked by ${teamName}`).addClass(`picked ${color}`).removeClass(`banned ${opposite_team(color)}`);
//   }
//
//   bm.mod_icon.removeClass('banned');
//   bm.blink_overlay.css('animation', 'blinker 1s cubic-bezier(.36,.06,.01,.57) 300ms 8, slowPulse 5000ms ease-in-out 8000ms 18');
//   selectedMaps.push(bm.beatmapID);
//
//   if (enableAutoAdvance) {
//     // idempotent on pick color (none/red/blue). Consider making it idempotent on pick state? (not picked/picked)
//     if (selectedMapsTransitionTimeout[bm.beatmapID]?.color !== color) {
//       cancelAdvance();
//       clearTimeout(selectedMapsTransitionTimeout[bm.beatmapID]?.timeoutId)
//       const newTimeoutId = setTimeout(() => {
//         obsSetCurrentScene(gameplay_scene_name);
//         autoadvance_timer_container.style.opacity = '0';
//         autoadvance_cancel_transition.style.opacity = '0';
//       }, pick_to_transition_delay_ms);
//       selectedMapsTransitionTimeout[bm.beatmapID] = {
//         color: color,
//         timeoutId: newTimeoutId
//       };
//
//       autoadvance_timer_time = new CountUp('autoAdvanceTimerTime',
//           pick_to_transition_delay_ms / 1000, 0, 1, pick_to_transition_delay_ms / 1000,
//           {useEasing: false, suffix: 's'});
//       autoadvance_timer_time.start();
//       autoadvance_timer_container.style.opacity = '1';
//       autoadvance_timer_label.textContent = `Switching to ${gameplay_scene_name} in`;
//       autoadvance_cancel_transition.style.opacity = '1';
//
//
//       cancelAdvance = () => {
//         clearTimeout(newTimeoutId);
//         autoadvance_timer_container.style.opacity = '0';
//         autoadvance_cancel_transition.style.opacity = '0';
//       }
//     }
//   }
// }
//
// const banMap = (bm, teamName, color) => {
//   if (bm.beatmap.mods.includes('TB')) return;
//
//   bm.parent.addClass(`banned ${color}`).removeClass(`picked ${opposite_team(color)}`);
//   bm.picked_by_label.text(`Banned by ${teamName}`).addClass(`banned ${color}`).removeClass(`picked ${opposite_team(color)}`);
//   bm.blink_overlay.css('animation', 'none');
//   bm.mod_icon.addClass('banned');
//   selectedMaps.push(bm.beatmapID);
// }
//
// const resetMap = bm => {
//   localStorage.setItem('current_pick', '');
//
//   bm.parent.removeClass('banned picked red blue');
//   bm.picked_by_label.text('').removeClass('banned picked red blue');
//   bm.blink_overlay.css('animation', 'none');
//   bm.mod_icon.removeClass('banned');
//   selectedMaps = selectedMaps.filter(e => e !== bm.beatmapID);
// }
//
// const switchPick = color => {
//   currentPicker = color ? opposite_team(color) : opposite_team(currentPicker);
//   $('#current_pick').text(`${currentPicker.toUpperCase()} PICK`).addClass(currentPicker).removeClass(opposite_team(currentPicker));
// }
//
// const switchAutoPick = () => {
//   if (enableAutoPick) {
//     enableAutoPick = false;
//     $('#auto_pick').text('ENABLE AUTOPICK').removeClass('enabled');
//   }
//   else {
//     enableAutoPick = true;
//     $('#auto_pick').text('DISABLE AUTOPICK').addClass('enabled');
//   }
// }
//
// const switchAutoAdvance = () => {
//   if (enableAutoAdvance) {
//     enableAutoAdvance = false;
//     autoadvance_button.innerHTML = 'AUTO ADVANCE: OFF';
//     autoadvance_button.style.backgroundColor = '#fc9f9f';
//   }
//   else {
//     enableAutoAdvance = true;
//     autoadvance_button.innerHTML = 'AUTO ADVANCE: ON';
//     autoadvance_button.style.backgroundColor = '#9ffcb3';
//   }
// }
//
// var cancelAdvance = () => {
//   // do nothing at first, wait to have a cancel action assigned to it
// }
//
// const TourneyState = {
//   'Initialising': 0,
//   'Idle': 1,
//   'WaitingForClients': 2,
//   'Playing': 3,
//   'Ranking': 4,
// }

import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import BeatmapCard from './beatmap-card.vue';
import { computed } from "vue";

const tournamentMappoolReplicant = useReplicant('tournamentMappool');

const modPoolNames = computed(() => {
  const mods = tournamentMappoolReplicant.data?.beatmaps.map(b => b.mods) || [];
  return [...new Set(mods)];
});

</script>

<template>
  <div class="main">
    <div class="header"></div>
    <div class="mappool-container" id="mappool_container">
      <div v-for="modPoolName in modPoolNames"
           class="mod-container" :key="modPoolName" :id="`mod-container-${modPoolName.toLowerCase()}`">
        <BeatmapCard v-for="poolMap in tournamentMappoolReplicant.data?.beatmaps?.filter(m => m.mods === modPoolName)"
                     :key="poolMap.beatmap_id" :poolBeatmap="poolMap"/>
      </div>
    </div>
    <div class="footer"></div>
  </div>
<!--  <div class="controls">-->
<!--    <div class="current-picker control-item red" id="current_pick">RED PICK</div>-->
<!--    <div class="button switch-picker control-item" id="switch_picker" onclick="switchPick()">SWITCH PICK</div>-->
<!--    <div class="button auto-pick control-item" id="auto_pick" onclick="switchAutoPick()">ENABLE AUTOPICK</div>-->

<!--    <hr>-->

<!--    <div id="autoAdvanceSection">-->
<!--      <div id="autoAdvanceButton" class="button control-item" onclick="switchAutoAdvance()">AUTO ADVANCE: OFF-->
<!--      </div>-->
<!--      <div id="autoAdvanceTimer" class="control-label">-->
<!--        <span id="autoAdvanceTimerLabel"></span> <span id="autoAdvanceTimerTime"></span>-->
<!--      </div>-->
<!--      <div id="cancelAdvanceButton" class="button control-item" onclick="cancelAdvance()">Cancel transition</div>-->

<!--      <br/><br/>-->

<!--      <div class="control-label">Scenes<br>(click to override)</div><br>-->

<!--      <div id="sceneCollection">-->
<!--        <template id="sceneButtonTemplate">-->
<!--          <div class="button scene-button control-item">SWITCH TO __SCENE_NAME__</div>-->
<!--        </template>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
</template>

<style scoped>
:global(:root) {
  --map-width: 500px;
  --map-height: 56px;
  --mod-width: 78px;
  --border-default: #505050;
  --border-banned: #222222;
  --border-picked: var(--accent);
}

:global(body), :global(html) {
  padding: 0;
  margin: 0;
  /* overflow-y: hidden; */
  user-select: none;
  font-family: 'Din';
}

.main {
  position: relative;
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: column;
  /* background-image: url('../_shared/assets/temp_bg.png'); */
  color: var(--light);
}

.header {
  height: 160px;
}

.footer {
  height: 200px;
}

.mappool-container {
  flex: 1;
  max-height: 720px;
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.mod-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.controls {
  position: absolute;
  left: 1920px;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: bold;
  width: 220px;
}

.control-item {
  width: 100%;
  text-align: center;
}

.control-label {
  color: #bfbfbf;
  font-size: 20px;
  font-family: sans-serif;
}

.scene-button {
  width: 240px;
  height: 40px;
  margin-bottom: 12px;
  padding-left: 8px;
  font-size: 22px;
  display: flex;
  text-align: left;
  align-items: center;
  justify-content: left;
}

.activeScene {
  background-color: #3a8f29!important;
}

.current-picker {
  font-size: 2rem;
}

.current-picker.red {
  color: var(--accent);
}

.current-picker.blue {
  color: var(--accent);
}

.button {
  background-color: #d4d4d4;
  padding: 6px 8px;
}

.auto-pick {
  background-color: #ffa4a4;
}

.auto-pick.enabled {
  background-color: #b3ffa4;
}

</style>
