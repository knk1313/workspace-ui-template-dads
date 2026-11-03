import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "textarea",
    title: "テキストエリア",
    category: "フォーム",
    description: "自由記述のテキストを入力する。質問を分割して記述量を減らせないか先に検討する。文字数制限はラベルに明記し、カウンターを併用する。",
    dadsUrl: "https://design.digital.go.jp/dads/components/textarea/",
    source: "@/components/ui/Textarea, @/components/ui/FormField",
    examples: [
        {
            title: "基本",
            description: "項目ラベル・サポートテキストは FormField が担当する。既定は 4 行、縦方向にだけ伸縮できる。",
            render: () => (
                <FormField label="お問い合わせ内容" requirement="required" supportText="できるだけ具体的に書いてください。例: 申請番号、発生日時、画面に表示されたメッセージ">
                    <Textarea />
                </FormField>
            ),
        },
        {
            title: "文字数カウンター",
            description: "最大文字数はラベルに書き、counterMax でカウンターを常時表示する。maxLength で入力を止めず、超過をエラー色で知らせる。",
            render: () => (
                <FormField label="自己紹介（200 文字以内）" requirement="optional">
                    <Textarea counterMax={200} rows={6} defaultValue="デジタル庁のデザインシステムをもとに、行政向けの業務システムのテンプレートを作っています。" />
                </FormField>
            ),
        },
        {
            title: "エラー",
            description: "枠線をエラー色にし、「＊」で始まるエラーテキストを置く。aria-invalid と aria-describedby を付ける。",
            render: () => (
                <FormField label="理由（100 文字以内）" requirement="required" errorText="100 文字以内で入力してください">
                    <Textarea
                        counterMax={100}
                        defaultValue="制度の内容を確認したところ、提出済みの書類に記載した内容と現在の状況が異なっていることが分かったため、訂正の手続きをお願いしたく、ご連絡いたしました。お手数をおかけしますがよろしくお願いいたします。"
                    />
                </FormField>
            ),
        },
        {
            title: "行数と伸縮",
            description: "rows で初期の高さ、resize で伸縮の方向を決める。",
            render: () => (
                <div className="flex flex-col gap-6">
                    <FormField label="2 行・伸縮なし">
                        <Textarea rows={2} resize="none" />
                    </FormField>
                    <FormField label="8 行・縦横に伸縮">
                        <Textarea rows={8} resize="both" />
                    </FormField>
                </div>
            ),
        },
        {
            title: "編集不可（やむを得ない場合のみ）",
            description: "readonly は点線の枠。「編集不可」のステートと理由をサポートテキストに書く。",
            render: () => (
                <FormField label="審査コメント" status="編集不可" supportText="審査担当者が記入した内容のため変更できません">
                    <Textarea readOnly rows={3} defaultValue="添付書類の不足はありません。" />
                </FormField>
            ),
        },
    ],
};

export default demo;
