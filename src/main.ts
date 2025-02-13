import { createApp } from "vue";

import "./style.css";

// @ts-expect-error - The type stubs of this plugin hasn't been updated yet...
import SmartTable from "vuejs-smart-table";

import App from "./App.vue";

createApp(App).use(SmartTable).mount("#app");
