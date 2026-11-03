import { Container } from "@/components/ui/Container";
import type { ComponentDemo } from "./types";

function Box({ label }: { label: string }) {
    return <div className="rounded-8 bg-primary-surface px-4 py-3 text-16 text-text-strong">{label}</div>;
}

const demo: ComponentDemo = {
    slug: "container",
    title: "コンテナ",
    category: "レイアウト",
    description: "コンテンツ幅の上限と左右の余白（モバイル 16px / md 以上 24px）。読み物・フォームは md、一覧・ダッシュボードは lg。",
    source: "@/components/ui/Container",
    examples: [
        {
            title: "サイズ",
            description: "md 52rem（DADS 作例のコンテンツ幅）/ lg 80rem / full（上限なし）。枠の中で中央に寄る。",
            render: () => (
                <div className="flex flex-col gap-4 bg-surface-muted py-4">
                    <Container size="md">
                        <Box label="md（52rem）" />
                    </Container>
                    <Container size="lg">
                        <Box label="lg（80rem）" />
                    </Container>
                    <Container size="full">
                        <Box label="full" />
                    </Container>
                </div>
            ),
        },
        {
            title: "余白なし（flush）",
            description: "親がすでに左右の余白を持つときに使う。",
            render: () => (
                <Container size="md" flush>
                    <Box label="flush" />
                </Container>
            ),
        },
    ],
};

export default demo;
