import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { setMockOptions } from "@/api/mock";
import { mockViewport } from "@/layouts/testUtils";
import { APPLICATIONS } from "@/mocks/applications";
import { expectNoA11yViolations } from "@/test/axe";
import { renderApp } from "@/test/renderApp";

// 読み込みが終わり、1 ページ目の行が出るまで待つ。
async function renderList(path = "/applications") {
    const result = renderApp(path);
    await waitForLoaded();
    return result;
}

async function waitForLoaded() {
    await screen.findAllByRole("rowheader", undefined, { timeout: 2000 });
}

// ヘッダーにも「検索」ボタンがあるので、一覧の検索フォームの中に限定する
async function search(user: ReturnType<typeof renderApp>["user"], text: string) {
    const box = screen.getByRole("searchbox", { name: "受付番号・件名・申請者で検索" });
    await user.type(box, text);
    await user.click(within(box.closest("form")!).getByRole("button", { name: "検索" }));
}

function rowHeaders(): string[] {
    // 行見出しには受付番号（リンク）と件名が入る。受付番号だけを取り出す。
    return screen.getAllByRole("rowheader").map((cell) => cell.querySelector("a")?.textContent ?? "");
}

function bodyRowCount(): number {
    // 見出し行を除く
    return screen.getAllByRole("row").length - 1;
}

