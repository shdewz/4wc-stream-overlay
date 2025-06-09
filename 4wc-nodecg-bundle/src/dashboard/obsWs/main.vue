<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed, watch } from 'vue';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import {
  QInput,
  QBtn,
  QToggle,
} from 'quasar';

useHead({ title: 'OBS ws' });

const obsStatusReplicant = useReplicant('obsStatus');
const obsDataReplicant = useReplicant('obsData');
const obsAutoAdvanceReplicant = useReplicant('obsAutoAdvanceSettings');

watch(obsStatusReplicant, () => {
  if (obsStatusReplicant.changed) {
    obsStatusReplicant.save();
  }
});

watch(obsAutoAdvanceReplicant, () => {
  if (obsAutoAdvanceReplicant.changed) {
    obsAutoAdvanceReplicant.save();
  }
});

const open = () => {
  nodecg.sendMessage('OBS-open', { wsUrl: obsStatusReplicant.data?.wsUrl, wsPassword: obsStatusReplicant.data?.wsPassword });
};
const close = () => {
  nodecg.sendMessage('OBS-close');
};
const refreshScenes = () => {
  nodecg.sendMessage('OBS-refreshScenes');
};

const setProgramScene = (sceneName: string) => {
  nodecg.sendMessage('OBS-setProgram', sceneName);
};

const obsSceneNames = computed(() => {
  return obsDataReplicant.data?.scenes.map(s => s.sceneName) ?? [];
});

const setMappoolTarget = (sceneName: string) => {
  if (!obsAutoAdvanceReplicant.data) return;

  obsAutoAdvanceReplicant.data.scenes.mappool = sceneName;
  obsAutoAdvanceReplicant.save();
};

const setGameplayTarget = (sceneName: string) => {
  if (!obsAutoAdvanceReplicant.data) return;

  obsAutoAdvanceReplicant.data.scenes.gameplay = sceneName;
  obsAutoAdvanceReplicant.save();
};

const scenesIconMap = computed(() => {
  const scenes = obsAutoAdvanceReplicant.data?.scenes;

  if (!scenes) return {};

  return {
    [scenes.mappool]: 'pool',
    [scenes.gameplay]: 'computer'
  };
});
</script>

<template>
  <div v-if="obsStatusReplicant.data && obsAutoAdvanceReplicant.data">
    <div class="text-h6 q-mb-md">OBS ws status</div>

    <QInput
        class="q-pa-xs"
        filled
        v-model="obsStatusReplicant.data.wsUrl"
        label="WebSocket URL"
        dense
        :autofocus="false"
    />
    <QInput
        class="q-pa-xs"
        filled
        v-model="obsStatusReplicant.data.wsPassword"
        label="WebSocket password"
        dense
        type="password"
        :autofocus="false"
    />
    <div class="row">
      <div class="col">
        <QInput
            class="q-pa-xs"
            filled
            :model-value="`Status: ${obsStatusReplicant.data.wsStatus}`"
            disable
            dense
            :autofocus="false"
        />
      </div>
      <div>
        <QBtn
            class="q-ma-xs"
            color="green-10"
            label="(RE)OPEN"
            @click="open"
        />
        <QBtn
            class="q-ma-xs"
            color="orange-10"
            label="CLOSE"
            @click="close"
            :disabled="obsStatusReplicant.data.wsStatus === 'CLOSED'"
        />
      </div>
    </div>
    <QItem tag="label" v-ripple="false">
      <QItemSection>
        <QItemLabel>Auto-reconnect</QItemLabel>
      </QItemSection>
      <QItemSection avatar>
        <QToggle
            class="q-ma-xs"
            v-model="obsStatusReplicant.data.automaticReconnect"
            dense
        />
      </QItemSection>
    </QItem>

    <QSeparator class="q-my-md"/>
    <QItem tag="label" v-ripple="false">
      <QItemSection>
        <QItemLabel>Auto-advance scenes</QItemLabel>
      </QItemSection>
      <QItemSection avatar>
        <QToggle
            class="q-ma-xs"
            v-model="obsAutoAdvanceReplicant.data.autoadvance"
            dense
        />
      </QItemSection>
    </QItem>
    <div class="row">
      <div class="col-6">
        <QSelect outlined
                 :model-value="obsAutoAdvanceReplicant.data?.scenes.mappool"
                 @update:model-value="setMappoolTarget"
                 :options="obsSceneNames" label="Mappool scene name" />

        <QSeparator class="q-my-md"/>
      </div>
      <div class="col-6">
        <QSelect outlined
                 :model-value="obsAutoAdvanceReplicant.data?.scenes.gameplay"
                 @update:model-value="setGameplayTarget"
                 :options="obsSceneNames" label="Gameplay scene name" />

        <QSeparator class="q-my-md"/>
      </div>
    </div>

    <QBtn
        class="q-ma-xs full-width"
        color="primary"
        label="Force refresh scenes list"
        @click="refreshScenes"
        :disabled="obsStatusReplicant.data.wsStatus === 'CLOSED'"
    />
    <QList bordered padding class="rounded-borders">
      <QItem clickable @click="() => setProgramScene(scene.sceneName)"
             :active="obsDataReplicant.data?.currentScene?.sceneName === scene.sceneName"
             active-class="bg-primary text-white"
             :class="{ 'bg-dark': obsDataReplicant.data?.sceneTransitionActive === true }"
             v-for="scene in obsDataReplicant.data?.scenes ?? []" :key="scene.sceneName">
        <QItemSection>{{scene.sceneName}}</QItemSection>
        <QItemSection side >
          <QIcon :name="scenesIconMap[scene.sceneName] ?? ''" />
        </QItemSection>
      </QItem>
    </QList>
  </div>
</template>
