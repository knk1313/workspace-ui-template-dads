import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "card",
    title: "カード",
    category: "レイアウト",
    description: "単一の主題に関する内容をまとめる面。必ず枠線（地に対して 3:1）と背景色を持ち、管理画面では影を使わない。",
    dadsUrl: "https://design.digital.go.jp/dads/components/card/",
    source: "@/components/ui/Card",
    examples: [
        {
            title: "見出し・本文・フッター",
            description: "as=\"section\" にすると見出しで名前の付いた領域になる。操作は右上（モバイルでは下）に置く。",
            render: () => (
                <Card as="section" className="max-w-160">
                    <CardHeader title="最近の申請" description="直近 7 日間に受け付けた申請" actions={<IconButton icon={MoreVertical} label="最近の申請の操作" size="sm" />} />
                    <CardBody>
                        <p className="m-0">受付 12 件、審査中 5 件、差し戻し 1 件です。</p>
                    </CardBody>
                    <CardFooter>
                        <ButtonGroup align="end">
                            <Button variant="outline" size="sm">
                                すべて見る
                            </Button>
                        </ButtonGroup>
                    </CardFooter>
                </Card>
            ),
        },
        {
            title: "カード全体をリンクにする",
            description: "タイトルだけをリンクにし、擬似要素でカード全体に広げる。カード内に他のリンクやボタンは置かない。",
            render: () => (
                <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
                    <li className="flex">
                        <Card interactive as="article" className="w-full">
                            <CardHeader as="h3" title="住民票の写しの交付申請" href="/components/card" label="申請番号 2026-0123" />
                            <CardBody>
                                <p className="m-0 text-text-muted">2026 年 11 月 1 日 受付</p>
                            </CardBody>
                        </Card>
                    </li>
                    <li className="flex">
                        <Card interactive as="article" className="w-full">
                            <CardHeader as="h3" title="印鑑登録証明書の交付申請" href="/components/card" label="申請番号 2026-0124" />
                            <CardBody>
                                <p className="m-0 text-text-muted">2026 年 11 月 2 日 受付</p>
                            </CardBody>
                        </Card>
                    </li>
                </ul>
            ),
        },
        {
            title: "余白",
            description: "padding: md（24px）/ sm（16px）/ none（表などを端まで置く）。",
            render: () => (
                <div className="flex flex-col gap-4 md:flex-row">
                    <Card padding="sm" className="flex-1">
                        <CardHeader as="h3" title="余白 sm" />
                        <CardBody>本文</CardBody>
                    </Card>
                    <Card padding="none" className="flex-1">
                        <CardBody>
                            <p className="m-0 p-4">padding=none では中身が余白を持つ</p>
                        </CardBody>
                    </Card>
                </div>
            ),
        },
    ],
};

export default demo;
