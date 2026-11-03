import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { appConfig } from "./src/app.config.ts";

// index.html の %APP_NAME% / %APP_DESCRIPTION% を app.config.ts の値で置き換える。
function appConfigHtml(): Plugin {
    const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    return {
        name: "app-config-html",
        transformIndexHtml: (html) =>
            html.replaceAll("%APP_NAME%", escape(appConfig.name)).replaceAll("%APP_DESCRIPTION%", escape(appConfig.description)),
    };
}

export default defineConfig({
    // 公開する場所のパス。既定はサイトの直下（/）。GitHub Pages のデモは /workspace-ui-template-dads/ で配信する（.github/workflows/pages.yml）。
    base: process.env.BASE_PATH ?? "/",
    plugins: [react(), tailwindcss(), appConfigHtml()],
    resolve: {
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    build: {
        rolldownOptions: {
            output: {
                // 1 つの JS が 500 kB を超えないよう、更新頻度の低いライブラリを別のファイルに分ける（ブラウザのキャッシュも効きやすくなる）。
                codeSplitting: {
                    groups: [
                        { name: "charts", test: /node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|decimal\.js-light|es-toolkit|immer|@reduxjs|redux|reselect|react-redux|eventemitter3|tiny-invariant|use-sync-external-store)[\\/]/ },
                        { name: "react", test: /node_modules[\\/](react|react-dom|react-router|scheduler|cookie|set-cookie-parser)[\\/]/ },
                        { name: "vendor", test: /node_modules[\\/]/ },
                    ],
                },
            },
        },
    },
});
