<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed, ref, watch } from 'vue';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import {
  QInput,
  QBtn,
  QToggle,
} from 'quasar';

useHead({ title: 'OBS ws' });

const obsStatusReplicant = useReplicant('obsStatus');
const obsDataReplicant = useReplicant('obsData');

watch(obsStatusReplicant, () => {
  if (obsStatusReplicant.changed) {
    obsStatusReplicant.save();
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
</script>

<template>
  <div v-if="obsStatusReplicant.data">
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
        <QToggle
            class="q-ma-xs"
            v-model="obsStatusReplicant.data.automaticReconnect"
            label="Auto-reconnect"
            dense
        />
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
    <QSeparator class="q-my-md"/>
    <QBtn
        class="q-ma-xs full-width"
        color="primary"
        label="Force refresh scenes list"
        @click="refreshScenes"
        :disabled="obsStatusReplicant.data.wsStatus === 'CLOSED'"
    />
    <QList dense bordered padding class="rounded-borders">
      <QItem clickable @click="() => setProgramScene(scene.sceneName)"
             :active="obsDataReplicant.data?.currentScene?.sceneName === scene.sceneName"
             active-class="bg-primary text-white"
             v-for="scene in obsDataReplicant.data?.scenes ?? []" :key="scene.sceneName">
        <QItemSection>{{scene.sceneName}}</QItemSection>
      </QItem>
    </QList>
  </div>
</template>
