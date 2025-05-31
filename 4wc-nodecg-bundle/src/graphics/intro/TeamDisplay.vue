<script setup lang="ts">
import { TournamentTeam } from '@4wc-stream-overlay/types/schemas';
import { computed } from 'vue';

interface Props {
  team: TournamentTeam | undefined,
  color: 'red' | 'blue'
}

const props = defineProps<Props>();

const teamFlag = computed(() => new URL(`../../assets/flags/${props.team?.flag ?? 'XX'}.png`, import.meta.url).href);
</script>

<template>
  <div class="team" :class="{ red: color === 'red', blue: color === 'blue' }">
    <template v-if="color === 'red'">
      <div class="team-flag red" :style="{ backgroundImage: `url(${teamFlag})` }"></div>
      <div class="team-name red">{{ team?.team }}</div>
      <div class="team-players red">
        <div class="team-player"
             v-for="player in (team?.players ?? []).sort((a, b) => (b.captain ? 1 : 0) - (a.captain ? 1 : 0))"
             :key="player.id">{{ player.username }}
        </div>
      </div>
    </template>

    <template v-if="color === 'blue'">
      <div class="team-name blue">{{ team?.team }}</div>
      <div class="team-flag blue" :style="{ backgroundImage: `url(${teamFlag})` }"></div>
      <div class="team-players blue">
        <div class="team-player"
             v-for="player in (team?.players ?? []).sort((a, b) => (b.captain ? 1 : 0) - (a.captain ? 1 : 0))"
             :key="player.id">{{ player.username }}
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
:global(body), :global(html) {
  padding: 0;
  margin: 0;
  overflow-y: hidden;
  font-family: 'Din', sans-serif;
}

.team {
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: 50px auto;
  align-items: center;
  gap: 12px 24px;
}

.team {
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: 50px auto;
  align-items: center;
  gap: 12px 24px;
}

.team.blue {
  align-items: flex-end;
  text-align: right;
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

.team-name {
  font-weight: 700;
  font-size: 3rem;
  display: flex;
  align-items: center;
}

.team-name.blue {
  justify-content: flex-end;
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
</style>