describe("ApplicationListPage", () => {
    it("見出し・新規申請ボタンを表示し、読み込み中のあとに 20 件ずつ表示する", async () => {
        renderApp("/applications");
        expect(screen.getByRole("heading", { level: 1, name: "申請一覧" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "新規申請" })).toHaveAttribute("href", "/applications/new");
        expect(screen.getAllByText("読み込み中").length).toBeGreaterThan(0);

        await waitForLoaded();
        expect(screen.getByText(`全 ${APPLICATIONS.length} 件中 1〜20 件`)).toBeInTheDocument();
        expect(bodyRowCount()).toBe(20);
        expect(screen.getByText((_, el) => el?.tagName === "P" && el.textContent === `全 ${APPLICATIONS.length} 件`)).toBeInTheDocument();
    });

    it("キーワード検索で行が絞り込まれ、条件がチップで表示される", async () => {
        const { user } = await renderList();
        const target = APPLICATIONS[0];
        await search(user, target.number);

        expect(rowHeaders()).toEqual([target.number]);
        const chips = screen.getByRole("list", { name: "適用中の条件" });
        expect(within(chips).getByText(`キーワード: ${target.number}`)).toBeInTheDocument();

        // チップを外すと全件に戻る
        await user.click(within(chips).getByRole("button", { name: `キーワード: ${target.number} を削除` }));
        expect(bodyRowCount()).toBe(20);
    });

    it("列見出しで並べ替えると順序が変わる", async () => {
        const { user } = await renderList();
        const numbers = APPLICATIONS.map((a) => a.number).sort();

        await user.click(screen.getByRole("button", { name: /^受付番号/ }));
        expect(rowHeaders()[0]).toBe(numbers[0]);
        expect(screen.getByRole("columnheader", { name: /受付番号/ })).toHaveAttribute("aria-sort", "ascending");

        await user.click(screen.getByRole("button", { name: /^受付番号/ }));
        expect(rowHeaders()[0]).toBe(numbers[numbers.length - 1]);
    });

    it("ページ送りで次の 20 件を表示する", async () => {
        const { user } = await renderList();
        const firstPage = rowHeaders();
        await user.click(screen.getByRole("button", { name: "2 ページ目" }));
        expect(screen.getByText(`全 ${APPLICATIONS.length} 件中 21〜40 件`)).toBeInTheDocument();
        expect(rowHeaders()).not.toEqual(firstPage);
    });

    it("全選択して一括削除すると、確認なしで行が消え、トーストの「元に戻す」で取り消せる", async () => {
        const { user } = await renderList();
        await user.click(screen.getByRole("checkbox", { name: "すべての行を選択" }));
        const bulk = screen.getByRole("region", { name: "選択中の項目の操作" });
        expect(within(bulk).getByText("20 件選択中")).toBeInTheDocument();

        await user.click(within(bulk).getByRole("button", { name: "削除" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(await screen.findByText("20 件の申請を削除しました")).toBeInTheDocument();
        expect(screen.getByText(`全 ${APPLICATIONS.length - 20} 件中 1〜20 件`)).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "選択中の項目の操作" })).not.toBeInTheDocument();
        // 消えた行にあったフォーカスは見出しへ移る
        expect(screen.getByRole("heading", { level: 1, name: "申請一覧" })).toHaveFocus();

        await user.click(screen.getByRole("button", { name: "元に戻す" }));
        expect(await screen.findByText("20 件の申請の削除を取り消しました")).toBeInTheDocument();
        expect(await screen.findByText(`全 ${APPLICATIONS.length} 件中 1〜20 件`)).toBeInTheDocument();
    });

    it("一括で担当者を変更できる", async () => {
        const { user } = await renderList();
        const first = rowHeaders()[0];
        await user.click(screen.getByRole("checkbox", { name: new RegExp(`^${first} `) }));
        await user.click(screen.getByRole("button", { name: "担当者を変更" }));
        const dialog = screen.getByRole("dialog", { name: "担当者を変更" });
        await user.selectOptions(within(dialog).getByLabelText("新しい担当者"), "田中 健太");
        await user.click(within(dialog).getByRole("button", { name: "変更する" }));
        expect(screen.getByText("1 件の担当者を 田中 健太 に変更しました")).toBeInTheDocument();
        const row = screen.getByRole("link", { name: first }).closest("tr")!;
        expect(within(row).getByText("田中 健太")).toBeInTheDocument();
    });

    it("該当がないと空状態を表示し、条件をクリアで元に戻る", async () => {
        const { user } = await renderList();
        await search(user, "該当しないキーワード");

        expect(screen.getByRole("heading", { name: "条件に一致する申請はありません" })).toBeInTheDocument();
        await user.click(within(screen.getByRole("table")).getByRole("button", { name: "条件をクリア" }));
        expect(bodyRowCount()).toBe(20);
        expect(screen.getByRole("searchbox")).toHaveValue("");
    });

    it("行のメニューから詳細を開き、パンくずで絞り込み条件を保ったまま戻れる", async () => {
        const target = APPLICATIONS.find((a) => a.category === "subsidy")!;
        const { user } = await renderList(`/applications?category=subsidy&sort=number:asc`);
        expect(within(screen.getByRole("list", { name: "適用中の条件" })).getByText("種別: 補助金")).toBeInTheDocument();
        expect(rowHeaders()[0]).toBe(target.number);

        await user.click(screen.getByRole("button", { name: `${target.number} の操作` }));
        await user.click(screen.getByRole("menuitem", { name: "詳細を見る" }));
        expect(screen.getByRole("heading", { level: 1, name: target.title })).toBeInTheDocument();

        await user.click(within(screen.getByRole("navigation", { name: "パンくずリスト" })).getByRole("link", { name: "申請一覧" }));
        await waitForLoaded();
        expect(within(screen.getByRole("list", { name: "適用中の条件" })).getByText("種別: 補助金")).toBeInTheDocument();
        expect(rowHeaders()[0]).toBe(target.number);
    });

    it("モバイルでは種別などの絞り込みをドロワーで行う", async () => {
        const { user } = await renderList();
        expect(screen.queryByLabelText("状態")).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "絞り込み" }));
        const drawer = screen.getByRole("dialog", { name: "絞り込み" });
        await user.selectOptions(within(drawer).getByLabelText("状態"), "approved");
        const count = APPLICATIONS.filter((a) => a.status === "approved").length;
        await user.click(within(drawer).getByRole("button", { name: `${count} 件を表示` }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "絞り込み（1）" })).toBeInTheDocument();
        expect(screen.getByText("状態: 承認")).toBeInTheDocument();
    });

    it("アクセシビリティ違反がない（モバイル幅）", async () => {
        const { container } = await renderList();
        await expectNoA11yViolations(container);
    });

    it("アクセシビリティ違反がない（デスクトップ幅）", async () => {
        const restore = mockViewport(1280);
        try {
            const { container } = await renderList("/applications?status=reviewing");
            expect(screen.getByLabelText("状態", { selector: "select" })).toHaveValue("reviewing");
            await expectNoA11yViolations(container);
        } finally {
            restore();
        }
    });

    it("読み込めなかったときは表を出さずにエラーを表示し、「再読み込み」でやり直せる", async () => {
        setMockOptions({ fail: true, slow: false });
        const { user, container } = renderApp("/applications");
        expect(await screen.findByRole("heading", { name: "申請の一覧を読み込めませんでした" })).toBeInTheDocument();
        // 空の表（「申請はまだありません」）と誤解されないよう、表は出さない
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
        await expectNoA11yViolations(container);

        setMockOptions({ fail: false, slow: false });
        await user.click(screen.getByRole("button", { name: "再読み込み" }));
        await waitForLoaded();
        expect(screen.queryByRole("heading", { name: "申請の一覧を読み込めませんでした" })).not.toBeInTheDocument();
    });

    it("削除は画面を移っても保たれる（ダミー API に反映される）", async () => {
        const { user, router } = await renderList();
        const first = rowHeaders()[0];
        await user.click(screen.getByRole("button", { name: `${first} の操作` }));
        await user.click(screen.getByRole("menuitem", { name: "削除" }));
        expect(await screen.findByText(`${first} を削除しました`)).toBeInTheDocument();
        await router.navigate("/");
        await router.navigate("/applications");
        await waitForLoaded();
        expect(rowHeaders()).not.toContain(first);
    });
});
