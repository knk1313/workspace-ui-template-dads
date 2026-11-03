import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { FormField } from "./FormField";
import { FormLayout, FormSection } from "./FormLayout";
import { Input } from "./Input";

describe("FormLayout / FormSection", () => {
    it("FormLayoutはcolumns / gapに応じたクラスを付ける", () => {
        const { rerender } = render(
            <FormLayout>
                <p>A</p>
            </FormLayout>,
        );
        const layout = screen.getByText("A").parentElement!;
        expect(layout).toHaveClass("grid", "grid-cols-1", "gap-6");
        expect(layout).not.toHaveClass("md:grid-cols-2");
        rerender(
            <FormLayout columns={2} gap="lg" className="mt-4">
                <p>A</p>
            </FormLayout>,
        );
        expect(screen.getByText("A").parentElement).toHaveClass("md:grid-cols-2", "gap-8", "mt-4");
    });

    it("FormSectionは見出し付きのsectionになり、説明を表示する", () => {
        render(
            <FormSection title="基本情報" description="氏名と連絡先を入力してください" headingLevel={3}>
                <FormField label="氏名">
                    <Input />
                </FormField>
            </FormSection>,
        );
        const section = screen.getByRole("region", { name: "基本情報" });
        expect(section.tagName).toBe("SECTION");
        expect(screen.getByRole("heading", { level: 3, name: "基本情報" })).toBeInTheDocument();
        expect(screen.getByText("氏名と連絡先を入力してください")).toBeInTheDocument();
        expect(section).not.toHaveClass("md:grid-cols-3");
    });

    it("layout=settingsでmd以上は見出し1/3・項目2/3のグリッドになる", () => {
        render(
            <FormSection title="通知" layout="settings" id="notify">
                <p>内容</p>
            </FormSection>,
        );
        const section = screen.getByRole("region", { name: "通知" });
        expect(section).toHaveAttribute("id", "notify");
        expect(section).toHaveClass("md:grid", "md:grid-cols-3");
        expect(screen.getByRole("heading").parentElement).toHaveClass("md:col-span-1");
        expect(screen.getByText("内容").parentElement).toHaveClass("md:col-span-2");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <main>
                <h1>設定</h1>
                <FormLayout columns={2}>
                    <FormSection title="基本情報" description="説明" className="md:col-span-2">
                        <FormField label="氏名">
                            <Input />
                        </FormField>
                    </FormSection>
                    <FormSection title="通知" layout="settings" className="md:col-span-2">
                        <FormField label="メール">
                            <Input type="email" />
                        </FormField>
                    </FormSection>
                </FormLayout>
            </main>,
        );
        await expectNoA11yViolations(container);
    });
});
