import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { LoadError } from "@/components/ui/LoadError";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Select } from "@/components/ui/Select";
import { useStaffOptions } from "../useStaffOptions";

// 選択した申請の担当者をまとめて変更するダイアログ。
// 開くたびに選択を初期化したいので、呼び出し側は open のときだけ描画する（key で作り直してもよい）。

type Props = {
    count: number;
    onClose: () => void;
    onSubmit: (assignee: string) => void;
    /** 変更を送信中。ボタンに処理中を出し、二重に送らないようにする。 */
    pending?: boolean;
};

export function AssignDialog({ count, onClose, onSubmit, pending = false }: Props) {
    const { options, isLoading, error, reload } = useStaffOptions();
    // 選択肢を読み込んだら、先頭の職員を選んでおく
    const [assignee, setAssignee] = useState("");
    if (assignee === "" && options.length > 0) setAssignee(options[0].value);
    return (
        <ModalDialog
            open
            onClose={onClose}
            title="担当者を変更"
            actions={
                <>
                    <Button variant="outline" onClick={onClose}>
                        キャンセル
                    </Button>
                    {/* 職員の一覧を読み込めなかったときは、選べる担当者がいないため出さない */}
                    {!error && (
                        <Button loading={pending || isLoading} onClick={() => !pending && assignee && onSubmit(assignee)}>
                            変更する
                        </Button>
                    )}
                </>
            }
        >
            <div className="flex flex-col gap-6">
                <p className="m-0">選択した{count}件について、担当者を変更します</p>
                {error ? (
                    <LoadError subject="担当者の一覧" error={error} onRetry={reload} />
                ) : (
                    <FormField label="新しい担当者">
                        <Select
                            block
                            options={isLoading ? [{ value: "", label: "読み込んでいます" }] : options}
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                        />
                    </FormField>
                )}
            </div>
        </ModalDialog>
    );
}
