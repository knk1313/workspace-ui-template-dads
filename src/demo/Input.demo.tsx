import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "input",
    title: "テキスト入力",
    category: "フォーム",
    description: "1 行のテキストを入力する。項目ラベル・要否ラベル・サポートテキスト・エラーテキストは FormField が担当する。",
    dadsUrl: "https://design.digital.go.jp/dads/components/input-text/",
    source: "@/components/ui/Input, @/components/ui/FormField",
    examples: [
        {
            title: "基本（ラベル + サポートテキスト）",
            description: "入力条件や例はプレースホルダーではなくサポートテキストに書く。",
            render: () => (
                <FormField label="氏名" requirement="required" supportText="姓と名の間に全角スペースを入れてください。例: 山田　太郎">
                    <Input autoComplete="name" />
                </FormField>
            ),
        },
        {
            title: "エラー",
            description: "枠線をエラー色にし、「＊」で始まるエラーテキストを入力の下に置く。aria-invalid と aria-describedby を付ける。",
            render: () => (
                <FormField label="メールアドレス" requirement="required" supportText="半角英数字で入力してください" errorText="メールアドレスの形式が正しくありません。例: taro@example.go.jp">
                    <Input type="email" defaultValue="taro@example" autoComplete="email" />
                </FormField>
            ),
        },
        {
            title: "サイズ",
            description: "sm 40px / md 48px / lg 56px。周囲の UI 密度に合わせる。",
            render: () => (
                <div className="flex flex-col gap-6">
                    <FormField label="Small" size="sm">
                        <Input />
                    </FormField>
                    <FormField label="Medium" size="md">
                        <Input />
                    </FormField>
                    <FormField label="Large" size="lg">
                        <Input />
                    </FormField>
                </div>
            ),
        },
        {
            title: "入力内容に合わせた幅",
            description: "郵便番号など長さが決まっている値は block を外して幅を指定する。",
            render: () => (
                <FormField label="郵便番号" requirement="optional" supportText="ハイフンなしの 7 桁。例: 1000013">
                    <Input block={false} inputMode="numeric" autoComplete="postal-code" className="w-40" />
                </FormField>
            ),
        },
        {
            title: "横並び（ラベル左）",
            description: "設定画面など項目が多いフォームでは md 以上でラベルを左に置ける。",
            render: () => (
                <FormField label="表示名" direction="horizontal" supportText="他のメンバーに表示されます">
                    <Input />
                </FormField>
            ),
        },
        {
            title: "編集不可（やむを得ない場合のみ）",
            description: "readonly は原則使わない。使う場合は点線の枠、「編集不可」のステート、理由をサポートテキストに書く。",
            render: () => (
                <FormField label="利用者 ID" status="編集不可" supportText="利用者 ID はシステムが発行するため変更できません">
                    <Input readOnly defaultValue="U-2026-00123" />
                </FormField>
            ),
        },
        {
            title: "チェックボックス（単体と fieldset）",
            render: () => (
                <div className="flex flex-col gap-6">
                    <Checkbox>利用規約に同意する</Checkbox>
                    <FormField label="通知を受け取る方法" as="fieldset" supportText="複数選択できます">
                        <div className="flex flex-col">
                            <Checkbox defaultChecked>メール</Checkbox>
                            <Checkbox>SMS</Checkbox>
                            <Checkbox disabled>郵送（現在利用できません）</Checkbox>
                        </div>
                    </FormField>
                    <div className="flex flex-wrap gap-4">
                        <Checkbox size="sm" defaultChecked>
                            Small
                        </Checkbox>
                        <Checkbox size="md" defaultChecked>
                            Medium
                        </Checkbox>
                        <Checkbox size="lg" defaultChecked>
                            Large
                        </Checkbox>
                        <Checkbox indeterminate aria-label="一部選択" />
                    </div>
                </div>
            ),
        },
    ],
};

export default demo;
