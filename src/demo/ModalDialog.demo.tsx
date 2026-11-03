import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ModalDialog } from "@/components/ui/ModalDialog";
import type { ComponentDemo } from "./types";

function MessageExample() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>
                利用規約の改定内容を見る
            </Button>
            <ModalDialog open={open} onClose={() => setOpen(false)} title="利用規約の改定について">
                <p className="m-0">2026 年 4 月 1 日に利用規約を改定しました。主な変更点は個人情報の取り扱いに関する条項です。</p>
            </ModalDialog>
        </>
    );
}

function ConfirmExample() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button tone="error" onClick={() => setOpen(true)}>
                書類を削除する
            </Button>
            <ModalDialog
                open={open}
                onClose={() => setOpen(false)}
                title="書類を削除しますか"
                actions={
                    <>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            キャンセル
                        </Button>
                        <Button tone="error" onClick={() => setOpen(false)}>
                            削除する
                        </Button>
                    </>
                }
            >
                <p className="m-0">「2026 年度 事業計画書」を削除します。削除した書類は 30 日間ごみ箱から復元できます。</p>
            </ModalDialog>
        </>
    );
}

function SingleActionExample() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>
                セッションの有効期限（広い幅）
            </Button>
            <ModalDialog open={open} onClose={() => setOpen(false)} title="まもなくログアウトします" size="lg" actions={<Button onClick={() => setOpen(false)}>ログインを続ける</Button>}>
                <p className="m-0">操作がないまま 25 分が経過しました。5 分後に自動でログアウトします。</p>
            </ModalDialog>
        </>
    );
}

const demo: ComponentDemo = {
    slug: "modal-dialog",
    title: "モーダルダイアログ",
    category: "フィードバック",
    description: "破壊的な操作の確認や短いメッセージに使う。表示中はダイアログ内しか操作できない。フォームや告知、ナビゲーションには使わない。",
    dadsUrl: "https://design.digital.go.jp/dads/components/modal-dialog/",
    source: "@/components/ui/ModalDialog",
    examples: [
        {
            title: "メッセージ（閉じるボタン）",
            description: "アクションがないときだけ右上に「閉じる」を置く。見出しに初期フォーカス、Esc で閉じ、閉じると開いたボタンへ戻る。",
            render: () => <MessageExample />,
        },
        {
            title: "確認（アクション 2 つ）",
            description: "左がキャンセル、右が確定。アクションがあるときは閉じるボタンを出さない。モバイルでは縦に積む。",
            render: () => <ConfirmExample />,
        },
        {
            title: "アクション 1 つ・広い幅",
            description: "アクションが 1 つなら中央に置く。size=\"lg\" で md 以上の幅を広げる。",
            render: () => <SingleActionExample />,
        },
    ],
};

export default demo;
