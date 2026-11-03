import { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import type { ComponentDemo } from "./types";

function BasicExample() {
    const [notify, setNotify] = useState(true);
    const [location, setLocation] = useState(false);
    return (
        <div className="flex flex-col gap-4">
            <Switch label="メール通知" checked={notify} onChange={setNotify} />
            <Switch label="位置情報の利用" checked={location} onChange={setLocation} />
            <p className="m-0 text-16 text-text-muted">
                メール通知: {notify ? "On" : "Off"} / 位置情報: {location ? "On" : "Off"}
            </p>
        </div>
    );
}

function SettingsRows() {
    const [rows, setRows] = useState([
        { id: "dark", label: "ダークモード", on: false },
        { id: "compact", label: "コンパクト表示", on: true },
        { id: "sound", label: "操作音", on: false },
    ]);
    return (
        <ul className="m-0 flex max-w-md list-none flex-col divide-y divide-border p-0">
            {rows.map((row) => (
                <li key={row.id} className="flex items-center justify-between py-3">
                    <Switch
                        label={row.label}
                        checked={row.on}
                        onChange={(on) => setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, on } : r)))}
                        className="w-full justify-between"
                    />
                </li>
            ))}
        </ul>
    );
}

const demo: ComponentDemo = {
    slug: "switch",
    title: "スイッチ",
    category: "フォーム",
    description: "切り替えた結果がその場で反映される設定に使う。保存ボタンで確定する項目や結果がすぐ分からない項目にはチェックボックスを使う。",
    dadsUrl: "https://design.digital.go.jp/dads/components/switch/",
    source: "@/components/ui/Switch",
    examples: [
        {
            title: "基本（On / Off）",
            description: "role=\"switch\" + aria-checked。ラベルは左に置き、Space / Enter で切り替える。On はキーカラーでチェックアイコン付き。",
            render: () => <BasicExample />,
        },
        {
            title: "設定一覧（ラベルとスイッチを両端に）",
            description: "className で幅と配置を調整できる。",
            render: () => <SettingsRows />,
        },
        {
            title: "無効（原則使わない）",
            description: "使う場合は理由を近くに書く。",
            render: () => (
                <div className="flex flex-col gap-2">
                    <Switch label="二要素認証" checked disabled onChange={() => {}} />
                    <p className="m-0 text-16 text-text-muted">組織の方針により二要素認証は必須です。変更できません。</p>
                </div>
            ),
        },
    ],
};

export default demo;
