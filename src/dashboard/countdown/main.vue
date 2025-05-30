<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed, ref, watch } from 'vue';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import { QExpansionItem, QInput } from 'quasar';

useHead({ title: 'countdown' });

// const matchesReplicant = useReplicant('matches');
// const matches = computed(() => matchesReplicant.data ?? []);
type MatchesReplicant = Match[];
interface Match {
  id: number | null;
  schedule: string | null;
  players: Player[];
  shoutcasters: string[];
  mpLink: string | null;
}
interface Player {
  name: string | null;
  score: number | 'FF' | null;
}
const matches = computed(() => [] as MatchesReplicant);

const countdownReplicant = useReplicant('countdown');
const isLoaded = computed(() => countdownReplicant.data !== undefined);

const targetTimeInput = ref<QInput>();
const isTargetTimeValid = computed(() => targetTimeInput.value?.validate() as boolean);

const time = ref('00:05:00');
const timeInput = ref<QInput>();
const isTimeValid = computed(() => timeInput.value?.validate() as boolean);

function resetTime() {
  const date = new Date();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  countdownReplicant.data!.time = `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}:${`${date.getSeconds()}`.padStart(2, '0')}`;
}

function applyTime() {
  resetTime();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let [clockHours, clockMinutes, clockSeconds] = countdownReplicant.data!.time.split(':').map(Number);
  const [hours, minutes, seconds] = time.value.split(':').map(Number);

  clockHours += hours;
  clockMinutes += minutes;
  clockSeconds += seconds;

  while (clockSeconds >= 60) {
    clockSeconds -= 60;
    clockMinutes += 1;
  }
  while (clockMinutes >= 60) {
    clockMinutes -= 60;
    clockHours += 1;
  }
  while (clockHours >= 24) {
    clockHours -= 24;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  countdownReplicant.data!.time = `${`${clockHours}`.padStart(2, '0')}:${`${clockMinutes}`.padStart(2, '0')}:${`${clockSeconds}`.padStart(2, '0')}`;
}

const shoutcastersCount = ref(0);
const playersCount = ref(0);
watch(countdownReplicant, () => {
  if (countdownReplicant.data && !countdownReplicant.changed) {
    shoutcastersCount.value = countdownReplicant.data.shoutcasters.length;
    playersCount.value = countdownReplicant.data.matches.players.length;
  }
});
/* eslint-disable @typescript-eslint/no-non-null-assertion */
watch(shoutcastersCount, () => {
  if (shoutcastersCount.value !== countdownReplicant.data!.shoutcasters.length) {
    const shoutcasters = new Array(shoutcastersCount.value).fill('');
    Object.assign(shoutcasters, countdownReplicant.data!.shoutcasters.slice(0, shoutcastersCount.value));
    countdownReplicant.data!.shoutcasters = shoutcasters;
  }
});
/* eslint-disable @typescript-eslint/no-non-null-assertion */
watch(playersCount, () => {
  if (playersCount.value !== countdownReplicant.data!.matches.players.length) {
    const shoutcasters = new Array(playersCount.value).fill('');
    Object.assign(shoutcasters, countdownReplicant.data!.matches.players.slice(0, playersCount.value));
    countdownReplicant.data!.matches.players = shoutcasters;
  }
});

const upcomingMatchExpansionItem = ref<QExpansionItem>();
const selectedMatchId = ref<number | null>(null);
const setMatchId = (matchId: number) => {
  selectedMatchId.value = matchId;
  const match = matches.value.find((m) => m.id === matchId)!;
  countdownReplicant.data!.shoutcasters = match.shoutcasters;
  shoutcastersCount.value = match.shoutcasters.length;
  countdownReplicant.data!.matches.players = match.players.map((p) => p.name ?? '');
  playersCount.value = match.players.length;
  const matchTime = match.schedule?.match(/\d\d:\d\d/)?.[0].replaceAll('h', ':');
  if (matchTime) {
    countdownReplicant.data!.time = `${matchTime}:00`;
  }
  upcomingMatchExpansionItem.value?.hide();
};

const matchesLoading = ref(false);
const refreshMatches = () => {
  matchesLoading.value = true;
  nodecg.sendMessage('matches:fetch').finally(() => {
    matchesLoading.value = false;
  });
};
</script>

<template>
  <div v-if="isLoaded">
    <div class="text-h6 q-mb-md">Countdown</div>
    <QInput
      ref="targetTimeInput"
      class="q-pb-none"
      filled
      v-model="countdownReplicant.data!.time"
      mask="fulltime"
      :rules="['fulltime']"
      label="Countdown time (clock)"
      dense
    >
      <template v-slot:append>
        <QIcon name="access_time" class="cursor-pointer" @click="resetTime()"/>
      </template>
    </QInput>
    <QExpansionItem label="Set countdown time (rather than clock)" dense class="q-my-md">
      <div class="row">
        <QInput
          ref="timeInput"
          class="col q-pb-none"
          filled
          v-model="time"
          mask="fulltime"
          :rules="['fulltime']"
          label="Countdown time"
          dense
          @keydown.enter="applyTime()"
        />
        <QBtn
          class="q-ml-md full-height"
          color="primary"
          label="Apply"
          @click="applyTime()"
          :disable="!isTimeValid"
        />
      </div>
    </QExpansionItem>

    <QSeparator class="q-my-md"/>
    <div class="text-h6">Type</div>

    <QOptionGroup
      :model-value="countdownReplicant.data?.type"
      @update:model-value="(type) => countdownReplicant.data!.type = type"
      inline
      :options="[
        {
          label: 'Showcase',
          value: 'showcase'
        },
        {
          label: 'Matches',
          value: 'matches'
        }
      ]"
    />

    <QSeparator class="q-my-md"/>
    <div v-if="countdownReplicant.data?.type === 'showcase'">
      <div class="text-h6">Next Round</div>

      <QInput
        filled
        type="textarea"
        v-model="countdownReplicant.data!.showcase.nextRound"
      />
    </div>
    <div v-else-if="countdownReplicant.data?.type === 'matches'">
      <div class="text-h6">Upcoming Players</div>

      <div class="q-px-md">
        <QSlider
          v-model="playersCount"
          :min="0"
          :max="4"
          :step="1"
          snap
          label
          marker-labels
          switch-marker-labels-side
        />
      </div>
      <div class="row">
        <transition-group
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <div
            class="col-6"
            v-for="(value, index) in new Array(4)"
            :key="index"
            v-show="index < playersCount"
          >
            <QInput
              class="q-pa-xs"
              filled
              v-model="countdownReplicant.data!.matches.players[index]"
              :label="`Player ${index + 1}`"
              dense
            />
          </div>
        </transition-group>
      </div>

      <QExpansionItem
        ref="upcomingMatchExpansionItem"
        label="Select Upcoming Match"
        dense
        class="q-my-md"
        @update:model-value="(shown) => selectedMatchId = shown ? null : selectedMatchId"
      >
        <QOptionGroup
          :model-value="selectedMatchId"
          @update:model-value="setMatchId"
          :options="
            matches.filter(m => m.id).map((match) => ({
              label: `${match.schedule} (${match.id}): ${match.players.map((p) => p.name).join(' vs. ')}`,
              value: match.id,
            }))
          "
        />
      </QExpansionItem>
      <QBtn
        color="primary"
        label="Refresh Matches"
        class="full-width"
        :disable="matchesLoading"
        @click="refreshMatches()"
      />
    </div>

    <QSeparator class="q-my-md"/>
    <div class="text-h6">Upcoming Shoutcasters</div>

    <div class="q-px-md">
      <QSlider
        v-model="shoutcastersCount"
        :min="0"
        :max="4"
        :step="1"
        snap
        label
        marker-labels
        switch-marker-labels-side
      />
    </div>
    <div class="row">
      <transition-group
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div
          class="col-6"
          v-for="(value, index) in new Array(4)"
          :key="index"
          v-show="index < shoutcastersCount"
        >
          <QInput
            class="q-pa-xs"
            filled
            v-model="countdownReplicant.data!.shoutcasters[index]"
            :label="`Shoutcaster ${index + 1}`"
            dense
          />
        </div>
      </transition-group>
    </div>

    <div class="q-mt-md">
      <QBtn
        color="green-10"
        label="Save"
        class="full-width q-mb-sm"
        @click="countdownReplicant.save()"
        :disable="!(countdownReplicant.changed && isTargetTimeValid)"
      />
      <QBtn
        color="red-10"
        label="Reset"
        class="full-width"
        @click="countdownReplicant.revert()"
      />
    </div>
  </div>
</template>
