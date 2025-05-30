<script setup lang="ts">
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import { computed } from 'vue';
import TeamDisplay from '@4wc-stream-overlay/graphics/intro/TeamDisplay.vue';

const tournamentMappoolReplicant = useReplicant('tournamentMappool');
const tournamentTeamsReplicant = useReplicant('tournamentTeams');
const osuTourneyReplicant = useReplicant('osuTourney');
const osuSongReplicant = useReplicant('osuSong');

// noinspection JSIncompatibleTypesComparison
const isLoaded = computed(() => tournamentMappoolReplicant.data != null);
const teams = computed(() => ({
  red: tournamentTeamsReplicant.data?.find((t) => t.team === osuTourneyReplicant.data?.teamName.left),
  blue: tournamentTeamsReplicant.data?.find((t) => t.team === osuTourneyReplicant.data?.teamName.right),
}));

const scores = computed(() => ({
  red: osuTourneyReplicant.data?.stars.left,
  blue: osuTourneyReplicant.data?.stars.right,
}));
</script>

<template>
  <div class="main" v-if="isLoaded">
    <div class="logo-container">
      <div class="logo"></div>
      <div class="logo-text">4 Digit World Cup 2025</div>
    </div>
    <div class="match-container">
      <div class="title-container">
        <div class="title-background"></div>
        <div class="title" id="title">{{ tournamentMappoolReplicant.data?.stage ?? 'WINNER' }}</div>
      </div>
      <div class="teams">
        <TeamDisplay :team="teams.red" color="red" />
        <div class="scores">
          <div class="score red" id="score_red">{{ scores.red }}</div>
          <div class="separator">-</div>
          <div class="score blue" id="score_blue">{{ scores.blue }}</div>
        </div>
        <TeamDisplay :team="teams.blue" color="blue" />
      </div>
    </div>
    <div class="song-container" id="song_container">

      <div class="note"><font-awesome-icon :icon="['fas', 'fa-music']"/></div>
      <Transition name="fade" mode="out-in">
        <div class="song-title-container" id="song_title_container" :key="osuSongReplicant.data?.title">
          <div class="song-artist">{{ osuSongReplicant.data?.artist }}</div>
          <div class="song-separator">-</div>
          <div class="song-title">{{ osuSongReplicant.data?.title }}</div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
:global(body), :global(html) {
  padding: 0;
  margin: 0;
  overflow-y: hidden;
  font-family: 'Din', sans-serif;
}

.main {
  position: relative;
  width: 1920px;
  height: 1080px;
  background-image: url('@4wc-stream-overlay/assets/base_bg.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 2rem;
}

.logo-container {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 20px;
  top: 60px;
  left: 120px;
  font-weight: 800;
  font-size: 2rem;
  color: var(--dark);
}

.logo {
  width: 64px;
  height: 64px;
  background-image: url('@4wc-stream-overlay/assets/logo.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
}

.title-container {
  position: relative;
}

.title-background {
  position: absolute;
  width: 100%;
  height: 30px;
  background-color: var(--accent);
  transform: skew(-25deg) translateY(11px);
}

.title {
  position: relative;
  color: var(--light);
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 3px;
  padding: 0 24px;
  text-transform: uppercase;
  z-index: 10;
}

.match-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.teams {
  display: flex;
  color: var(--dark);
}

.scores {
  padding: 0 24px;
  display: flex;
  gap: 12px;
  font-size: 3rem;
  line-height: 3rem;
}

.score {
  font-weight: 700;
}

.song-container {
  color: var(--dark);
  position: absolute;
  width: 100%;
  bottom: 40px;
  font-size: 1.7rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.song-title-container {
  display: flex;
  gap: 8px;
}

.note {
  font-size: 1.5rem;
}

.song-title {
  max-width: 800px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/*noinspection CssUnusedSymbol*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

/*noinspection CssUnusedSymbol*/
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
