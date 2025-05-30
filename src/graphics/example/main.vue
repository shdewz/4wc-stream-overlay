<script setup lang="ts">
import { Configschema, ExampleReplicant } from '@4wc-stream-overlay/types/schemas';
import { useHead } from '@vueuse/head';
import { useReplicant } from 'nodecg-vue-composable';
import { ref } from 'vue';

const text = ref('Example');

// Set the title of this page.
useHead({ title: 'example' });

// Helper composable to make accessing/modifying replicants easier.
// For more information see https://github.com/Dan-Shields/nodecg-vue-composable
const exampleReplicant = useReplicant<ExampleReplicant>(
    'exampleReplicant',
    '4wc-stream-overlay',
);

// Access the bundle configuration with types.
const config = nodecg.bundleConfig as unknown as Configschema;
</script>

<template>
  <div>
    {{ text }}
    <br><br>
    <img src="./image.png">
  </div>
</template>
