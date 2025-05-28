<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';

const bansCount = ref(0);
const autopickEnable = ref(false);
const nextPickColor = ref('red');

const toggleNextPickColor = () => {
  nextPickColor.value = nextPickColor.value === 'red' ? 'blue' : 'red';
};

const tournamentPickBansSettingsReplicant = useReplicant('tournamentPickBansSettings');

watch(tournamentPickBansSettingsReplicant, () => {
  const { data } = tournamentPickBansSettingsReplicant;
  if (data?.autopick && !tournamentPickBansSettingsReplicant.changed) {
    autopickEnable.value = data.autopick.enabled;
  }
}, { immediate: true });

watch(autopickEnable, () => {
  const { data } = tournamentPickBansSettingsReplicant;

  if (!data?.autopick) return;

  data.autopick.enabled = autopickEnable.value;
  tournamentPickBansSettingsReplicant.save();
});

const isLoaded = computed(() => tournamentPickBansSettingsReplicant.data);
</script>

<template>
  <div class="q-pa-md" v-if="isLoaded">
    <q-list>
      <q-item tag="label" v-ripple="false">
        <q-item-section>
          <q-item-label>Enable autopick</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle size="md" color="green" v-model="autopickEnable" />
        </q-item-section>
      </q-item>
      <q-item tag="label" v-ripple="false">
        <q-tooltip>Autopick won't activate until this number of bans has been set</q-tooltip>
        <q-item-section>
          <q-item-label>Number of bans</q-item-label>
        </q-item-section>
       <q-item-section>
         <q-slider
             v-model="bansCount"
             :min="0"
             :max="4"
             :step="2"
             snap
             label
             label-always
             switch-label-side
             marker-labels
             color="orange"
         />
       </q-item-section>
      </q-item>
      <q-item tag="label" v-ripple="false" clickable @click="toggleNextPickColor">
        <q-tooltip>Click to change next pick color</q-tooltip>
        <q-item-section>
          <q-item-label>Next pick color</q-item-label>
        </q-item-section>
        <q-item-section thumbnail>
          <q-item-label style="font-weight: bold; padding: 2px 8px" :style="{ backgroundColor: nextPickColor }">
            {{ nextPickColor.toUpperCase() }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>

</template>

<style scoped>

</style>
