<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed, ref, watch } from 'vue';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import { QExpansionItem, QInput } from 'quasar';

useHead({ title: 'countdown' });

const scheduledMatchesReplicant = useReplicant('tournamentSchedule');
const matches = computed(() => scheduledMatchesReplicant.data ?? []);

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
const selectedMatchId = ref<string | null>(null);
const setMatchId = (matchId: string) => {
  // matchId is composed of matchTime:redFlag:blueFlag (matchTime in js timestamp, flags are 2-letter codes)
  selectedMatchId.value = matchId;

  const [matchTimestamp, redFlag, blueFlag] = matchId.split(':');
  const match = matches.value.find((m) => m.time.toString() === matchTimestamp && m.red_flag === redFlag && m.blue_flag === blueFlag);

  if (match) {
    // hardcoding these for TeamVS tournaments
    countdownReplicant.data!.matches.players = [match.red_team, match.blue_team];
    playersCount.value = 2;

    const matchTime = new Date(match.time);
    countdownReplicant.data!.time = matchTime.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  upcomingMatchExpansionItem.value?.hide();
};

const matchesLoading = ref(false);
const refreshMatches = () => {
  matchesLoading.value = true;
  nodecg.sendMessage('jsondata:fetch').finally(() => {
    matchesLoading.value = false;
  });
};

const streamerUsername = ref('');

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  const dayOfWeek = date.toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  });

  const timeOfDay = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });

  return `${dayOfWeek} ${timeOfDay} UTC`;
}
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
    <h4 v-if="countdownReplicant.data?.type === 'showcase'">not implemented yet for 4wc</h4>
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

      <div class="text-h6">Streamer username</div>
      <QInput
          class="q-pa-xs"
          filled
          v-model="streamerUsername"
          :label="`Matches will be filtered using this username`"
          dense
          :autofocus="false"/>

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
            matches.filter(m => m.time && (m.streamer === streamerUsername || streamerUsername === '' )).map((match) => ({
               label: `${formatTimestamp(match.time)}: ${match.red_team} VS ${match.blue_team} ${match.streamer ? '(' + match.streamer + ')' : ''}`,
               value: `${match.time}:${match.red_flag}:${match.blue_flag}`
            }))
          "
        />
      </QExpansionItem>
      <QBtn
        color="primary"
        label="Reload matches from schedule.json"
        class="full-width"
        :disable="matchesLoading"
        @click="refreshMatches()"
      />
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
