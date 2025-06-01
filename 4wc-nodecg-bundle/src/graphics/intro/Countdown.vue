<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  time: string;
}>();

const text = ref('00:00');

let timeout: ReturnType<typeof setTimeout> | null = null;

function loop() {
  const currentDate = new Date();

  const [hours, minutes, seconds] = props.time.split(':');
  const finalDate = new Date();
  finalDate.setHours(Number(hours));
  finalDate.setMinutes(Number(minutes));
  if (seconds !== undefined) {
    finalDate.setSeconds(Number(seconds));
  }

  let diffSeconds = Math.round((finalDate.getTime() - currentDate.getTime()) / 1000);
  if (diffSeconds > 21 * 60 * 60) {
    diffSeconds -= 24 * 60 * 60;
  } else if (diffSeconds < -3 * 60 * 60) {
    diffSeconds += 24 * 60 * 60;
  }
  if (diffSeconds < 0) {
    diffSeconds = 0;
  }

  const diffHours = Math.trunc(diffSeconds / (60 * 60));
  const diffMinutes = Math.trunc(diffSeconds / 60 - diffHours * 60);
  diffSeconds = Math.trunc(diffSeconds % 60);

  let newText: string;
  if (diffHours >= 1) {
    newText = `${String(diffHours).padStart(2, '0')}:${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')}`;
  } else {
    newText = `${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')}`;
  }
  text.value = newText.replaceAll(':', '<span class="split">:</span>');

  timeout = setTimeout(() => loop(), 1000 - (new Date().getMilliseconds() % 1000));
}

watch(() => props.time, () => {
  if (timeout) {
    clearTimeout(timeout);
  }
  loop();
}, { immediate: true });

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>

<template>
  <div class="countdown" v-html="text" />
</template>
