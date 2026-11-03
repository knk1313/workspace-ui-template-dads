import { Download, Plus, Trash2 } from "lucide-react";
import { Button, ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "button",
    title: "ボタン",
    category: "要素",
    description: "アクションの実行やページ遷移のトリガー。重要度に応じて塗り / アウトライン / テキストを使い分ける。",
    dadsUrl: "https://design.digital.go.jp/dads/components/button/",
    source: "@/components/ui/Button",
    examples: [
        {
            title: "種類（重要度）",
            description: "塗り = プライマリー（1 画面に原則 1 つ）、アウトライン = セカンダリー、テキスト = ターシャリー（キャンセル用）。",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <Button>保存する</Button>
                    <Button variant="outline">下書きに戻す</Button>
                    <Button variant="text">キャンセル</Button>
                </div>
            ),
        },
        {
            title: "サイズ",
            description: "lg 136×56 / md 96×48 / sm 80×36 / xs 72×28。sm と xs は見えないタップ領域で 44px を確保する。",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <Button size="lg">Large</Button>
                    <Button size="md">Medium</Button>
                    <Button size="sm">Small</Button>
                    <Button size="xs">X-Small</Button>
                </div>
            ),
        },
        {
            title: "アイコン付き",
            description: "アイコンは装飾（aria-hidden）。ラベルを必ず付ける。",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <Button leadIcon={Plus}>新規作成</Button>
                    <Button variant="outline" tailIcon={Download}>
                        CSV をダウンロード
                    </Button>
                </div>
            ),
        },
        {
            title: "読み込み中・無効",
            description: "loading は aria-busy を付けて押下を無効にする（Tab では到達できる）。disabled は原則使わず、使う場合は理由を近くに書く。",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <Button loading>保存する</Button>
                    <Button variant="outline" loading>
                        送信中
                    </Button>
                    <div className="flex flex-col gap-1">
                        <Button disabled>削除する</Button>
                        <p className="text-16 text-text-muted">項目を選択すると削除できます</p>
                    </div>
                </div>
            ),
        },
        {
            title: "取り消せない操作（エラー色）",
            description: "削除など取り消せない操作はエラー色にする。確認ダイアログと組み合わせる。",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <Button tone="error" leadIcon={Trash2}>
                        削除する
                    </Button>
                    <Button tone="error" variant="outline">
                        削除する
                    </Button>
                    <Button tone="error" variant="text">
                        削除する
                    </Button>
                </div>
            ),
        },
        {
            title: "リンクとして使う",
            description: "ページ遷移は ButtonLink（react-router）、外部 URL は ButtonAnchor。",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <ButtonLink to="/items" variant="outline">
                        一覧へ移動
                    </ButtonLink>
                    <ButtonAnchor href="https://design.digital.go.jp/dads/" target="_blank" rel="noopener noreferrer" variant="text">
                        DADS を開く（新しいタブ）
                    </ButtonAnchor>
                </div>
            ),
        },
        {
            title: "幅いっぱい（モバイルの縦積み）",
            render: () => (
                <div className="flex max-w-sm flex-col gap-2">
                    <Button block>次へ</Button>
                    <Button block variant="outline">
                        戻る
                    </Button>
                </div>
            ),
        },
    ],
};

export default demo;
