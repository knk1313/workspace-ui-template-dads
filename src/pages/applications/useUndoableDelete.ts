import { useCallback } from "react";
import { deleteApplications, invalidateApplications, restoreApplications } from "@/api/applications";
import type { Application } from "@/api/applicationTypes";
import { useMutation } from "@/api/query";
import { useToast } from "@/components/ui/Toast";

// 申請を削除し、トーストの「元に戻す」で取り消せるようにする（一覧と詳細の画面で同じ流れにする）。
// DADS に沿って確認ダイアログは出さない。取り消せる手段を、削除の直後に必ず示す。

export type UndoableDeleteOptions = {
    /** 削除を送る前に呼ぶ（一覧から行を消す楽観的な更新など）。 */
    beforeDelete?: () => void;
    /** 削除できたあとに呼ぶ（詳細画面から一覧へ移るなど）。 */
    afterDelete?: () => void;
};

export function useUndoableDelete() {
    const { toast } = useToast();
    const mutation = useMutation(deleteApplications);
    const { run } = mutation;

    const undo = useCallback(
        async (deleted: Application[], label: string) => {
            try {
                await restoreApplications(deleted);
                toast({ type: "success", title: `${label}を元に戻しました` });
            } catch {
                toast({ type: "error", title: `${label}を元に戻せませんでした`, description: "時間をおいて、もう一度「元に戻す」を押してください。" });
            } finally {
                invalidateApplications();
            }
        },
        [toast],
    );

    /**
     * 削除する。label は「R08-001060」か「3件の申請」（トーストの「〜を削除しました」に使う）。
     * 削除できたら true を返す。
     */
    const remove = useCallback(
        async (ids: string[], label: string, { beforeDelete, afterDelete }: UndoableDeleteOptions = {}) => {
            beforeDelete?.();
            try {
                const deleted = await run(ids);
                afterDelete?.();
                // 消えた行やボタンにあったフォーカスの移し先として、「元に戻す」へフォーカスを移す（キーボードでもすぐ取り消せる）
                toast({ type: "success", title: `${label}を削除しました`, action: { label: "元に戻す", focus: true, onClick: () => void undo(deleted, label) } });
                return true;
            } catch {
                toast({ type: "error", title: `${label}を削除できませんでした`, description: "時間をおいて、もう一度削除してください。" });
                return false;
            } finally {
                invalidateApplications();
            }
        },
        [run, toast, undo],
    );

    return { remove, pending: mutation.pending };
}
