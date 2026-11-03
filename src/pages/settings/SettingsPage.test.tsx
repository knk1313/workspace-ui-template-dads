import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { setMockOptions } from "@/api/mock";
import { STORAGE_KEY } from "@/context/DisplaySettings";
import { LAYOUT_STORAGE_KEY } from "@/context/LayoutPreference";
import { mockViewport } from "@/layouts/testUtils";
import { expectNoA11yViolations } from "@/test/axe";
import { renderLoaded } from "@/test/renderApp";

let restore: (() => void) | undefined;
afterEach(() => {
    restore?.();
    restore = undefined;
});

describe("SettingsPage", () => {
    it("見出し・パンくず・タブ・画面例を表示する", async () => {
        await renderLoaded("/settings");
        expect(screen.getByRole("heading", { level: 1, name: "設定" })).toBeInTheDocument();
        expect(screen.getByRole("navigation", { name: "パンくずリスト" })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: "アカウント" })).toHaveAttribute("aria-selected", "true");
        expect(screen.getByRole("heading", { name: "プロフィール" })).toBeInTheDocument();
        const examples = screen.getByRole("region", { name: "画面例" });
        expect(within(examples).getByRole("link", { name: "ログイン画面" })).toHaveAttribute("href", "/login");
        expect(within(examples).getByRole("link", { name: /500画面/ })).toHaveAttribute("href", "/error/500");
    });

    it("表示名を空にして保存するとエラーを出し、表示名にフォーカスを移す", async () => {
        const { user } = await renderLoaded("/settings");
        const name = screen.getByRole("textbox", { name: /表示名/ });
        await user.clear(name);
        await user.click(screen.getAllByRole("button", { name: "保存する" })[0]);
        expect(screen.getByText("＊表示名を入力してください")).toBeInTheDocument();
        expect(name).toHaveAttribute("aria-invalid", "true");
        expect(name).toHaveFocus();
        expect(screen.queryByText("プロフィールを保存しました")).toBeNull();
    });

    it("プロフィールを保存するとトーストを出す", async () => {
        const { user } = await renderLoaded("/settings");
        await user.click(screen.getAllByRole("button", { name: "保存する" })[0]);
        expect(await screen.findByText("プロフィールを保存しました")).toBeInTheDocument();
    });

    it("アカウントの削除は確認ダイアログを出し、確定してもサンプルのため削除しない", async () => {
        const { user } = await renderLoaded("/settings");
        await user.click(screen.getByRole("button", { name: "アカウントを削除" }));
        const dialog = screen.getByRole("dialog", { name: "アカウントを削除する" });
        await user.click(within(dialog).getByRole("button", { name: "削除する" }));
        expect(await screen.findByText("見本のため、アカウントは削除しません")).toBeInTheDocument();
    });

    it("通知方法を1つも選ばずに保存するとエラーを出す", async () => {
        const { user } = await renderLoaded("/settings?tab=notifications");
        expect(screen.getByRole("switch", { name: "週次のまとめ" })).toHaveAttribute("aria-checked", "false");
        await user.click(screen.getByRole("switch", { name: "週次のまとめ" }));
        expect(screen.getByRole("switch", { name: "週次のまとめ" })).toHaveAttribute("aria-checked", "true");
        await user.click(screen.getByRole("checkbox", { name: "メール" }));
        await user.click(screen.getByRole("checkbox", { name: /システム内/ }));
        await user.click(screen.getByRole("button", { name: "保存する" }));
        expect(screen.getByText("＊通知方法を一つ以上選んでください")).toBeInTheDocument();
    });

    it("画面レイアウトを上部ナビゲーション型にして保存すると、ヘッダーに水平メニューが出る", async () => {
        restore = mockViewport(1280);
        const { user } = await renderLoaded("/settings?tab=display");
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

    it("日付の形式とタイムゾーンを保存するとlocalStorageに残る", async () => {
        const { user } = await renderLoaded("/settings?tab=display");
        await user.click(screen.getByRole("radio", { name: /米国/ }));
        await user.selectOptions(screen.getByRole("combobox", { name: "タイムゾーン" }), "UTC");
        expect(screen.getByText(/表示の例は/)).toHaveTextContent("10/24/2026");
        await user.click(screen.getByRole("button", { name: "保存する" }));
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")).toEqual({ locale: "en-US", timeZone: "UTC" });
    });

    it("アクセシビリティ違反がない", async () => {
        restore = mockViewport(1280);
        const { container } = await renderLoaded("/settings");
        await expectNoA11yViolations(container);
    });

    it("通知のスイッチはすぐ反映し、保存に失敗したら元に戻してエラーを知らせる", async () => {
        const { user } = await renderLoaded("/settings?tab=notifications");
        const weekly = screen.getByRole("switch", { name: "週次のまとめ" });
        expect(weekly).toHaveAttribute("aria-checked", "false");
        await user.click(weekly);
        expect(weekly).toHaveAttribute("aria-checked", "true");

        setMockOptions({ fail: true, slow: false });
        await user.click(weekly);
        expect(await screen.findByText("通知の設定を変更できませんでした")).toBeInTheDocument();
        expect(screen.getByRole("switch", { name: "週次のまとめ" })).toHaveAttribute("aria-checked", "true");
    });

    it("「動作の確認」で通信を失敗させると、読み込めなかった画面にエラーと「再読み込み」が出る", async () => {
        const { user, router } = await renderLoaded("/settings?tab=display");
        await user.click(screen.getByRole("switch", { name: "通信を失敗させる" }));
        await router.navigate("/applications");
        expect(await screen.findByRole("heading", { name: "申請の一覧を読み込めませんでした" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "再読み込み" })).toBeInTheDocument();
    });
});
