import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const port = process.env.PORT ? parseInt(process.env.PORT) : 5173;

export default defineConfig({
  plugins: [react()],
  server: { port, strictPort: true, host: "0.0.0.0", historyApiFallback: true },
  preview: { port, strictPort: true, host: "0.0.0.0" },
});
