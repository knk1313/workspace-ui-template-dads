import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmProvider, useConfirm } from "@/components/ui/ConfirmDialog";
import type { ComponentDemo } from "./types";

function ConfirmButtons() {
    const { confirm } = useConfirm();
    const [result, setResult] = useState("まだ操作していません");

    async function onDelete() {
        const ok = await confirm({
            title: "3 件の書類を削除しますか",
            message: "削除した書類は 30 日間ごみ箱から復元できます。",
            confirmLabel: "削除する",
            tone: "error",
        });
        setResult(ok ? "削除しました" : "削除を取り消しました");
    }

    async function onSubmit() {
        const ok = await confirm({ title: "申請を提出しますか", message: "提出後は内容を変更できません。", confirmLabel: "提出する", cancelLabel: "戻る" });
        setResult(ok ? "提出しました" : "提出を取り消しました");
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
                <Button tone="error" onClick={onDelete}>
                    削除する
                </Button>
                <Button onClick={onSubmit}>提出する</Button>
            </div>
            <p className="m-0 text-text-muted">結果: {result}</p>
        </div>
    );
}

const demo: ComponentDemo = {
    slug: "confirm-dialog",
    title: "確認ダイアログ",
    category: "フィードバック",
    description: "window.confirm の置き換え。await confirm({...}) が真偽値を返す。ModalDialog を使い、連続した呼び出しは順に表示する。",
    dadsUrl: "https://design.digital.go.jp/dads/components/modal-dialog/",
    source: "@/components/ui/ConfirmDialog",
    examples: [
        {
            title: "基本",
            description: "取り消せない操作は tone=\"error\"。確認ダイアログだけを安全対策にせず、取り消しや復元ができる設計を検討する。アプリでは ConfirmProvider をルートに 1 つ置く。",
            render: () => (
                <ConfirmProvider>
                    <ConfirmButtons />
                </ConfirmProvider>
            ),
        },
    ],
};

export default demo;
