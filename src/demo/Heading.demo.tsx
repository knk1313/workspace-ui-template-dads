import { FileText } from "lucide-react";
import { Heading } from "@/components/ui/Heading";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "heading",
    title: "見出し",
    category: "要素",
    description: "ページやセクションの主題。見出しレベル（h1〜h6）と文字サイズは別々に指定する。レベルを飛ばさない。",
    dadsUrl: "https://design.digital.go.jp/dads/components/heading/",
    source: "@/components/ui/Heading",
    examples: [
        {
            title: "サイズ",
            description: "デモページの構造に合わせ、ここではすべて h3 にしている。",
            render: () => (
                <div className="flex flex-col gap-4">
                    {([36, 32, 28, 24, 20, 18, 16] as const).map((size) => (
                        <Heading key={size} level={3} size={size}>
                            見出し {size}
                        </Heading>
                    ))}
                </div>
            ),
        },
        {
            title: "肩見出しとサブタイトル",
            description: "肩見出し・サブタイトルは p 要素にし、hgroup で見出しとまとめる。",
            render: () => (
                <Heading level={3} size={28} shoulder="第 2 章" subtitle="申請から交付までの流れ">
                    手続きの概要
                </Heading>
            ),
        },
        {
            title: "チップ・飾り罫・アイコン",
            render: () => (
                <div className="flex flex-col gap-8">
                    <Heading level={3} chip>
                        チップ付き
                    </Heading>
                    <Heading level={3} rule={2}>
                        飾り罫 2px
                    </Heading>
                    <Heading level={3} size={24} rule={4}>
                        飾り罫 4px
                    </Heading>
                    <Heading level={3} icon={FileText}>
                        リードアイコン付き
                    </Heading>
                </div>
            ),
        },
    ],
};

export default demo;
