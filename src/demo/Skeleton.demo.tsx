import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "skeleton",
    title: "スケルトン",
    category: "フィードバック",
    description: "読み込み中のプレースホルダー。実際の内容と同じ位置・大きさに置きレイアウトのずれを防ぐ。装飾なので aria-hidden。DADS にないため D-11 に従って設計。",
    source: "@/components/ui/Skeleton",
    examples: [
        {
            title: "テキスト・矩形・円",
            description: "幅と高さは className で指定する。親に aria-busy を付け、読み込み中であることは Spinner（role=\"status\"）の文字で伝える。",
            render: () => (
                <section aria-label="プロフィール" aria-busy="true" className="flex flex-col gap-4">
                    <Spinner label="プロフィールを読み込み中" className="sr-only" />
                    <div className="flex items-center gap-4">
                        <Skeleton variant="circle" className="size-12" />
                        <Skeleton className="flex-1" lines={2} />
                    </div>
                    <Skeleton variant="rect" className="h-40 w-full" />
                    <Skeleton lines={3} />
                </section>
            ),
        },
        {
            title: "表",
            description: "SkeletonTable は rows × columns のセルを描画する。",
            render: () => (
                <section aria-label="書類一覧" aria-busy="true">
                    <Spinner label="書類一覧を読み込み中" className="sr-only" />
                    <SkeletonTable rows={4} columns={4} />
                </section>
            ),
        },
    ],
};

export default demo;
