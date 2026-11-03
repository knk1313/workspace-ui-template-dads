import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Textarea } from "@/components/ui/Textarea";

// 差戻しの理由を入力するダイアログ。理由は申請者に伝わる文なので必須にする。
// 送信ボタンは無効化せず（DADS）、未入力で押されたらエラーテキストを出して入力欄へフォーカスを戻す。
// 開くたびに入力を空にしたいので、呼び出し側は開いている間だけ描画する。

const MAX_LENGTH = 400;

type Props = {
    number: string;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    /** 送信中。ボタンに処理中を出し、二重に送らないようにする。 */
    pending?: boolean;
};

export function ReturnDialog({ number, onClose, onSubmit, pending = false }: Props) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    function submit() {
        if (pending) return;
        const text = reason.trim();
        if (!text) {
            setError("差戻しの理由を入力してください");
            textareaRef.current?.focus();
            return;
        }
        if (Array.from(text).length > MAX_LENGTH) {
            setError(`差戻しの理由は${MAX_LENGTH}文字以内で入力してください`);
            textareaRef.current?.focus();
            return;
        }
        onSubmit(text);
    }

    return (
        <ModalDialog
            open
            onClose={onClose}
            title="申請を差し戻す"
            actions={
                <>
                    <Button variant="outline" onClick={onClose}>
                        キャンセル
                    </Button>
                    <Button loading={pending} onClick={submit}>
                        差し戻す
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                <p className="m-0">{number}を申請者に差し戻します。理由は申請者への通知に載ります。</p>
                <FormField label="差戻しの理由" requirement="required" supportText="直してほしい箇所と、その理由を具体的に書いてください" errorText={error ?? undefined}>
                    <Textarea
                        ref={textareaRef}
                        rows={5}
                        counterMax={MAX_LENGTH}
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            if (error && e.target.value.trim()) setError(null);
                        }}
                    />
                </FormField>
            </div>
        </ModalDialog>
    );
}
