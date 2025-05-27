import { createHead } from '@vueuse/head';
import { createApp } from 'vue';
import App from './main/main.vue';

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faCaretRight, faCaretLeft, faStar } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faCaretRight);
library.add(faCaretLeft);
library.add(faStar);

// Import dev mode styling (will only activate if OSUFR_DEV_MODE is true)
import '@4wc-stream-overlay/browser_shared/dev-mode';

const app = createApp(App);
const head = createHead();
app.use(head);
app.component('font-awesome-icon', FontAwesomeIcon).mount('#app');
