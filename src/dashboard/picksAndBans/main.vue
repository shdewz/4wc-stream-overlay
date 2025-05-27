<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed, ref } from 'vue';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import { PoolBeatmap } from "@4wc-stream-overlay/types/schemas";

useHead({ title: 'countdown' });

const poolReplicant = useReplicant('tournamentMappool');
const pickBansReplicant = useReplicant('tournamentPickBans');

const isLoaded = computed(() => poolReplicant.data !== undefined);


const pendingConfirm = ref(false);

const checkConfirm = () => {
  pendingConfirm.value = true;
}

const confirmResetPickBans = () => {
  // Your actual delete logic here
  console.log(`clearing all picks and bans: ${JSON.stringify(pickBansReplicant.data)}`);
  pickBansReplicant.data = {};
  pendingConfirm.value = false;
}

const modPools = computed(() => {
    return poolReplicant.data?.beatmaps.reduce((groups: Record<string, PoolBeatmap[]>, item: PoolBeatmap) => {
      const key = item.mods;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
});

const poolMapActionRed = (clickEvent: Event, beatmap_id: number) => {
  if (!(clickEvent instanceof MouseEvent))
    return;

  const mouseEvent = clickEvent as MouseEvent;
  console.log(`red did an action for map ${beatmap_id}, shift: ${mouseEvent.shiftKey}, right: ${mouseEvent.button}`);

  if (mouseEvent.shiftKey) {
    // pickBansReplicant.data = pickBansReplicant.data?.filter(pb => pb.id !== beatmap_id) || [];
    const { [beatmap_id]: _, ...newObj } = pickBansReplicant.data ?? {};
    pickBansReplicant.data = newObj;
    return;
  }

  // replace color if already picked/banned
  const existing = pickBansReplicant.data?.[beatmap_id];
  if (existing)
  {
    if (existing?.color == 'red')
      return;

    existing.color = 'red';
    return;
  }

  // pickBansReplicant.data?.push({'id': beatmap_id, 'color': 'red'});
  if (pickBansReplicant.data)
    pickBansReplicant.data[beatmap_id] = {'beatmap_id': beatmap_id, 'type': 'pick', 'color': 'red', 'time': Date.now()};
}

const poolMapActionBlue = (clickEvent: Event, beatmap_id: number) => {
  if (!(clickEvent instanceof MouseEvent))
    return;

  const mouseEvent = clickEvent as MouseEvent;
  console.log(`blue did an action for map ${beatmap_id}, shift: ${mouseEvent.shiftKey}`);

  if (mouseEvent.shiftKey) {
    // pickBansReplicant.data = pickBansReplicant.data?.filter(pb => pb.id !== beatmap_id) || [];
    const { [beatmap_id]: _, ...newObj } = pickBansReplicant.data ?? {};
    pickBansReplicant.data = newObj;
    return;
  }

  // do nothing if already picked/banned
  // const existing = pickBansReplicant.data?.find(pb => pb.id === beatmap_id);
  const existing = pickBansReplicant.data?.[beatmap_id];
  if (existing)
  {
    if (existing?.color == 'blue')
      return;

    existing.color = 'blue';
    return;
  }

  // pickBansReplicant.data?.push({'id': beatmap_id, 'color': 'blue'});
  if (pickBansReplicant.data)
    pickBansReplicant.data[beatmap_id] = {'beatmap_id': beatmap_id, 'type': 'pick', 'color': 'blue', 'time': Date.now()};
}


const getButtonColor = (beatmap_id: number) => {
  // const pickedMap = pickBansReplicant.data?.find(pb => pb.id == beatmap_id);
  const pickedMap = pickBansReplicant.data?.[beatmap_id];

  if (!pickedMap) {
    return "grey-7"
  }

  return pickedMap.color == 'red' ? "negative" : "primary"
}

// :outline="pickBansReplicant.data?.some(pb => pb.id === beatmap.beatmap_id)"
</script>

<template>
  <div v-if="isLoaded">
    <div v-for="[key, beatmaps] in Object.entries(modPools ?? {})" :key="key">
      <div class="row justify-center">
        <div class="col-4" v-for="beatmap in beatmaps" :key="beatmap.beatmap_id">
          <QBtn class="full-width q-mb-sm"
                size="lg"
                style="--q-btn-outline-width: 10px;"
                :color="getButtonColor(beatmap.beatmap_id)"
                :class="{'grayed-out': pickBansReplicant.data && beatmap.beatmap_id in pickBansReplicant.data }"
                :label="beatmap.identifier"
                @click="(event) => poolMapActionRed(event, beatmap.beatmap_id)"
                @contextmenu.prevent="(event: Event) => poolMapActionBlue(event, beatmap.beatmap_id)"
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
