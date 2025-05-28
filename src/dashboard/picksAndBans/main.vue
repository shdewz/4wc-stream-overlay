<script setup lang="ts">
import { useHead } from '@vueuse/head';
import useSharedLogic from './useSharedLogic';

useHead({ title: 'countdown' });

const { isLoaded,
  pendingConfirm, checkConfirm, confirmResetPickBans,
  modPools, isMapBanned,
  getButtonColor, poolMapAction } = useSharedLogic();

// Helper functions for replicant data manipulation

</script>

<template>
  <div v-if="isLoaded">
    <h5 class="q-my-sm q-mx-none text-center">Pick red: LMB | Pick blue: RMB | Ban red: Ctrl+LMB | Ban blue: Ctrl+RMB | Reset map: Shift+LMB</h5>
    <div v-for="[key, beatmaps] in Object.entries(modPools ?? {})" :key="key">
      <div class="row justify-center">
        <div class="col-4" v-for="beatmap in beatmaps" :key="beatmap.beatmap_id">
          <QBtn
              class="full-width q-mb-sm"
              size="lg"
              style="--q-btn-outline-width: 10px;"
              :style="{ textDecoration: isMapBanned(beatmap.beatmap_id) ? `underline overline red 0.2em solid` : '' }"
              :color="getButtonColor(beatmap.beatmap_id)"
              :class="{'banned': isMapBanned(beatmap.beatmap_id)}"
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
.banned {
  opacity: 0.65;
  filter: grayscale(30%);
}
</style>
