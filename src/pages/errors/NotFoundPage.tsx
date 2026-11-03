import { ButtonLink } from "@/components/ui/Button";
import { ErrorPage } from "@/components/ui/ErrorPage";

// 404。ルート定義の * で、存在しない URL のときにシェルの中に表示する。
// 見つからない原因（URL の誤り・削除）と、次に取れる行動（ホーム / 申請一覧）を示す。
export default function NotFoundPage() {
    return (
        <ErrorPage
            status={404}
            title="ページが見つかりません"
            description="開こうとしたページは、URLが間違っているか、移動または削除されています。URLを確かめるか、「ホームへ戻る」か「申請一覧へ」から開き直してください。"
            actions={
                <>
                    <ButtonLink to="/">ホームへ戻る</ButtonLink>
                    <ButtonLink to="/applications" variant="outline">
                        申請一覧へ
                    </ButtonLink>
                </>
            }
        />
    );
}
