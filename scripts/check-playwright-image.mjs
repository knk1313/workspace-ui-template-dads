// CI の見た目の回帰テストで使う Playwright イメージの版が、インストールしている @playwright/test と同じかを確かめる。
// 版がずれるとブラウザの描画が変わり、基準画像との比較が意味をなさなくなる。
import { readFileSync } from "node:fs";

const installed = JSON.parse(readFileSync("node_modules/@playwright/test/package.json", "utf8")).version;
const ci = readFileSync(".github/workflows/ci.yml", "utf8");
const match = ci.match(/mcr\.microsoft\.com\/playwright:v([\d.]+)-/);

if (!match) {
    console.error("Playwright イメージの検査: .github/workflows/ci.yml に mcr.microsoft.com/playwright のイメージが見つかりません");
    process.exit(1);
}
if (match[1] !== installed) {
    console.error(`Playwright イメージの検査: CI のイメージ（v${match[1]}）と @playwright/test（${installed}）の版が違います。.github/workflows/ci.yml を ${installed} に合わせてください`);
    process.exit(1);
}
console.log(`Playwright イメージの検査: OK（v${installed}）`);
