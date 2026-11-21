import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorPage } from "@/components/ui/ErrorPage";
import { appConfig } from "@/app.config";
import { usePageTitle } from "@/hooks/usePageTitle";

// 500 エラー画面（/error/500 はプレビュー用）。実際のアプリでは、API の失敗やエラーバウンダリからこの画面を出す。
// 利用者のせいではないことと、時間をおいて再度試す・問い合わせる、という次の行動を示す。
export default function ServerErrorPage() {
    usePageTitle("ページを表示できません");
    return (
        <ErrorPage
            status={500}
            title="ページを表示できません"
            description={
                <>
                    システムの一時的な問題で、ページを表示できませんでした。時間をおいて、もう一度お試しください。
                    <br />
                    解決しない場合は、{appConfig.support.name}（電話<span className="nums">{appConfig.support.phone}</span>、{appConfig.support.hours}）に問い合わせてください。
                </>
            }
            actions={
                <>
                    <Button onClick={() => window.location.reload()}>再読み込み</Button>
                    <ButtonLink to="/" variant="outline">
                        ホームへ戻る
                    </ButtonLink>
                </>
            }
        />
    );
}
