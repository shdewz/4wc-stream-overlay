<script setup lang="ts">
import { PoolBeatmap } from '@4wc-stream-overlay/types/schemas';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import { computed } from 'vue';

interface Props {
  poolBeatmap: PoolBeatmap,
}
const props = defineProps<Props>();

const tournamentPickBansReplicant = useReplicant('tournamentPickBans');
const osuTourneyReplicant = useReplicant('osuTourney');

const thisMapPickBan = computed(() => tournamentPickBansReplicant.data?.[props.poolBeatmap.beatmap_id.toString()]);

const pickByLabelText = computed(() => {
  if (!thisMapPickBan.value) return '';

  const teamColor = thisMapPickBan.value.color;
  const teamName = teamColor === 'red' ? osuTourneyReplicant.data?.teamName.left : osuTourneyReplicant.data?.teamName.right;

  return thisMapPickBan.value.type === 'ban' ? `Banned by ${teamName}` : `Picked by ${teamName}`;
});

</script>

<template>
<div class="map" :id="`map-${poolBeatmap.identifier.toLowerCase()}`" :class="{ banned: thisMapPickBan?.type === 'ban', picked: thisMapPickBan?.type === 'pick', red: thisMapPickBan?.color === 'red', blue: thisMapPickBan?.color === 'blue' }">
  <div class="map-image" :style="{ backgroundImage: `url('https://assets.ppy.sh/beatmaps/${poolBeatmap.beatmapset_id}/covers/cover.jpg')` }" />

  <div class="map-content">
    <div class="picked-by-label" :id="`picked-by-label-${poolBeatmap.identifier}`" :class="{ picked: thisMapPickBan?.type === 'pick', banned: thisMapPickBan?.type === 'ban', red: thisMapPickBan?.color === 'red', blue: thisMapPickBan?.color === 'blue' }">
      {{ pickByLabelText }}
    </div>
    <div class="mod-icon" :class="{ [poolBeatmap.mods.toLowerCase()]: true, banned: thisMapPickBan?.type === 'ban' }">
      {{ poolBeatmap.identifier }}
    </div>
    <div class="map-stats">
      <div class="map-stats-section map-top">
        <div class="map-title">{{ poolBeatmap.artist }} - {{ poolBeatmap.title }}</div>
      </div>
      <div class="map-stats-section map-bottom">
        <div class="map-difficulty-container">
          <div class="map-difficulty">{{ poolBeatmap.difficulty }}</div>
        </div>
        <div class="map-mapper">{{ poolBeatmap.mapper }}</div>
      </div>
    </div>
  </div>

  <Transition name="blinker" type="animation">
    <div class="blink-overlay" v-if="thisMapPickBan?.type === 'pick'"></div>
  </Transition>
</div>
</template>

<style scoped>
/* bm.blink_overlay.css('animation', 'blinker 1s cubic-bezier(.36,.06,.01,.57) 300ms 8, slowPulse 5000ms ease-in-out 8000ms 18'); */
@keyframes blinker {
  5% {
    opacity: 0.35;
  }
}

@keyframes slowPulse {
  50% {
    opacity: 0.2;
  }
}

/*noinspection CssUnusedSymbol*/
.blinker-enter-active {
  animation: blinker 0.8s cubic-bezier(.36,.06,.01,.57) 300ms 8, slowPulse 5000ms ease-in-out 8000ms 18;
}

.blink-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--light);
  opacity: 0;
}

.map-difficulty {
  max-width: 170px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-difficulty-container {
  display: flex;
  overflow: hidden;
}

.map-difficulty-container::before {
  content: '['
}

.map-difficulty-container::after {
  content: ']'
}

.map-mapper::before {
  content: 'by ';
}

.map {
  position: relative;
  width: var(--map-width);
  height: var(--map-height);
  background-color: var(--dark);
  border: 4px solid;
  border-color: var(--border-default);
  display: flex;
  align-items: center;
  overflow: hidden;
  transition: 300ms ease;
}

.map.picked {
  border-color: var(--light);
}

.map.picked.red {
  border-color: var(--accent);
}

.map.picked.blue {
  border-color: var(--accent);
}

.map.banned {
  border-color: var(--border-banned);
  color: #8f8f8f;
}

.map-image {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--dark);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  filter: brightness(40%) grayscale(30%) blur(2px);
  transform: scale(1.2);
  z-index: 0;
}

.map-content {
  z-index: 1;
  display: flex;
  align-items: center;
}

.mod-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
  width: calc(var(--mod-width) - 2 * 12px);
  border: 2px solid var(--border-default);
  padding: 2px;
  font-size: 1.4rem;
  letter-spacing: 1px;
  font-weight: 700;
  background-color: var(--border-banned);
  color: var(--light);
  transition: border-color 300ms ease, background-color 300ms ease;
}

.mod-icon.nm {
  border-color: #5677b3;
  background-color: #3d5685;
}

.mod-icon.hd {
  border-color: #b9935a;
  background-color: #85663d;
}

.mod-icon.hr {
  border-color: #b95c5c;
  background-color: #853d3d;
}

.mod-icon.dt {
  border-color: #9b5cb9;
  background-color: #6b3d85;
}

.mod-icon.fm {
  border-color: #58ac6a;
  background-color: #3d7c4b;
}

.mod-icon.tb {
  border-color: #52949c;
  background-color: #396469;
}

.mod-icon.banned {
  color: #bebebe;
  border-color: #474747;
  background-color: #292929;
}

.map-stats {
  display: flex;
  flex-direction: column;
}

.map-stats-section {
  display: flex;
  gap: 4px;
}

.map-top {
  font-size: 1.2rem;
  font-weight: 700;
}

.map-title {
  width: calc(var(--map-width) - var(--mod-width) - 8px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picked-by-label {
  overflow: hidden;
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--border-default);
  width: 0;
  padding: 0px 0px;
  text-transform: uppercase;
  font-weight: 700;
  transition: 300ms ease;
}

.picked-by-label.banned {
  width: auto;
  padding: 3px 10px 1px 12px;
  background-color: var(--border-banned);
  color: #fcfcfc;
}

.picked-by-label.picked {
  width: auto;
  padding: 3px 10px 1px 12px;
  background-color: var(--light);
  color: var(--border-banned);
}

.picked-by-label.picked.red {
  background-color: var(--accent);
  color: var(--light);
}

.picked-by-label.picked.blue {
  background-color: var(--accent);
  color: var(--light);
}
</style>
