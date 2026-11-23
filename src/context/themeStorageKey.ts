// 配色の好みを保存するキー。index.html の先頭のスクリプトも、ビルドのときにこの値で置き換えて使う（vite.config.ts）。
// ほかのモジュールを読まないファイルにしておく（vite.config.ts から読むため）。
export const THEME_STORAGE_KEY = "theme-preference";
