// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { federation } from "file:///mnt/NewVolume1/DevTest/RealProject/DATN/fe/node_modules/.pnpm/@module-federation+vite@1.6.0_rollup@4.45.0/node_modules/@module-federation/vite/lib/index.cjs";
import { defineConfig, loadEnv } from "file:///mnt/NewVolume1/DevTest/RealProject/DATN/fe/node_modules/.pnpm/vite@5.4.19_@types+node@18.19.118_lightningcss@1.30.1_sass@1.89.2_terser@5.43.1/node_modules/vite/dist/node/index.js";
import vue from "file:///mnt/NewVolume1/DevTest/RealProject/DATN/fe/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.19_@types+node@18.19.118_lightningcss@1.30.1_sass@1.8_44bfa8cc1f6dbad8d7bb6ffa9f1f72ad/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "node:path";
import Icons from "file:///mnt/NewVolume1/DevTest/RealProject/DATN/fe/node_modules/.pnpm/unplugin-icons@22.1.0_@vue+compiler-sfc@3.5.20/node_modules/unplugin-icons/dist/vite.js";
import autoprefixer from "file:///mnt/NewVolume1/DevTest/RealProject/DATN/fe/node_modules/.pnpm/autoprefixer@10.4.21_postcss@8.5.6/node_modules/autoprefixer/lib/autoprefixer.js";
import tailwindcss from "file:///mnt/NewVolume1/DevTest/RealProject/DATN/fe/node_modules/.pnpm/tailwindcss@3.4.17_ts-node@10.9.2_@types+node@18.19.118_typescript@5.3.3_/node_modules/tailwindcss/lib/index.js";
var __vite_injected_original_dirname = "/mnt/NewVolume1/DevTest/RealProject/DATN/fe/presentation";
var __vite_injected_original_import_meta_url = "file:///mnt/NewVolume1/DevTest/RealProject/DATN/fe/presentation/vite.config.ts";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = env.PORT ? parseInt(env.PORT, 10) : 5174;
  const apiUrl = env.NODE_ENV === "production" ? "https://api.huy-devops.site" : env.VITE_API_URL || "http://localhost:3000";
  const getBaseUrl = () => {
    if (mode === "development") {
      return `http://localhost:${port}/`;
    }
    return "./";
  };
  return {
    base: getBaseUrl(),
    plugins: [
      vue(),
      federation({
        name: "vueRemote",
        filename: "remoteEntry.js",
        exposes: {
          "./Editor": "./src/mount/appMount.ts",
          "./ThumbnailSlide": "./src/mount/thumbnailMount.ts",
          "./method": "./src/mount/methodMount.ts"
        },
        shared: {
          vue: {
            singleton: true
          }
        }
      }),
      Icons({ compiler: "vue3" })
    ],
    server: {
      fs: {
        allow: [".", "../shared"]
      },
      port,
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    },
    preview: {
      port,
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
          additionalData: `
            @use '@/assets/styles/mixin.scss' as *;
          `
        }
      },
      postcss: {
        plugins: [tailwindcss, autoprefixer]
      }
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
        vue: path.resolve(__vite_injected_original_dirname, "./node_modules/vue/dist/vue.runtime.esm-bundler.js"),
        pinia: path.resolve(__vite_injected_original_dirname, "./node_modules/pinia/dist/pinia.mjs"),
        shared: path.resolve(__vite_injected_original_dirname, "../shared/shared")
      }
    },
    build: {
      target: "esnext",
      minify: false
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl)
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L05ld1ZvbHVtZTEvRGV2VGVzdC9SZWFsUHJvamVjdC9EQVROL2ZlL3ByZXNlbnRhdGlvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL21udC9OZXdWb2x1bWUxL0RldlRlc3QvUmVhbFByb2plY3QvREFUTi9mZS9wcmVzZW50YXRpb24vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL21udC9OZXdWb2x1bWUxL0RldlRlc3QvUmVhbFByb2plY3QvREFUTi9mZS9wcmVzZW50YXRpb24vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgeyBmZWRlcmF0aW9uIH0gZnJvbSAnQG1vZHVsZS1mZWRlcmF0aW9uL3ZpdGUnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IEljb25zIGZyb20gJ3VucGx1Z2luLWljb25zL2Rpc3Qvdml0ZS5qcyc7XG5pbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gJ2F1dG9wcmVmaXhlcic7XG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAndGFpbHdpbmRjc3MnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xuICBjb25zdCBwb3J0ID0gZW52LlBPUlQgPyBwYXJzZUludChlbnYuUE9SVCwgMTApIDogNTE3NDtcblxuICAvLyBDb25maWd1cmUgVVJMcyB3aXRoIHByb2R1Y3Rpb24gZmFsbGJhY2tzXG4gIGNvbnN0IGFwaVVybCA9XG4gICAgZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbidcbiAgICAgID8gJ2h0dHBzOi8vYXBpLmh1eS1kZXZvcHMuc2l0ZSdcbiAgICAgIDogZW52LlZJVEVfQVBJX1VSTCB8fCAnaHR0cDovL2xvY2FsaG9zdDozMDAwJztcblxuICAvLyBEeW5hbWljIGJhc2UgVVJMOiB1c2UgcmVsYXRpdmUgcGF0aCBmb3IgcHJvZHVjdGlvbiwgYWJzb2x1dGUgZm9yIGRldmVsb3BtZW50XG4gIGNvbnN0IGdldEJhc2VVcmwgPSAoKSA9PiB7XG4gICAgaWYgKG1vZGUgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgIHJldHVybiBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L2A7XG4gICAgfVxuICAgIC8vIEZvciBwcm9kdWN0aW9uL3ByZXZpZXcgYnVpbGRzLCB1c2UgcmVsYXRpdmUgcGF0aCBzbyBpdCB3b3JrcyBvbiBhbnkgZG9tYWluXG4gICAgcmV0dXJuICcuLyc7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBiYXNlOiBnZXRCYXNlVXJsKCksXG4gICAgcGx1Z2luczogW1xuICAgICAgdnVlKCksXG4gICAgICBmZWRlcmF0aW9uKHtcbiAgICAgICAgbmFtZTogJ3Z1ZVJlbW90ZScsXG4gICAgICAgIGZpbGVuYW1lOiAncmVtb3RlRW50cnkuanMnLFxuICAgICAgICBleHBvc2VzOiB7XG4gICAgICAgICAgJy4vRWRpdG9yJzogJy4vc3JjL21vdW50L2FwcE1vdW50LnRzJyxcbiAgICAgICAgICAnLi9UaHVtYm5haWxTbGlkZSc6ICcuL3NyYy9tb3VudC90aHVtYm5haWxNb3VudC50cycsXG4gICAgICAgICAgJy4vbWV0aG9kJzogJy4vc3JjL21vdW50L21ldGhvZE1vdW50LnRzJyxcbiAgICAgICAgfSxcbiAgICAgICAgc2hhcmVkOiB7XG4gICAgICAgICAgdnVlOiB7XG4gICAgICAgICAgICBzaW5nbGV0b246IHRydWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgSWNvbnMoeyBjb21waWxlcjogJ3Z1ZTMnIH0pLFxuICAgIF0sXG5cbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGZzOiB7XG4gICAgICAgIGFsbG93OiBbJy4nLCAnLi4vc2hhcmVkJ10sXG4gICAgICB9LFxuICAgICAgcG9ydDogcG9ydCxcbiAgICAgIGNvcnM6IHRydWUsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIE9QVElPTlMnLFxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24nLFxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgcHJldmlldzoge1xuICAgICAgcG9ydDogcG9ydCxcbiAgICAgIGNvcnM6IHRydWUsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIE9QVElPTlMnLFxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24nLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGNzczoge1xuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgICBzY3NzOiB7XG4gICAgICAgICAgYXBpOiAnbW9kZXJuJyxcbiAgICAgICAgICBhZGRpdGlvbmFsRGF0YTogYFxuICAgICAgICAgICAgQHVzZSAnQC9hc3NldHMvc3R5bGVzL21peGluLnNjc3MnIGFzICo7XG4gICAgICAgICAgYCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFt0YWlsd2luZGNzcywgYXV0b3ByZWZpeGVyXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICAgdnVlOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9ub2RlX21vZHVsZXMvdnVlL2Rpc3QvdnVlLnJ1bnRpbWUuZXNtLWJ1bmRsZXIuanMnKSxcbiAgICAgICAgcGluaWE6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL25vZGVfbW9kdWxlcy9waW5pYS9kaXN0L3BpbmlhLm1qcycpLFxuICAgICAgICBzaGFyZWQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9zaGFyZWQvc2hhcmVkJyksXG4gICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgICBtaW5pZnk6IGZhbHNlLFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfQVBJX1VSTCc6IEpTT04uc3RyaW5naWZ5KGFwaVVybCksXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwVixTQUFTLGVBQWUsV0FBVztBQUM3WCxTQUFTLGtCQUFrQjtBQUMzQixTQUFTLGNBQWMsZUFBZTtBQUN0QyxPQUFPLFNBQVM7QUFDaEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sV0FBVztBQUNsQixPQUFPLGtCQUFrQjtBQUN6QixPQUFPLGlCQUFpQjtBQVB4QixJQUFNLG1DQUFtQztBQUErSyxJQUFNLDJDQUEyQztBQVN6USxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsUUFBTSxPQUFPLElBQUksT0FBTyxTQUFTLElBQUksTUFBTSxFQUFFLElBQUk7QUFHakQsUUFBTSxTQUNKLElBQUksYUFBYSxlQUNiLGdDQUNBLElBQUksZ0JBQWdCO0FBRzFCLFFBQU0sYUFBYSxNQUFNO0FBQ3ZCLFFBQUksU0FBUyxlQUFlO0FBQzFCLGFBQU8sb0JBQW9CLElBQUk7QUFBQSxJQUNqQztBQUVBLFdBQU87QUFBQSxFQUNUO0FBRUEsU0FBTztBQUFBLElBQ0wsTUFBTSxXQUFXO0FBQUEsSUFDakIsU0FBUztBQUFBLE1BQ1AsSUFBSTtBQUFBLE1BQ0osV0FBVztBQUFBLFFBQ1QsTUFBTTtBQUFBLFFBQ04sVUFBVTtBQUFBLFFBQ1YsU0FBUztBQUFBLFVBQ1AsWUFBWTtBQUFBLFVBQ1osb0JBQW9CO0FBQUEsVUFDcEIsWUFBWTtBQUFBLFFBQ2Q7QUFBQSxRQUNBLFFBQVE7QUFBQSxVQUNOLEtBQUs7QUFBQSxZQUNILFdBQVc7QUFBQSxVQUNiO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsTUFBTSxFQUFFLFVBQVUsT0FBTyxDQUFDO0FBQUEsSUFDNUI7QUFBQSxJQUVBLFFBQVE7QUFBQSxNQUNOLElBQUk7QUFBQSxRQUNGLE9BQU8sQ0FBQyxLQUFLLFdBQVc7QUFBQSxNQUMxQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxRQUNQLCtCQUErQjtBQUFBLFFBQy9CLGdDQUFnQztBQUFBLFFBQ2hDLGdDQUFnQztBQUFBLE1BQ2xDO0FBQUEsSUFDRjtBQUFBLElBRUEsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxRQUNQLCtCQUErQjtBQUFBLFFBQy9CLGdDQUFnQztBQUFBLFFBQ2hDLGdDQUFnQztBQUFBLE1BQ2xDO0FBQUEsSUFDRjtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gscUJBQXFCO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFVBQ0osS0FBSztBQUFBLFVBQ0wsZ0JBQWdCO0FBQUE7QUFBQTtBQUFBLFFBR2xCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1AsU0FBUyxDQUFDLGFBQWEsWUFBWTtBQUFBLE1BQ3JDO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxRQUNwRCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxvREFBb0Q7QUFBQSxRQUNqRixPQUFPLEtBQUssUUFBUSxrQ0FBVyxxQ0FBcUM7QUFBQSxRQUNwRSxRQUFRLEtBQUssUUFBUSxrQ0FBVyxrQkFBa0I7QUFBQSxNQUNwRDtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxJQUNWO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixnQ0FBZ0MsS0FBSyxVQUFVLE1BQU07QUFBQSxJQUN2RDtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
