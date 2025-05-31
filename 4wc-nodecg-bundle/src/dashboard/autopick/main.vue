<script setup lang="ts">
import { computed, Ref, ref, watch } from 'vue';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import { PropertiesAutopickNextColor } from '@4wc-stream-overlay/types/schemas';

const bansCount = ref(0);
const autopickEnable = ref(false);
const nextPickColor: Ref<PropertiesAutopickNextColor> = ref('red');

const toggleNextPickColor = () => {
  nextPickColor.value = nextPickColor.value === 'red' ? 'blue' : 'red';
};

const tournamentPickBansSettingsReplicant = useReplicant('tournamentPickBansSettings');

watch(tournamentPickBansSettingsReplicant, () => {
  const { data } = tournamentPickBansSettingsReplicant;
  if (data?.autopick && !tournamentPickBansSettingsReplicant.changed) {
    autopickEnable.value = data.autopick.enabled;
    bansCount.value = data.autopick.requiredBans;
    nextPickColor.value = data.autopick.nextColor;
  }
}, { immediate: true });

watch([autopickEnable, bansCount, nextPickColor], () => {
  const { data } = tournamentPickBansSettingsReplicant;

  if (!data?.autopick) return;

  data.autopick.enabled = autopickEnable.value;
  data.autopick.requiredBans = bansCount.value;
  data.autopick.nextColor = nextPickColor.value;
  tournamentPickBansSettingsReplicant.save();
});

const isLoaded = computed(() => tournamentPickBansSettingsReplicant.data);
</script>

<template>
  <div class="q-pa-md" v-if="isLoaded">
    <q-list>
      <q-item tag="label" v-ripple="false">
        <q-item-section>
          <QItemLabel>Enable autopick</QItemLabel>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle size="md" color="green" v-model="autopickEnable" />
        </q-item-section>
      </q-item>
      <q-item tag="label" v-ripple="false">
        <q-tooltip>Autopick won't activate until this number of bans has been set</q-tooltip>
        <q-item-section>
          <QItemLabel>Number of bans</QItemLabel>
        </q-item-section>
       <q-item-section>
         <q-slider
             :model-value="bansCount"
             @change="val => { bansCount = val }"
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
          <QItemLabel>Next pick color</QItemLabel>
        </q-item-section>
        <q-item-section thumbnail>
          <QItemLabel style="font-weight: bold; padding: 2px 8px" :style="{ backgroundColor: nextPickColor }">
            {{ nextPickColor.toUpperCase() }}
          </QItemLabel>
        </q-item-section>
      </q-item>
    </q-list>
  </div>

</template>

<style scoped>

</style>
