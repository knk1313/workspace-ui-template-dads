import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "action-panel",
    title: "アクションパネル",
    category: "フォーム",
    description: "フォーム下部のボタン配置。確定は右端、キャンセルは左端、セカンダリーは確定の左。モバイルは縦積みで DOM 順（セカンダリー → プライマリー → キャンセル）。",
    dadsUrl: "https://design.digital.go.jp/dads/components/button/",
    source: "@/components/ui/ActionPanel",
    examples: [
        {
            title: "確定 + セカンダリー + キャンセル",
            description: "ウィンドウ幅を狭めると縦積みになる。Tab 順は常に DOM 順。",
            render: () => (
                <ActionPanel primary={<Button>保存する</Button>} secondary={<Button variant="outline">下書き保存</Button>} cancel={<Button variant="text">キャンセル</Button>} />
            ),
        },
        {
            title: "セカンダリーが複数",
            description: "セカンダリーは最大 3 つ。配列で渡す。",
            render: () => (
                <ActionPanel
                    primary={<Button>申請する</Button>}
                    secondary={[
                        <Button key="draft" variant="outline">
                            下書き保存
                        </Button>,
                        <Button key="preview" variant="outline">
                            プレビュー
                        </Button>,
                    ]}
                    cancel={<Button variant="text">キャンセル</Button>}
                />
            ),
        },
        {
            title: "確定のみ / 取り消せない操作",
            render: () => (
                <div className="flex flex-col gap-8">
                    <ActionPanel primary={<Button>次へ</Button>} />
                    <ActionPanel primary={<Button tone="error">削除する</Button>} cancel={<Button variant="text">キャンセル</Button>} />
                </div>
            ),
        },
        {
            title: "画面下部に固定（sticky）",
            description: "長いフォームで常に確定ボタンが見えるようにする。スクロールできる枠の中で確認できる。",
            render: () => (
                <div className="flex max-h-80 flex-col gap-6 overflow-y-auto rounded-8 border border-border p-4">
                    <FormField label="件名" requirement="required">
                        <Input />
                    </FormField>
                    <FormField label="本文" requirement="required">
                        <Textarea rows={6} />
                    </FormField>
                    <FormField label="補足" requirement="optional">
                        <Textarea rows={6} />
                    </FormField>
                    <ActionPanel sticky className="-mx-4 -mb-4 px-4" primary={<Button>送信する</Button>} cancel={<Button variant="text">キャンセル</Button>} />
                </div>
            ),
        },
    ],
};

export default demo;
