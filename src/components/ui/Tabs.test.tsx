import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Tab, TabList, TabPanel, Tabs } from "./Tabs";

const items = [
    { value: "summary", label: "概要", panel: <p>概要の内容</p> },
    { value: "history", label: "履歴", panel: <p>履歴の内容</p> },
    { value: "files", label: "添付ファイル", panel: <p>添付の内容</p> },
];

describe("Tabs", () => {
    it("tablist / tab / tabpanel のロールと関連付けを持つ", () => {
        render(<Tabs label="申請の詳細" items={items} />);
        expect(screen.getByRole("tablist", { name: "申請の詳細" })).toBeInTheDocument();
        const tabs = screen.getAllByRole("tab");
        expect(tabs).toHaveLength(3);
        expect(tabs[0]).toHaveAttribute("aria-selected", "true");
        expect(tabs[0]).toHaveAttribute("tabindex", "0");
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveAttribute("tabindex", "-1");
        const panel = screen.getByRole("tabpanel");
        expect(panel).toHaveAttribute("id", tabs[0].getAttribute("aria-controls"));
        expect(panel).toHaveAttribute("aria-labelledby", tabs[0].id);
        expect(panel).toHaveAttribute("tabindex", "0");
        expect(panel).toHaveTextContent("概要の内容");
        expect(tabs[0]).toHaveClass("border-b-4", "border-primary", "font-bold", "text-primary");
        expect(tabs[1]).toHaveClass("border-b-4", "border-transparent");
        expect(screen.getByRole("tablist")).toHaveClass("border-b", "border-border");
    });

    it("クリックで切り替え、onChange を呼ぶ", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Tabs label="詳細" items={items} onChange={onChange} />);
        await user.click(screen.getByRole("tab", { name: "履歴" }));
        expect(onChange).toHaveBeenCalledWith("history");
        expect(screen.getByRole("tabpanel")).toHaveTextContent("履歴の内容");
    });

    it("← → / Home / End で移動して自動選択する（端で折り返す）", async () => {
        const user = userEvent.setup();
        render(<Tabs label="詳細" items={items} />);
        await user.tab();
        expect(screen.getByRole("tab", { name: "概要" })).toHaveFocus();
        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("tab", { name: "履歴" })).toHaveFocus();
        expect(screen.getByRole("tab", { name: "履歴" })).toHaveAttribute("aria-selected", "true");
        await user.keyboard("{End}");
        expect(screen.getByRole("tab", { name: "添付ファイル" })).toHaveAttribute("aria-selected", "true");
        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("tab", { name: "概要" })).toHaveFocus();
        await user.keyboard("{ArrowLeft}");
        expect(screen.getByRole("tab", { name: "添付ファイル" })).toHaveFocus();
        await user.keyboard("{Home}");
        expect(screen.getByRole("tab", { name: "概要" })).toHaveAttribute("aria-selected", "true");
    });

    it("Tab でタブリストからパネルへ移動する", async () => {
        const user = userEvent.setup();
        render(<Tabs label="詳細" items={items} />);
        await user.tab();
        await user.tab();
        expect(screen.getByRole("tabpanel")).toHaveFocus();
    });

    it("activation=manual では矢印でフォーカスだけ動き、Enter で選択する", async () => {
        const user = userEvent.setup();
        render(<Tabs label="詳細" items={items} activation="manual" />);
        await user.tab();
        await user.keyboard("{ArrowRight}");
        const history = screen.getByRole("tab", { name: "履歴" });
        expect(history).toHaveFocus();
        expect(history).toHaveAttribute("aria-selected", "false");
        await user.keyboard("{Enter}");
        expect(history).toHaveAttribute("aria-selected", "true");
    });

    it("合成 API と制御モードで使える", async () => {
        const user = userEvent.setup();
        function Controlled() {
            const [value, setValue] = useState("b");
            return (
                <Tabs label="合成" value={value} onChange={setValue}>
                    <TabList>
                        <Tab value="a">A</Tab>
                        <Tab value="b">B</Tab>
                    </TabList>
                    <TabPanel value="a">パネル A</TabPanel>
                    <TabPanel value="b">パネル B</TabPanel>
                </Tabs>
            );
        }
        render(<Controlled />);
        expect(screen.getByRole("tabpanel")).toHaveTextContent("パネル B");
        await user.click(screen.getByRole("tab", { name: "A" }));
        expect(screen.getByRole("tabpanel")).toHaveTextContent("パネル A");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(<Tabs label="詳細" items={items} defaultValue="history" />);
        await expectNoA11yViolations(container);
    });
});
