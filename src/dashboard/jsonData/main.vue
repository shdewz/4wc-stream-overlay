<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed, ref, watch } from 'vue';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import { QExpansionItem, QInput } from 'quasar';

useHead({ title: 'countdown' });

const poolReplicant = useReplicant('tournamentMappool');

const isLoaded = computed(() => poolReplicant.data !== undefined);


const entriesLoading = ref(false);
const refreshEntries = (sheetName?: string) => {
  entriesLoading.value = true;
  nodecg.sendMessage('jsondata:fetch', sheetName).finally(() => {
    entriesLoading.value = false;
  });
};

// const matchesReplicant = useReplicant('matches');
// const matches = computed(() => matchesReplicant.data ?? []);
//
// const countdownReplicant = useReplicant('countdown');
// const isLoaded = computed(() => countdownReplicant.data !== undefined);
//
// const targetTimeInput = ref<QInput>();
// const isTargetTimeValid = computed(() => targetTimeInput.value?.validate() as boolean);
//
// const time = ref('00:05:00');
// const timeInput = ref<QInput>();
// const isTimeValid = computed(() => timeInput.value?.validate() as boolean);
//
// function resetTime() {
//   const date = new Date();
//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//   countdownReplicant.data!.time = `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}:${`${date.getSeconds()}`.padStart(2, '0')}`;
// }
//
// function applyTime() {
//   resetTime();
//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//   let [clockHours, clockMinutes, clockSeconds] = countdownReplicant.data!.time.split(':').map(Number);
//   const [hours, minutes, seconds] = time.value.split(':').map(Number);
//
//   clockHours += hours;
//   clockMinutes += minutes;
//   clockSeconds += seconds;
//
//   while (clockSeconds >= 60) {
//     clockSeconds -= 60;
//     clockMinutes += 1;
//   }
//   while (clockMinutes >= 60) {
//     clockMinutes -= 60;
//     clockHours += 1;
//   }
//   while (clockHours >= 24) {
//     clockHours -= 24;
//   }
//
//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//   countdownReplicant.data!.time = `${`${clockHours}`.padStart(2, '0')}:${`${clockMinutes}`.padStart(2, '0')}:${`${clockSeconds}`.padStart(2, '0')}`;
// }
//
// const shoutcastersCount = ref(0);
// const playersCount = ref(0);
// watch(countdownReplicant, () => {
//   if (countdownReplicant.data && !countdownReplicant.changed) {
//     shoutcastersCount.value = countdownReplicant.data.shoutcasters.length;
//     playersCount.value = countdownReplicant.data.matches.players.length;
//   }
// });
// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// watch(shoutcastersCount, () => {
//   if (shoutcastersCount.value !== countdownReplicant.data!.shoutcasters.length) {
//     const shoutcasters = new Array(shoutcastersCount.value).fill('');
//     Object.assign(shoutcasters, countdownReplicant.data!.shoutcasters.slice(0, shoutcastersCount.value));
//     countdownReplicant.data!.shoutcasters = shoutcasters;
//   }
// });
// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// watch(playersCount, () => {
//   if (playersCount.value !== countdownReplicant.data!.matches.players.length) {
//     const shoutcasters = new Array(playersCount.value).fill('');
//     Object.assign(shoutcasters, countdownReplicant.data!.matches.players.slice(0, playersCount.value));
//     countdownReplicant.data!.matches.players = shoutcasters;
//   }
// });
//
// const upcomingMatchExpansionItem = ref<QExpansionItem>();
// const selectedMatchId = ref<number | null>(null);
// const setMatchId = (matchId: number) => {
//   selectedMatchId.value = matchId;
//   const match = matches.value.find((m) => m.id === matchId)!;
//   countdownReplicant.data!.shoutcasters = match.shoutcasters;
//   shoutcastersCount.value = match.shoutcasters.length;
//   countdownReplicant.data!.matches.players = match.players.map((p) => p.name ?? '');
//   playersCount.value = match.players.length;
//   const matchTime = match.schedule?.match(/\d\d:\d\d/)?.[0].replaceAll('h', ':');
//   if (matchTime) {
//     countdownReplicant.data!.time = `${matchTime}:00`;
//   }
//   upcomingMatchExpansionItem.value?.hide();
// };
//
// const matchesLoading = ref(false);
// const refreshMatches = () => {
//   matchesLoading.value = true;
//   nodecg.sendMessage('matches:fetch').finally(() => {
//     matchesLoading.value = false;
//   });
// };
</script>

<template>
  <div v-if="isLoaded">
    <h6 class="q-ma-none">Mappool</h6>
    <QBtn
        color="primary"
        label="Refresh Default Sheet"
        class="full-width q-mb-sm"
        :disable="entriesLoading"
        @click="refreshEntries('default')"
    />
    <div>
      {{ poolReplicant.data }}
    </div>
  </div>
</template>
