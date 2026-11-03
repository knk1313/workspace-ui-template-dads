import { StepNavigation } from "@/components/ui/StepNavigation";
import type { ComponentDemo } from "./types";

const steps = [
    { label: "申請内容の入力", description: "氏名・住所など" },
    { label: "添付書類", description: "本人確認書類" },
    { label: "内容の確認" },
    { label: "申請完了" },
];

const demo: ComponentDemo = {
    slug: "step-navigation",
    title: "ステップナビゲーション",
    category: "ナビゲーション",
    description: "複数の画面にわたる手続きの流れと現在位置を示す。現在のステップに aria-current=\"step\"、スクリーンリーダーには「ステップ n / N」を読み上げる。",
    dadsUrl: "https://design.digital.go.jp/dads/components/step-navigation/",
    source: "@/components/ui/StepNavigation",
    examples: [
        {
            title: "横並び",
            description: "幅が足りないときは横スクロールする。",
            render: () => <StepNavigation steps={steps} current={1} label="申請の流れ（横）" />,
        },
        {
            title: "縦並び（モバイル推奨）",
            render: () => <StepNavigation steps={steps} current={2} orientation="vertical" label="申請の流れ（縦）" />,
        },
    ],
};

export default demo;
