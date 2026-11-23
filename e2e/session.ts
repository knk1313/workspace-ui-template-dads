// E2E と見た目の回帰テストの、ログインの状態。既定はログイン済み（playwright.config.ts、playwright.visual.config.ts）。
// キーは src/api/auth.ts の SESSION_STORAGE_KEY と同じ。

export const LOGGED_IN = {
    cookies: [],
    origins: [{ origin: "http://localhost:4173", localStorage: [{ name: "mock-session", value: "1" }] }],
};

export const LOGGED_OUT = { cookies: [], origins: [] };
