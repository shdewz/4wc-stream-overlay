<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed, onMounted, ref } from 'vue';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import { PoolBeatmap, PropertiesPickbanType } from '@4wc-stream-overlay/types/schemas';

useHead({ title: 'countdown' });

const poolReplicant = useReplicant('tournamentMappool');
const pickBansReplicant = useReplicant('tournamentPickBans');

const isLoaded = computed(() => poolReplicant.data !== undefined);

const pendingConfirm = ref(false);

const checkConfirm = () => {
  pendingConfirm.value = true;
};

const confirmResetPickBans = () => {
  // Your actual delete logic here
  console.log(`clearing all picks and bans: ${JSON.stringify(pickBansReplicant.data)}`);
  pickBansReplicant.data = {};
  pickBansReplicant.save();
  pendingConfirm.value = false;
};

const modPools = computed(() => poolReplicant.data?.beatmaps.reduce((groups: Record<string, PoolBeatmap[]>, item: PoolBeatmap) => {
  const key = item.mods;
  if (!groups[key]) {
    groups[key] = [];
  }
  groups[key].push(item);
  return groups;
}, {}));

// Helper functions for replicant data manipulation
const removePickBan = (beatmapId: string) => {
  const { [beatmapId]: ignored, ...newObj } = pickBansReplicant.data ?? {};
  pickBansReplicant.data = newObj;
  pickBansReplicant.save();
};

const updatePickBan = (beatmapId: string, color: 'red' | 'blue', action: PropertiesPickbanType) => {
  const existing = pickBansReplicant.data?.[beatmapId];
  if (existing) {
    existing.color = color;
    existing.type = action;
  } else if (pickBansReplicant.data) {
    pickBansReplicant.data[beatmapId] = {
      beatmap_id: parseInt(beatmapId, 10),
      type: action,
      color,
      time: Date.now(),
    };
  }
  pickBansReplicant.save();
};

// Consolidated map action function
const poolMapAction = (clickEvent: Event, beatmap_id: number) => {
  if (!(clickEvent instanceof MouseEvent)) return;

  const mouseEvent = clickEvent as MouseEvent;
  const color = mouseEvent.button === 0 ? 'red' : 'blue';

  console.log(`${color} did an action for map ${beatmap_id}, shift: ${mouseEvent.shiftKey}`);

  const beatmapIdStr = beatmap_id.toString();

  if (mouseEvent.shiftKey) {
    removePickBan(beatmapIdStr);
    return;
  }

  const actionType: PropertiesPickbanType = mouseEvent.ctrlKey ? 'ban' : 'pick';

  const existing = pickBansReplicant.data?.[beatmapIdStr];
  if (existing?.color === color && existing?.type === actionType) return;

  updatePickBan(beatmapIdStr, color, actionType);
};

const getButtonColor = (beatmap_id: number) => {
  const pickedMap = pickBansReplicant.data?.[beatmap_id.toString()];

  if (!pickedMap) {
    return 'grey-7';
  }

  return pickedMap.color === 'red' ? 'negative' : 'primary';
};

// Helper computed property
const isMapSelected = (beatmapId: number) => pickBansReplicant.data && beatmapId.toString() in pickBansReplicant.data;

onMounted(() => {
  console.log(`mounted, pick and bans: ${JSON.stringify(pickBansReplicant.data)}`);
});
</script>

<template>
  <div v-if="isLoaded">
    <div v-for="[key, beatmaps] in Object.entries(modPools ?? {})" :key="key">
      <div class="row justify-center">
        <div class="col-4" v-for="beatmap in beatmaps" :key="beatmap.beatmap_id">
          <QBtn
              class="full-width q-mb-sm"
              size="lg"
              style="--q-btn-outline-width: 10px;"
              :color="getButtonColor(beatmap.beatmap_id)"
              :class="{'grayed-out': isMapSelected(beatmap.beatmap_id)}"
              :label="beatmap.identifier"
              @click="(event) => poolMapAction(event, beatmap.beatmap_id)"
              @contextmenu.prevent="(event: Event) => poolMapAction(event, beatmap.beatmap_id)"
          />
        </div>
      </div>
      <br/>
    </div>

    <QBtn
        color="warning"
        label="Reset picks and bans"
        class="full-width q-mb-sm"
        v-if="!pendingConfirm"
        @click="checkConfirm()"
    />
    <div class="row">
      <QBtn
          color="negative"
          label="Confirm reset picks and bans"
          class="col-6"
          v-if="pendingConfirm"
          @click="confirmResetPickBans()"
      />
      <QBtn
          color="primary"
          label="Cancel"
          class="col-6"
          v-if="pendingConfirm"
          @click="() => pendingConfirm = false"
      />
    </div>

  </div>
</template>

<style scoped>
.json-display {
  background-color: #3e3e3e;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
}

.grayed-out {
  opacity: 0.75;
  filter: grayscale(10%);
}
</style>
