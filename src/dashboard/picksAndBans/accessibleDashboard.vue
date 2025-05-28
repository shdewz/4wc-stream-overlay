<script setup lang="ts">
import { computed, ref } from 'vue';
import useSharedLogic from './useSharedLogic';

enum PickBanState {
  UNPICKED = 0,
  RED_PICK,
  BLUE_PICK,
  RED_BAN,
  BLUE_BAN,
}

const model = ref(PickBanState.UNPICKED);

const getButtonColor = (state: PickBanState) => {
  switch (state) {
    case PickBanState.RED_PICK:
      return 'red';
    case PickBanState.BLUE_PICK:
      return 'blue';
    case PickBanState.RED_BAN:
      return 'banned-red';
    case PickBanState.BLUE_BAN:
      return 'banned-blue';
    default:
      return 'dark';
  }
};

const { isLoaded,
  poolReplicant,
  pendingConfirm, checkConfirm, confirmResetPickBans,
  modPools, isMapBanned,
  poolMapAction } = useSharedLogic();

const poolMaps = computed(() => poolReplicant.data?.beatmaps ?? []);
</script>

<template>
  <div>
    <q-list dense>
      <q-item tag="label" v-ripple="false" v-for="poolMap in poolMaps" :key="poolMap.identifier">
        <div class="col-2 flex items-center">
          <q-item-label class="text-subtitle1 text-weight-bold">{{ poolMap.identifier }}</q-item-label>
        </div>
        <div class="col-10">
          <q-btn-toggle
              v-model="model"
              spread
              dense
              :toggle-color="getButtonColor(model)"
              :options="[
                  {label: 'Not picked', value: PickBanState.UNPICKED},
                  {label: 'Red pick', value: PickBanState.RED_PICK},
                  {label: 'Blue pick', value: PickBanState.BLUE_PICK},
                  {label: 'Red ban', value: PickBanState.RED_BAN},
                  {label: 'Blue ban', value: PickBanState.BLUE_BAN},
                ]"
          />
        </div>
      </q-item>
    </q-list>
  </div>
</template>

<style scoped>

</style>

<!--suppress CssUnusedSymbol -->
<style>
.bg-banned-red {
  background: #730b0b !important;
}

.bg-banned-blue {
  background: #0c3577 !important;
}
</style>
