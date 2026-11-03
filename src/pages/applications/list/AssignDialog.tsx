import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Select } from "@/components/ui/Select";
import { ASSIGNEES } from "@/mocks/applications";

// 選択した申請の担当者をまとめて変更するダイアログ。
// 開くたびに選択を初期化したいので、呼び出し側は open のときだけ描画する（key で作り直してもよい）。

const OPTIONS = ASSIGNEES.map((name) => ({ value: name, label: name }));

type Props = {
    count: number;
    onClose: () => void;
    onSubmit: (assignee: string) => void;
    /** 変更を送信中。ボタンに処理中を出し、二重に送らないようにする。 */
    pending?: boolean;
};

export function AssignDialog({ count, onClose, onSubmit, pending = false }: Props) {
    const [assignee, setAssignee] = useState<string>(ASSIGNEES[0]);
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
                    <Button loading={pending} onClick={() => !pending && onSubmit(assignee)}>
                        変更する
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                <p className="m-0">選択した{count}件について、担当者を変更します</p>
                <FormField label="新しい担当者">
                    <Select block options={OPTIONS} value={assignee} onChange={(e) => setAssignee(e.target.value)} />
                </FormField>
            </div>
        </ModalDialog>
    );
}
