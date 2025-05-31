import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/mdi-v6/mdi-v6.css';
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/animate/fadeIn.css';
import '@quasar/extras/animate/fadeOut.css';
import { createHead } from '@vueuse/head';
import { Dark, Quasar, QSlider, QToggle, QList, QItem, QItemSection, QIcon, QTooltip } from 'quasar';
import 'quasar/dist/quasar.css';
import { createApp } from 'vue';
import App from './autopick/main.vue';

const app = createApp(App);
const head = createHead();
// Add the components you're using
app.use(Quasar, {
  components: {
    QSlider, QToggle, QList, QItem, QItemSection, QIcon, QTooltip,
  },
  plugins: {},
});
app.use(head);
app.mount('#app');
Dark.set(true);
