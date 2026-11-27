# 検査

このテンプレートの検査のコマンドと、それぞれが確かめること。

## コマンド

```bash
npm run typecheck          # 型の検査
npm run lint               # ESLint、デザイントークンの検査、PlaywrightのDockerイメージの版の検査
npm run test               # 単体テスト（部品と全画面。axeとトークンのコントラストを含む）
npm run test:e2e:install   # 初回だけ：PlaywrightのChromiumを入れる
npm run test:e2e           # E2E（エンドツーエンドのテスト。desktopとmobileの2つの幅）
npm run test:visual        # 見た目の回帰テスト（Dockerが要る）
npm run test:visual:update # 見た目の回帰テストの基準画像を撮り直す
npm run build              # 本番用のビルド（dist/）
npm run check              # typecheck、lint、testをまとめて実行
```

## E2Eで確かめること

E2Eでは、表示と操作のほかに、次のことを確かめています。

- **axe**：全画面と開いた状態（ダイアログ、メニュー、フォームのエラー）に違反がないか。全画面はダークモードでも検査する
- **整列**：アイコンやチェックボックスが、隣の文字の1行目と上下中央でそろっているか（1px以上のずれを見つける）
- **フォーカス**：Tabで移ったフォーカスが、固定のヘッダーの下に隠れないか。フォーカスの枠が、横スクロールの領域などの端で切れないか
- **拡大と文字の間隔**：400%の拡大（幅320px）で横にはみ出さないか、文字の間隔を広げたときに文字が切れないか
- **強制カラーモード**：Windowsのハイコントラストなどで、スイッチとチェックボックスとタブの状態が見分けられるか
- **キーボード**：マウスを使わず、キーボードだけで申請を完了できるか

## 見た目の回帰テスト

見た目の回帰テストでは、主な画面と開いた状態を撮り、基準画像と比べます。フォントの描画をそろえるため、手元とCI（継続的インテグレーション）の両方で、Playwrightが提供するLinux用のイメージの中で撮ります（`scripts/visual.sh`）。画面を意図して変えたときは、`npm run test:visual:update`で基準画像を撮り直し、差分を見てからコミットしてください。

## 人が確かめること

スクリーンリーダーでの読み上げは自動では確かめられないため、[accessibility.md](accessibility.md)の手順で人が確かめます。

## 依存パッケージの更新

Dependabot（`.github/dependabot.yml`）が、npmのパッケージを毎週、GitHub Actionsを毎月確かめます。Playwrightを上げるときは、`.github/workflows/ci.yml`のイメージの版も同じ版にし、基準画像を撮り直します。版がずれていると、`npm run lint`で止まります。
