import { useState } from "react";
import { History, Info, Paperclip } from "lucide-react";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/Tabs";
import type { ComponentDemo } from "./types";

function ControlledTabs() {
    const [value, setValue] = useState("week");
    return (
        <div className="flex flex-col gap-2">
            <Tabs label="集計期間" value={value} onChange={setValue} activation="manual">
                <TabList>
                    <Tab value="day">日次</Tab>
                    <Tab value="week">週次</Tab>
                    <Tab value="month">月次</Tab>
                </TabList>
                <TabPanel value="day">日ごとの集計を表示します。</TabPanel>
                <TabPanel value="week">週ごとの集計を表示します。</TabPanel>
                <TabPanel value="month">月ごとの集計を表示します。</TabPanel>
            </Tabs>
            <p className="m-0 text-text-muted">選択中: {value}</p>
        </div>
    );
}

const demo: ComponentDemo = {
    slug: "tabs",
    title: "タブ",
    category: "ナビゲーション",
    description: "同じ主題のコンテンツを観点ごとに切り替える。← → / Home / End で移動する。ページの移動には水平メニュー、絞り込みにはフォーム部品を使う。",
    dadsUrl: "https://design.digital.go.jp/dads/components/tab/",
    source: "@/components/ui/Tabs",
    examples: [
        {
            title: "items で指定",
            description: "矢印キーで移動すると自動で選択される（activation=\"automatic\"）。",
            render: () => (
                <Tabs
                    label="申請の詳細"
                    items={[
                        { value: "summary", label: "概要", icon: Info, panel: <p className="m-0">申請者、申請日、申請内容の概要です。</p> },
                        { value: "history", label: "履歴", icon: History, panel: <p className="m-0">受付から現在までの処理の履歴です。</p> },
                        { value: "files", label: "添付ファイル", icon: Paperclip, panel: <p className="m-0">添付された書類の一覧です。</p> },
                    ]}
                />
            ),
        },
        {
            title: "合成 API・手動選択",
            description: "TabList / Tab / TabPanel を組み合わせる。activation=\"manual\" では矢印でフォーカスだけ動き、Enter / Space で選択する。",
            render: () => <ControlledTabs />,
        },
        {
            title: "多数のタブ（横スクロール）",
            render: () => (
                <div className="max-w-sm">
                    <Tabs
                        label="年度"
                        items={["2020", "2021", "2022", "2023", "2024", "2025", "2026"].map((y) => ({
                            value: y,
                            label: `${y} 年度`,
                            panel: <p className="m-0">{y} 年度のデータです。</p>,
                        }))}
                        defaultValue="2026"
                    />
                </div>
            ),
        },
    ],
};

export default demo;
