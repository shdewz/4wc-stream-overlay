<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed, ref, watch } from 'vue';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import {
  QInput,
  QBtn,
  QToggle,
} from 'quasar';

useHead({ title: 'gosumemory' });

const gosumemoryReplicant = useReplicant('gosumemoryStatus');
const osuTourneyReplicant = useReplicant('osuTourney');
const currentOsuSongReplicant = useReplicant('osuSong');

watch(gosumemoryReplicant, () => {
  if (gosumemoryReplicant.changed) {
    gosumemoryReplicant.save();
  }
});

const open = () => {
  nodecg.sendMessage('gosumemory-open', gosumemoryReplicant.data?.wsUrl);
};
const close = () => {
  nodecg.sendMessage('gosumemory-close');
};

const printTournamentPlayers = () => {
  if (!osuTourneyReplicant.data || !osuTourneyReplicant.data.clients || osuTourneyReplicant.data.clients.length === 0) {
    console.error('No tournament data available or no players in lobby');
    return;
  }

  // Format player data
  const players = osuTourneyReplicant.data.clients.map((client, index) => {
    return {
      id: index + 1,
      // Note: Actual player names are not available in the osuTourneyReplicant
      name: `Player ${index + 1}`,
      score: client.score,
      unstableRate: client.unstableRate,
    };
  });

  // Create formatted output string
  let outputText = `===== TOURNAMENT PLAYERS (${players.length}) =====\n\n`;

  players.forEach(player => {
    outputText += `Player #${player.id}:\n`;
    outputText += `  Score: ${player.score}\n`;
    outputText += `  Unstable Rate: ${player.unstableRate.toFixed(2)}\n\n`;
  });

  // Print formatted string to console
  console.log(outputText);

  // Print the raw data as JSON for easier inspection
  console.log('Raw tournament data (JSON):',
    JSON.stringify(osuTourneyReplicant.data, null, 2)
  );

  // Show a message in the console as confirmation
  console.log(`Found ${players.length} players in tournament lobby. Data printed above.`);
};

const printCurrentMap = () => {
  if (!currentOsuSongReplicant.data) {
    console.error('No song available in lobby');
    return;
  }

  console.log(JSON.stringify(currentOsuSongReplicant.data, null, 2));
};
</script>

<template>
  <div v-if="gosumemoryReplicant.data">
    <div class="text-h6 q-mb-md">gosumemory Status</div>

    <QInput
      class="q-pa-xs"
      filled
      v-model="gosumemoryReplicant.data.wsUrl"
      label="WebSocket URL"
      dense
    />
    <div class="row">
      <div class="col">
        <QInput
          class="q-pa-xs"
          filled
          :model-value="`Status: ${gosumemoryReplicant.data.wsStatus}`"
          disable
          dense
        />
      </div>
      <div>
        <QBtn
          class="q-ma-xs"
          color="green-10"
          label="(RE)OPEN"
          @click="open"
        />
        <QBtn
          class="q-ma-xs"
          color="orange-10"
          label="CLOSE"
          @click="close"
          :disabled="gosumemoryReplicant.data.wsStatus === 'CLOSED'"
        />
      </div>
    </div>
    <QItem tag="label" v-ripple="false">
      <QItemSection>
        <QItemLabel>Auto-reconnect</QItemLabel>
      </QItemSection>
      <QItemSection avatar>
        <QToggle
            class="q-ma-xs"
            v-model="gosumemoryReplicant.data.automaticReconnect"
            dense
        />
      </QItemSection>
    </QItem>

    <QBtn
        class="q-ma-xs full-width"
        color="primary"
        label="PRINT PLAYERS TO CONSOLE"
        @click="printTournamentPlayers"
        :disabled="gosumemoryReplicant.data.wsStatus !== 'OPEN'"
    />
    <QBtn
        class="q-ma-xs full-width"
        color="primary"
        label="PRINT CURRENT MAP TO CONSOLE"
        @click="printCurrentMap"
        :disabled="gosumemoryReplicant.data.wsStatus !== 'OPEN'"
    />
  </div>
</template>
