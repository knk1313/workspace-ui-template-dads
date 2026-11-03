import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { STORAGE_KEY } from "@/context/DisplaySettings";
import { LAYOUT_STORAGE_KEY } from "@/context/LayoutPreference";
import { mockViewport } from "@/layouts/testUtils";
import { expectNoA11yViolations } from "@/test/axe";
import { renderApp } from "@/test/renderApp";

let restore: (() => void) | undefined;
afterEach(() => {
    restore?.();
    restore = undefined;
});

describe("SettingsPage", () => {
    it("見出し・パンくず・タブ・画面例を表示する", () => {
        renderApp("/settings");
        expect(screen.getByRole("heading", { level: 1, name: "設定" })).toBeInTheDocument();
        expect(screen.getByRole("navigation", { name: "パンくずリスト" })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: "アカウント" })).toHaveAttribute("aria-selected", "true");
        expect(screen.getByRole("heading", { name: "プロフィール" })).toBeInTheDocument();
        const examples = screen.getByRole("region", { name: "画面例" });
        expect(within(examples).getByRole("link", { name: "ログイン画面" })).toHaveAttribute("href", "/login");
        expect(within(examples).getByRole("link", { name: /500 画面/ })).toHaveAttribute("href", "/error/500");
    });

    it("表示名を空にして保存するとエラーを出し、表示名にフォーカスを移す", async () => {
        const { user } = renderApp("/settings");
        const name = screen.getByRole("textbox", { name: /表示名/ });
        await user.clear(name);
        await user.click(screen.getAllByRole("button", { name: "保存する" })[0]);
        expect(screen.getByText("＊表示名を入力してください")).toBeInTheDocument();
        expect(name).toHaveAttribute("aria-invalid", "true");
        expect(name).toHaveFocus();
        expect(screen.queryByText("プロフィールを保存しました")).toBeNull();
    });

    it("プロフィールを保存するとトーストを出す", async () => {
        const { user } = renderApp("/settings");
        await user.click(screen.getAllByRole("button", { name: "保存する" })[0]);
        expect(await screen.findByText("プロフィールを保存しました")).toBeInTheDocument();
    });

    it("アカウントの削除は確認ダイアログを出し、確定してもサンプルのため削除しない", async () => {
        const { user } = renderApp("/settings");
        await user.click(screen.getByRole("button", { name: "アカウントを削除" }));
        const dialog = screen.getByRole("dialog", { name: "アカウントを削除しますか" });
        await user.click(within(dialog).getByRole("button", { name: "削除する" }));
        expect(await screen.findByText("サンプルのため、アカウントは削除されません")).toBeInTheDocument();
    });

    it("通知方法を 1 つも選ばずに保存するとエラーを出す", async () => {
        const { user } = renderApp("/settings?tab=notifications");
        expect(screen.getByRole("switch", { name: "週次のまとめ" })).toHaveAttribute("aria-checked", "false");
        await user.click(screen.getByRole("switch", { name: "週次のまとめ" }));
        expect(screen.getByRole("switch", { name: "週次のまとめ" })).toHaveAttribute("aria-checked", "true");
        await user.click(screen.getByRole("checkbox", { name: "メール" }));
        await user.click(screen.getByRole("checkbox", { name: /システム内/ }));
        await user.click(screen.getByRole("button", { name: "保存する" }));
        expect(screen.getByText("＊通知方法を 1 つ以上選んでください")).toBeInTheDocument();
    });

    it("画面レイアウトを上部ナビゲーション型にして保存すると、ヘッダーに水平メニューが出る", async () => {
        restore = mockViewport(1280);
        const { user } = renderApp("/settings?tab=display");
        // サイドバー型ではヘッダーの中にナビゲーションがない
        expect(within(screen.getByRole("banner")).queryByRole("navigation")).toBeNull();
        await user.click(screen.getByRole("radio", { name: /上部ナビゲーション型/ }));
        // 保存するまでは反映しない
        expect(within(screen.getByRole("banner")).queryByRole("navigation")).toBeNull();
        await user.click(screen.getByRole("button", { name: "保存する" }));
        expect(within(screen.getByRole("banner")).getByRole("navigation", { name: "メインナビゲーション" })).toBeInTheDocument();
        expect(localStorage.getItem(LAYOUT_STORAGE_KEY)).toBe("topnav");
        // シェルが入れ替わっても「表示」タブのまま
        expect(screen.getByRole("tab", { name: "表示" })).toHaveAttribute("aria-selected", "true");
        expect(await screen.findByText("表示の設定を保存しました")).toBeInTheDocument();
    });

    it("日付の形式とタイムゾーンを保存すると localStorage に残る", async () => {
        const { user } = renderApp("/settings?tab=display");
        await user.click(screen.getByRole("radio", { name: /米国/ }));
        await user.selectOptions(screen.getByRole("combobox", { name: "タイムゾーン" }), "UTC");
        expect(screen.getByText(/表示例/)).toHaveTextContent("10/24/2026");
        await user.click(screen.getByRole("button", { name: "保存する" }));
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")).toEqual({ locale: "en-US", timeZone: "UTC" });
    });

    it("アクセシビリティ違反がない", async () => {
        restore = mockViewport(1280);
        const { container } = renderApp("/settings");
        await expectNoA11yViolations(container);
    });
});
