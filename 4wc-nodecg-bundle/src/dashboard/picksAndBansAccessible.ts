import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/mdi-v6/mdi-v6.css';
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/animate/fadeIn.css';
import '@quasar/extras/animate/fadeOut.css';
import { createHead } from '@vueuse/head';
import { Dark, Quasar, QBtnToggle, QList, QItem, QItemSection } from 'quasar';
import 'quasar/dist/quasar.css';
import { createApp } from 'vue';
import App from './picksAndBans/accessibleDashboard.vue';

const app = createApp(App);
const head = createHead();
app.use(Quasar, { components: { QBtnToggle, QList, QItem, QItemSection } });
app.use(head);
app.mount('#app');
Dark.set(true);
