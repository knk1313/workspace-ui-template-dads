import { NotificationBanner } from "@/components/ui/NotificationBanner";
import { LINK_CLASS } from "@/components/ui/Link";
import { FIELD_LABELS, fieldId, focusField } from "./fields";
import type { FieldError } from "./validation";

// 送信時のエラーのまとめ（DADS: エラーサマリーはノティフィケーションバナーで示し、送信後にそこへフォーカスを移す。D-09）。
// 各エラーは該当項目へのページ内リンクにし、押すとその入力部品にフォーカスを移す。

const ERROR_SUMMARY_ID = "application-error-summary";
/** バナーの見出しの id（NotificationBanner は id から「{id}-title」を見出しに付け、見出しは tabIndex=-1 でフォーカスできる）。 */
export const ERROR_SUMMARY_HEADING_ID = `${ERROR_SUMMARY_ID}-title`;

export type ErrorSummaryProps = {
    errors: FieldError[];
};

export function ErrorSummary({ errors }: ErrorSummaryProps) {
    return (
        <NotificationBanner
            type="error"
            id={ERROR_SUMMARY_ID}
            title={`入力内容に${errors.length}件の誤りがあります`}
            description={
                <>
                    <p className="m-0">次の項目を直してから、もう一度「確認へ進む」を押してください</p>
                    <ul className="m-0 mt-2 flex list-disc flex-col gap-1 pl-6">
                        {errors.map((e) => (
                            <li key={e.field}>
                                <a
                                    href={`#${fieldId(e.field)}`}
                                    className={LINK_CLASS}
                                    onClick={(ev) => {
                                        // ルーターの URL を変えずに、該当項目へフォーカスだけを移す
                                        ev.preventDefault();
                                        focusField(e.field);
                                    }}
                                >
                                    {FIELD_LABELS[e.field]}：{e.message}
                                </a>
                            </li>
                        ))}
                    </ul>
                </>
            }
        />
    );
}
