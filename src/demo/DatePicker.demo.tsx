import { useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormField } from "@/components/ui/FormField";
import type { ComponentDemo } from "./types";

function BasicExample() {
    const [value, setValue] = useState("");
    return (
        <div className="flex flex-col gap-4">
            <FormField label="開催日" requirement="required" supportText="西暦で YYYY-MM-DD の形式。例: 2026-04-01">
                <DatePicker value={value} onChange={setValue} />
            </FormField>
            <p className="m-0 text-16 text-text-muted">値: {value || "（未入力）"}</p>
        </div>
    );
}

function RangeExample() {
    const [value, setValue] = useState("2026-11-10");
    return (
        <FormField label="希望日" requirement="required" supportText="2026-11-01 から 2026-11-30 の間で選んでください（YYYY-MM-DD）">
            <DatePicker value={value} onChange={setValue} min="2026-11-01" max="2026-11-30" />
        </FormField>
    );
}

function BirthdayExample() {
    const [value, setValue] = useState("");
    return (
        <FormField label="生年月日" requirement="required" supportText="西暦で YYYY-MM-DD の形式。例: 1990-01-23">
            <DatePicker value={value} onChange={setValue} showCalendar={false} autoComplete="bday" />
        </FormField>
    );
}

function ErrorExample() {
    const [value, setValue] = useState("2026-13-45");
    return (
        <FormField label="申請日" requirement="required" supportText="西暦で YYYY-MM-DD の形式" errorText="存在しない日付です。YYYY-MM-DD の形式で入力してください">
            <DatePicker value={value} onChange={setValue} />
        </FormField>
    );
}

function SizeExample() {
    const [sm, setSm] = useState("");
    const [lg, setLg] = useState("");
    return (
        <div className="flex flex-col gap-6">
            <FormField label="Small" size="sm" supportText="YYYY-MM-DD">
                <DatePicker value={sm} onChange={setSm} />
            </FormField>
            <FormField label="Large" size="lg" supportText="YYYY-MM-DD">
                <DatePicker value={lg} onChange={setLg} />
            </FormField>
        </div>
    );
}

const demo: ComponentDemo = {
    slug: "date-picker",
    title: "日付ピッカー",
    category: "フォーム",
    description: "日付を直接入力し、必要に応じてカレンダーから選ぶ。生年月日のような既知の日付ではカレンダーボタンを置かない。",
    dadsUrl: "https://design.digital.go.jp/dads/components/date-picker/",
    source: "@/components/ui/DatePicker, @/components/ui/FormField",
    examples: [
        {
            title: "基本",
            description:
                "入力は blur で正規化する（全角→半角、2026/4/1 → 2026-04-01）。カレンダーはボタンからだけ開き、矢印キーで日、PageUp / PageDown で月を移動、Enter で選択、Esc で閉じる。",
            render: () => <BasicExample />,
        },
        {
            title: "選択できる範囲（min / max）",
            description: "範囲外の日は aria-disabled で選べない。範囲はサポートテキストにも書く。",
            render: () => <RangeExample />,
        },
        {
            title: "直接入力のみ（生年月日）",
            description: "既知の日付ではカレンダーは役に立たない。autocomplete=\"bday\" を付ける。",
            render: () => <BirthdayExample />,
        },
        {
            title: "エラー",
            description: "解釈できない入力はそのまま残し、エラーテキストで修正方法を示す。",
            render: () => <ErrorExample />,
        },
        {
            title: "サイズ",
            render: () => <SizeExample />,
        },
    ],
};

export default demo;
