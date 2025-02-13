import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  worker: {
    format: "es",
  },
  resolve: {
    conditions: ["worker", "webworker"],
  },
});
