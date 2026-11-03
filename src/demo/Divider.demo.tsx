import { Divider } from "@/components/ui/Divider";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "divider",
    title: "ディバイダー",
    category: "レイアウト",
    description: "セクションやグループの間の視覚的な区切り。余白の補助として使い、リストでは 8px 以上、セクションでは 16px 以上の余白を取る。",
    dadsUrl: "https://design.digital.go.jp/dads/components/divider/",
    source: "@/components/ui/Divider",
    examples: [
        {
            title: "色",
            description: "default（solid-gray-420）/ strong（solid-gray-536）/ emphasis（black）。",
            render: () => (
                <div className="flex flex-col gap-4">
                    <Divider />
                    <Divider color="strong" />
                    <Divider color="emphasis" />
                </div>
            ),
        },
        {
            title: "太さと線種",
            render: () => (
                <div className="flex flex-col gap-4">
                    <Divider weight={1} />
                    <Divider weight={2} />
                    <Divider weight={3} />
                    <Divider weight={4} />
                    <Divider style="dashed" weight={2} color="strong" />
                </div>
            ),
        },
        {
            title: "縦",
            description: "横に並ぶ要素の区切り。role=\"separator\" + aria-orientation=\"vertical\"。",
            render: () => (
                <div className="flex items-center gap-4">
                    <span>受付 12 件</span>
                    <Divider orientation="vertical" />
                    <span>審査中 5 件</span>
                    <Divider orientation="vertical" />
                    <span>差し戻し 1 件</span>
                </div>
            ),
        },
    ],
};

export default demo;
