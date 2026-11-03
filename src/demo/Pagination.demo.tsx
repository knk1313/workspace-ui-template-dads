import { useState } from "react";
import { Pagination, type PaginationProps } from "@/components/ui/Pagination";
import type { ComponentDemo } from "./types";

function Controlled(props: Omit<PaginationProps, "page" | "onChange"> & { initialPage?: number }) {
    const { initialPage = 1, ...rest } = props;
    const [page, setPage] = useState(initialPage);
    return <Pagination page={page} onChange={setPage} {...rest} />;
}

const demo: ComponentDemo = {
    slug: "pagination",
    title: "ページナビゲーション",
    category: "ナビゲーション",
    description: "分割された一覧やテーブルを前後のページへ切り替える。先頭・末尾では前 / 次を aria-disabled にし、Tab では到達できるようにする。",
    dadsUrl: "https://design.digital.go.jp/dads/components/page-navigation/",
    source: "@/components/ui/Pagination",
    examples: [
        {
            title: "基本（ページ番号）",
            description: "現在ページは塗り + aria-current=\"page\"。ページ数が多いときは省略し、先頭と末尾は常に表示する。",
            render: () => <Controlled totalPages={20} initialPage={7} />,
        },
        {
            title: "サイズ",
            description: "矢印ボタンは lg 44 / md 32 / sm 24。md と sm は見えないタップ領域で 44px を確保する。",
            render: () => (
                <div className="flex flex-col gap-6">
                    <Controlled totalPages={5} initialPage={2} size="lg" />
                    <Controlled totalPages={5} initialPage={2} size="md" />
                    <Controlled totalPages={5} initialPage={2} size="sm" />
                </div>
            ),
        },
        {
            title: "カウンター（n / N ページ）",
            description: "カルーセルや記事の前後移動など、ページ番号へ直接飛ぶ必要がないときに使う。",
            render: () => <Controlled totalPages={12} initialPage={3} showCounter label="記事のページ送り" />,
        },
        {
            title: "両側の表示数（siblingCount）",
            render: () => (
                <div className="flex flex-col gap-6">
                    <Controlled totalPages={30} initialPage={15} siblingCount={0} />
                    <Controlled totalPages={30} initialPage={15} siblingCount={2} />
                </div>
            ),
        },
    ],
};

export default demo;
