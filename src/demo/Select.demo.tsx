import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import type { ComponentDemo } from "./types";

const PREFECTURES = [
    { value: "01", label: "北海道" },
    { value: "13", label: "東京都" },
    { value: "14", label: "神奈川県" },
    { value: "23", label: "愛知県" },
    { value: "27", label: "大阪府" },
    { value: "40", label: "福岡県" },
];

const STATUSES = [
    { value: "draft", label: "下書き" },
    { value: "review", label: "審査中" },
    { value: "approved", label: "承認済み" },
    { value: "rejected", label: "差戻し" },
    { value: "archived", label: "保管（選択不可）", disabled: true },
    { value: "deleted", label: "削除済み" },
];

const demo: ComponentDemo = {
    slug: "select",
    title: "セレクトボックス",
    category: "フォーム",
    description: "複数の選択肢から 1 つを選ぶ。ネイティブの select を使い、展開時のリストは OS 標準のまま。選択肢が 5 つ以下ならラジオボタンを使う。",
    dadsUrl: "https://design.digital.go.jp/dads/components/select/",
    source: "@/components/ui/Select, @/components/ui/FormField",
    examples: [
        {
            title: "基本（options + placeholder）",
            description: "幅は既定で内容に合わせる。任意項目では未選択を表す先頭の選択肢（value=\"\"）を置く。",
            render: () => (
                <FormField label="都道府県" requirement="required" supportText="お住まいの都道府県を選んでください">
                    <Select options={PREFECTURES} placeholder="選択してください" />
                </FormField>
            ),
        },
        {
            title: "エラー",
            render: () => (
                <FormField label="ステータス" requirement="required" errorText="ステータスを選択してください">
                    <Select options={STATUSES} placeholder="選択してください" />
                </FormField>
            ),
        },
        {
            title: "サイズ",
            description: "sm 40px / md 48px / lg 56px。",
            render: () => (
                <div className="flex flex-col gap-6">
                    <FormField label="Small" size="sm">
                        <Select options={PREFECTURES} />
                    </FormField>
                    <FormField label="Medium" size="md">
                        <Select options={PREFECTURES} />
                    </FormField>
                    <FormField label="Large" size="lg">
                        <Select options={PREFECTURES} />
                    </FormField>
                </div>
            ),
        },
        {
            title: "幅いっぱい・children で option を書く",
            description: "フォーム内で他の入力欄と幅を揃えるときは block を付ける。",
            render: () => (
                <FormField label="並び順" direction="horizontal">
                    <Select block>
                        <option value="updated-desc">更新日が新しい順</option>
                        <option value="updated-asc">更新日が古い順</option>
                        <option value="name">名前順</option>
                    </Select>
                </FormField>
            ),
        },
        {
            title: "単体（ラベルは aria-label）・無効",
            description: "テーブルコントロールなど文脈でラベルが明らかな場合。disabled は原則使わない。",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <Select aria-label="表示件数" size="sm" defaultValue="50">
                        <option value="20">20 件</option>
                        <option value="50">50 件</option>
                        <option value="100">100 件</option>
                    </Select>
                    <Select aria-label="無効の例" size="sm" options={PREFECTURES} disabled />
                </div>
            ),
        },
    ],
};

export default demo;
