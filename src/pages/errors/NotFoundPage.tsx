import { ButtonLink } from "@/components/ui/Button";
import { ErrorPage } from "@/components/ui/ErrorPage";

// 404。ルート定義の * で、存在しない URL のときにシェルの中に表示する。
// 見つからない原因（URL の誤り・削除）と、次に取れる行動（ホーム / 申請一覧）を示す。
export default function NotFoundPage() {
    return (
        <ErrorPage
            status={404}
            title="ページが見つかりません"
            description="お探しのページは、URL が間違っているか、移動または削除された可能性があります。URL を確かめるか、下のリンクから目的の画面を開いてください。"
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
