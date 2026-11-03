import { CircleHelp, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Popover } from "@/components/ui/Popover";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "popover",
    title: "ポップオーバー",
    category: "フィードバック",
    description: "トリガーの近くに任意の内容を開く非モーダルなダイアログ（APG Dialog (non-modal)）。DADS にないため D-11 に従って設計。",
    source: "@/components/ui/Popover",
    examples: [
        {
            title: "フィルター",
            description: "開くと最初の操作要素へフォーカス。Esc・外側クリックで閉じ、Esc のときはトリガーへ戻る。背景は操作できる（フォーカストラップしない）。",
            render: () => (
                <Popover trigger={<Button variant="outline" leadIcon={Filter}>絞り込み</Button>} title="状態で絞り込む">
                    <div className="flex flex-col">
                        <Checkbox defaultChecked>下書き</Checkbox>
                        <Checkbox>申請中</Checkbox>
                        <Checkbox>承認済み</Checkbox>
                    </div>
                </Popover>
            ),
        },
        {
            title: "補足説明（右端揃え）",
            description: "placement=\"bottom-end\" でトリガーの右端に揃える。",
            render: () => (
                <div className="flex justify-end">
                    <Popover trigger={<Button variant="text" leadIcon={CircleHelp}>入力のヒント</Button>} title="申請番号とは" placement="bottom-end">
                        <p className="m-0">受付時に発行される 10 桁の番号です。受付完了メールに記載されています。</p>
                    </Popover>
                </div>
            ),
        },
    ],
};

export default demo;
