import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Panel } from "@/components/ui/Panel";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "panel",
    title: "パネル",
    category: "レイアウト",
    description: "地と同系色の控えめな面。フィルター領域や補足情報など、カードほど強く区切らずにまとまりを示すときに使う。",
    source: "@/components/ui/Panel",
    examples: [
        {
            title: "フィルター領域",
            render: () => (
                <Panel title="絞り込み">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <FormField label="キーワード" size="sm" className="flex-1">
                            <Input />
                        </FormField>
                        <Button size="md">絞り込む</Button>
                    </div>
                </Panel>
            ),
        },
        {
            title: "補足情報（見出しなし）",
            render: () => (
                <Panel padding="sm">
                    <p className="m-0">申請の受付は平日 9 時から 17 時までです。受付後 3 営業日以内に審査結果をお知らせします。</p>
                </Panel>
            ),
        },
    ],
};

export default demo;
