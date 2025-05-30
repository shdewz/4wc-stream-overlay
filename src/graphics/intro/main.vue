<script setup lang="ts">
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import { computed } from 'vue';
import Countdown from './Countdown.vue';

const countdownReplicant = useReplicant('countdown');
const tournamentTeamsReplicant = useReplicant('tournamentTeams');

const isLoaded = computed(() => countdownReplicant.data != null);

const teams = computed(() => ({
  red: tournamentTeamsReplicant.data?.find((t) => t.team === countdownReplicant.data?.matches.players[0]),
  blue: tournamentTeamsReplicant.data?.find((t) => t.team === countdownReplicant.data?.matches.players[1]),
}));

const teamFlags = computed(() => ({
  red: new URL(`../../assets/flags/${teams.value.red?.flag ?? 'XX'}.png`, import.meta.url).href,
  blue: new URL(`../../assets/flags/${teams.value.blue?.flag ?? 'XX'}.png`, import.meta.url).href,
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
        <div class="title" id="title">COMING UP</div>
      </div>
      <div class="showcase" id="showcase"></div>
      <div class="teams" id="teams">
        <div class="team red">
          <div class="team-flag red" id="flag_red" :style="{ backgroundImage: `url(${teamFlags.red})` }"></div>
          <div class="team-name red" id="name_red">{{ teams.red?.team }}</div>
          <div class="team-players red" id="players_red">
            <div class="team-player" v-for="player in (teams.red?.players ?? []).sort((a, b) => (b.captain ? 1 : 0) - (a.captain ? 1 : 0))" :key="player.id">{{ player.username }}</div>
          </div>
        </div>
        <div class="vs">vs</div>
        <div class="team blue">
          <div class="team-name blue" id="name_blue">{{ teams.blue?.team }}</div>
          <div class="team-flag blue" id="flag_blue" :style="{ backgroundImage: `url(${teamFlags.blue})` }"></div>
          <div class="team-players blue" id="players_blue">
            <div class="team-player" v-for="player in (teams.blue?.players ?? []).sort((a, b) => (b.captain ? 1 : 0) - (a.captain ? 1 : 0))" :key="player.id">{{ player.username }}</div>
          </div>
        </div>
      </div>

      <Countdown v-if="countdownReplicant.data" class="timer" :time="countdownReplicant.data.time"
      />
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
  gap: 24px;
}

.teams {
  display: flex;
  color: var(--dark);
}

.team {
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: 50px auto;
  align-items: center;
  gap: 12px 24px;
}

.vs {
  padding: 0 24px;
  line-height: 3rem;
  font-style: italic;
}

.team-name {
  font-weight: 700;
  font-size: 3rem;
  display: flex;
  align-items: center;
}

.team-name.blue {
  justify-content: flex-end;
}

.showcase {
  font-weight: 700;
  font-size: 3rem;
  color: var(--dark);
  display: none;
}

.team.blue {
  align-items: flex-end;
  text-align: right;
}

.team-flag {
  justify-self: center;
  align-self: center;
  width: 70px;
  height: 47px;
  background-image: url('@4wc-stream-overlay/assets/flags/XX.png');
  filter: drop-shadow(0 0 12px rgba(0, 0, 0, 0.1));
}

.team-players {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 1.6rem;
}

.team-players.red {
  grid-column-start: 2;
}

.timer {
  width: 300px;
  display: flex;
  justify-content: center;
  text-align: center;
  font-size: 3rem;
  font-weight: 800;
  font-family: 'Noto Sans', sans-serif;
}
</style>
