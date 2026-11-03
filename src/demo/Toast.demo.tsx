import { Button } from "@/components/ui/Button";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import type { ComponentDemo } from "./types";

function ToastButtons() {
    const { toast } = useToast();
    return (
        <div className="flex flex-wrap gap-4">
            <Button onClick={() => toast({ type: "success", title: "保存しました" })}>成功</Button>
            <Button variant="outline" tone="error" onClick={() => toast({ type: "error", title: "保存できませんでした", description: "通信状態を確認して、もう一度お試しください。" })}>
                失敗
            </Button>
            <Button variant="outline" onClick={() => toast({ type: "info", title: "3 件の書類を書き出しています" })}>
                情報
            </Button>
            <Button variant="text" onClick={() => toast({ type: "info", title: "自動で消えない通知", duration: 0 })}>
                自動で消えない
            </Button>
        </div>
    );
}

const demo: ComponentDemo = {
    slug: "toast",
    title: "トースト",
    category: "フィードバック",
    description: "操作完了などの軽い通知を画面右上（モバイルは下部）に一時的に表示する。DADS にないためノティフィケーションバナーの縮小版として設計（D-10）。",
    source: "@/components/ui/Toast",
    examples: [
        {
            title: "種類",
            description: "role=\"status\" のリージョンで読み上げる。8 秒で自動消去し、ホバー・フォーカス中は止まる。Esc か閉じるボタンで消せる。同時表示は 3 件まで。アプリでは ToastProvider をルートに 1 つ置く。",
            render: () => (
                <ToastProvider>
                    <ToastButtons />
                </ToastProvider>
            ),
        },
    ],
};

export default demo;
