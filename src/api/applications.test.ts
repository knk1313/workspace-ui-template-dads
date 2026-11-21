import { describe, expect, it } from "vitest";
import { createApplication, deleteApplications, listApplications } from "./applications";
import type { ApplicationInput } from "./applicationTypes";

const input: ApplicationInput = {
    title: "受付番号の確認",
    category: "other",
    amount: 0,
    applicant: "山田 太郎",
    organization: "個人",
    assignee: "",
    attachments: [],
};

describe("createApplication", () => {
    it("削除したあとに作成しても、受付番号が重複しない", async () => {
        const first = await createApplication(input);
        const all = await listApplications();
        await deleteApplications([all[1].id, all[2].id]);
        const second = await createApplication(input);
        expect(second.number).not.toBe(first.number);
        const numbers = (await listApplications()).map((a) => a.number);
        expect(new Set(numbers).size).toBe(numbers.length);
    });
});
