import { createHead } from '@vueuse/head';
import { createApp } from 'vue';

import App from './accents/main.vue';

// Import dev mode styling (will only activate if OSUFR_DEV_MODE is true)
import '@4wc-stream-overlay/browser_shared/dev-mode';

import '@4wc-stream-overlay/assets/scrollbar-inhibit.css';
import '@4wc-stream-overlay/assets/common.css';

const app = createApp(App);
const head = createHead();
app.use(head);
app.mount('#app');
