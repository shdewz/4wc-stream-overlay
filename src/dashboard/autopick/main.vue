<script setup lang="ts">
import { ref } from 'vue';

const bansCount = ref(0);
const autopickEnable = ref(false);
const nextPickColor = ref('red');

const toggleNextPickColor = () => {
  nextPickColor.value = nextPickColor.value === 'red' ? 'blue' : 'red';
};
</script>

<template>
  <div class="q-pa-md">
    <q-list>
      <q-item tag="label" v-ripple="false" class="q-px-none">
        <q-item-section>
          <q-item-label>Enable autopick</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle size="md" color="green" v-model="autopickEnable" />
        </q-item-section>
      </q-item>
      <q-item tag="label" v-ripple="false" class="q-px-none">
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
      <q-item tag="label" v-ripple="false" class="q-px-none" clickable @click="toggleNextPickColor">
        <q-item-section>
          <q-item-label>Next pick color</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon name="circle" :color="nextPickColor"></q-icon>
        </q-item-section>
      </q-item>
    </q-list>
  </div>

</template>

<style scoped>

</style>
