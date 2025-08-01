<script setup lang="ts">
import { reactive, watch } from 'vue';
import { PropertiesPickbanType } from '@4wc-stream-overlay/types/schemas';
import useSharedLogic from './useSharedLogic';

enum PickBanState {
  UNPICKED = 0,
  RED_PICK,
  BLUE_PICK,
  RED_BAN,
  BLUE_BAN,
}

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

const { pickBansReplicant, modPools, removePickBan, updatePickBan } = useSharedLogic();

const getModPoolAccentColor = (modPoolName: string): string => ({
  HD: 'yellow-11',
  HR: 'red-11',
  DT: 'deep-purple-11',
  FM: 'green-11',
  NM: 'blue-11',
}[modPoolName.toUpperCase()] ?? 'white');

type ToggleStates = Record<string, PickBanState>;

/**
 * Returns a default value if target doesn't have the right key. Updates pickBans replicant on `set`
 * @param target Target to proxy
 * @param defaultValue Default value to return if key doesn't exist
 */
const createMapBanHandlerProxy = (target: ToggleStates, defaultValue = PickBanState.UNPICKED) => new Proxy(target, {
  get(obj, prop) {
    if (typeof prop === 'string' && !(prop in obj)) {
      obj[prop] = defaultValue;
    }
    return obj[prop as string];
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  set(setTarget: ToggleStates, property: string | symbol, value: unknown, _receiver): boolean {
    if (typeof value !== typeof PickBanState.UNPICKED) {
      // console.log(`value type is not PickBanState: ${typeof value} (${typeof PickBanState})`);
      return false;
    }
    if (typeof property !== 'string') {
      // console.log(`property type is not string: ${typeof property}`);
      return false;
    }

    setTarget[property] = value as PickBanState;

    if (value === PickBanState.UNPICKED) {
      removePickBan(property);
      return true;
    }

    const color = (value === PickBanState.RED_PICK || value === PickBanState.RED_BAN) ? 'red' : 'blue';
    const action: PropertiesPickbanType = (value === PickBanState.RED_BAN || value === PickBanState.BLUE_BAN) ? 'ban' : 'pick';
    updatePickBan(property, color, action);

    return true;
  },
});

// indexed by beatmap ID
const baseStates: ToggleStates = reactive({});
const toggleStates = reactive(createMapBanHandlerProxy(baseStates));

watch(pickBansReplicant, (newPickBans) => {
  if (!newPickBans.data) return;

  const replicantKeys = Object.keys(newPickBans.data);

  Object.keys(baseStates).forEach((key) => {
    if (!replicantKeys.includes(key)) {
      delete baseStates[key];
    }
  });

  replicantKeys.forEach((key) => {
    const mapPickBanData = newPickBans.data?.[key];

    if (!mapPickBanData) {
      baseStates[key] = PickBanState.UNPICKED;
      return;
    }

    let state = PickBanState.UNPICKED;

    if (mapPickBanData.color === 'red' && mapPickBanData.type === 'pick') state = PickBanState.RED_PICK;
    if (mapPickBanData.color === 'red' && mapPickBanData.type === 'ban') state = PickBanState.RED_BAN;
    if (mapPickBanData.color === 'blue' && mapPickBanData.type === 'pick') state = PickBanState.BLUE_PICK;
    if (mapPickBanData.color === 'blue' && mapPickBanData.type === 'ban') state = PickBanState.BLUE_BAN;

    baseStates[key] = state;
  });
});
</script>

<template>
  <div>
    <q-list dense v-for="[key, beatmaps] in Object.entries(modPools ?? {})" :key="key">
      <q-item tag="label" v-ripple="false" v-for="poolMap in beatmaps" :key="poolMap.identifier">
        <div class="col-2 flex items-center">
          <q-item-label :class="`text-subtitle1 text-weight-bold text-${getModPoolAccentColor(key)}`">{{ poolMap.identifier }}</q-item-label>
        </div>
        <div class="col-10">
          <q-btn-toggle
              v-model="toggleStates[poolMap.beatmap_id.toString()]"
              spread
              dense
              :toggle-color="getButtonColor(toggleStates[poolMap.beatmap_id.toString()])"
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
