import { describe, expect, it } from "vitest";
import { createApplication, deleteApplications, listApplications } from "./applications";
import type { ApplicationInput } from "./applicationTypes";

const input: ApplicationInput = {
    title: "受付番号の確認",
    category: "other",
    amount: 0,
    applicant: "山田 太郎",
    organization: "個人",
    email: "yamada@example.jp",
    phone: "",
    desiredDate: "2099-12-01",
    assignee: "",
    attachments: [],
};

describe("createApplication", () => {
    it("削除したあとに作成しても、受付番号が重複しない", async () => {
        const first = await createApplication(input);
        const { items } = await listApplications({ page: 1, pageSize: 10 });
        await deleteApplications([items[1].id, items[2].id]);
        const second = await createApplication(input);
        expect(second.number).not.toBe(first.number);
        const numbers = (await listApplications({ page: 1, pageSize: 1000 })).items.map((a) => a.number);
        expect(new Set(numbers).size).toBe(numbers.length);
    });
});

describe("listApplications", () => {
    it("絞り込み・並べ替え・ページ送りをして、1ページ分と総数を返す", async () => {
        const all = await listApplications({ page: 1, pageSize: 1000 });
        const subsidies = all.items.filter((a) => a.category === "subsidy");
        const page2 = await listApplications({ category: "subsidy", sort: { key: "number", direction: "asc" }, page: 2, pageSize: 5 });
        expect(page2.total).toBe(subsidies.length);
        expect(page2.items).toHaveLength(Math.min(5, subsidies.length - 5));
        const sortedNumbers = subsidies.map((a) => a.number).sort();
        expect(page2.items.map((a) => a.number)).toEqual(sortedNumbers.slice(5, 10));
    });

    it("キーワードは全角でも、受付番号・件名・申請者に部分一致する", async () => {
        const { items } = await listApplications({ page: 1, pageSize: 1 });
        const target = items[0];
        const fullWidth = target.number.replace(/[0-9A-Z-]/g, (c) => (c === "-" ? "－" : String.fromCharCode(c.charCodeAt(0) + 0xfee0)));
        const found = await listApplications({ q: fullWidth, page: 1, pageSize: 20 });
        expect(found.items.map((a) => a.id)).toEqual([target.id]);
    });
});
