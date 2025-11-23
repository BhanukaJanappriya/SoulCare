import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 5173, 
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
});

// This configuration sets up Vite for a React project with SWC support,
// enabling the use of modern JavaScript features and optimizing the build process.
// The server is configured to listen on all network interfaces and uses port 5173.
// The alias "@" is set to resolve to the "src" directory for easier imports.
// Make sure to install necessary dependencies like @vitejs/plugin-react-swc and path if not