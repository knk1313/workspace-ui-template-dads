import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "./Button";
import { NotificationBanner } from "./NotificationBanner";

// データを読み込めなかったときの表示。エラーのバナーに「再読み込み」を付け、画面を再読み込みせずにやり直せるようにする。
// useQuery（src/api/query.ts）の error と reload を渡す。
//   {list.error && <LoadError error={list.error} onRetry={list.reload} />}
// 前に読み込んだデータがあるときは、データの上に置いて「表示中の内容が古い」ことを知らせる（stale）。

export type LoadErrorProps = {
    error: Error;
    onRetry: () => Promise<unknown>;
    /** 何を読み込めなかったか（見出しに入れる）。例: 「申請の一覧」 */
    subject?: string;
    /** 前に読み込んだ内容を表示し続けているとき true。 */
    stale?: boolean;
    className?: string;
};

export function LoadError({ error, onRetry, subject, stale = false, className }: LoadErrorProps) {
    const [retrying, setRetrying] = useState(false);
    const retry = async () => {
        setRetrying(true);
        try {
            await onRetry();
        } finally {
            setRetrying(false);
        }
    };
    return (
        <NotificationBanner
            type="error"
            title={subject ? `${subject}を読み込めませんでした` : "読み込めませんでした"}
            description={stale ? "前に読み込んだ内容を表示しています。時間をおいて「再読み込み」を押してください。" : error.message}
            live
            className={className}
            actions={
                <Button variant="outline" leadIcon={RotateCw} loading={retrying} onClick={retry}>
                    再読み込み
                </Button>
            }
        />
    );
}
