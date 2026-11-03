import { ButtonLink, Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { NotificationBanner } from "@/components/ui/NotificationBanner";

// 完了画面。受付番号を示し、次の行動（一覧へ戻る / 続けて申請する）を置く。

export const COMPLETE_HEADING_ID = "application-complete-heading";

export type ApplicationFormCompleteProps = {
    receiptNumber: string;
    email: string;
    onRestart: () => void;
};

export function ApplicationFormComplete({ receiptNumber, email, onRestart }: ApplicationFormCompleteProps) {
    return (
        <div className="flex flex-col gap-8">
            <NotificationBanner
                type="success"
                title={
                    // ステップが変わったらこの見出しへフォーカスを移す（NotificationBanner は見出しに id を渡せないため中身に付ける）
                    <span id={COMPLETE_HEADING_ID} tabIndex={-1} className="focus-visible:focus-ring">
                        申請の受付完了
                    </span>
                }
                description={
                    <>
                        <p className="m-0">
                            受付番号は<strong className="nums">{receiptNumber}</strong>です。問い合わせるときに伝えてください。
                        </p>
                        <p className="m-0">審査の結果は{email}にお知らせします。見本のため、実際には送りません。</p>
                    </>
                }
            />
            <ButtonGroup>
                <ButtonLink to="/applications" variant="outline">
                    申請一覧へ
                </ButtonLink>
                <Button onClick={onRestart}>続けて申請する</Button>
            </ButtonGroup>
        </div>
    );
}
