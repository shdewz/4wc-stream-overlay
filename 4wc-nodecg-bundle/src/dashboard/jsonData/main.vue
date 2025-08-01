<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed, ref, watch } from 'vue';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import { QExpansionItem, QInput } from 'quasar';

useHead({ title: 'countdown' });

const poolReplicant = useReplicant('tournamentMappool');
const teamsReplicant = useReplicant('tournamentTeams');

const isLoaded = computed(() => poolReplicant.data !== undefined);


const jsonDataLoading = ref(false);
const refreshJsonData = (sheetName?: string) => {
  jsonDataLoading.value = true;
  nodecg.sendMessage('jsondata:fetch', sheetName).finally(() => {
    jsonDataLoading.value = false;
  });
};
</script>

<template>
  <div v-if="isLoaded">
    <h6 class="q-ma-none">Static JSON data</h6>
    <QBtn
        color="primary"
        label="Refresh mappool and teams"
        class="full-width q-mb-sm"
        :disable="jsonDataLoading"
        @click="refreshJsonData()"
    />

    <q-expansion-item
        icon="pool"
        label="Mappool"
        header-class="text-primary"
    >
      <q-card>
        <q-card-section >
          <pre class="json-display">{{ JSON.stringify(poolReplicant.data, null, 2) }}</pre>
        </q-card-section>
      </q-card>
    </q-expansion-item>
    <q-expansion-item
        icon="groups"
        label="Teams"
        header-class="text-primary"
    >
      <q-card>
        <q-card-section >
          <pre class="json-display">{{ JSON.stringify(teamsReplicant.data, null, 2) }}</pre>
        </q-card-section>
      </q-card>
    </q-expansion-item>
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
</style>
