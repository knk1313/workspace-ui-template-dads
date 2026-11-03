import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorPage } from "@/components/ui/ErrorPage";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "error-page",
    title: "エラー画面",
    category: "フィードバック",
    description: "404 / 500 などのエラー画面の本文。レイアウトの main の中に section として置き、見出し（h1）と次の行動を示す。",
    source: "@/components/ui/ErrorPage",
    examples: [
        {
            title: "404（既定のアクション）",
            description: "actions を省略すると「ホームへ戻る」リンクになる。デモでは h1 が 2 つになるが、実際のページでは 1 画面に 1 つ。",
            render: () => <ErrorPage status={404} title="ページが見つかりません" description="URL に誤りがないか確認してください。ページが移動または削除された可能性があります。" />,
        },
        {
            title: "500（アクションを指定）",
            render: () => (
                <ErrorPage
                    status={500}
                    title="サーバーでエラーが発生しました"
                    description="時間をおいて、もう一度お試しください。解決しない場合はお問い合わせください。"
                    actions={
                        <>
                            <ButtonLink to="/" variant="outline">
                                ホームへ戻る
                            </ButtonLink>
                            <Button onClick={() => window.location.reload()}>再読み込み</Button>
                        </>
                    }
                />
            ),
        },
    ],
};

export default demo;
