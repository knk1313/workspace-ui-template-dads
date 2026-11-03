import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Drawer, type DrawerPlacement, type DrawerSize } from "@/components/ui/Drawer";
import type { ComponentDemo } from "./types";

function DrawerExample({ placement, size, label }: { placement: DrawerPlacement; size?: DrawerSize; label: string }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>
                {label}
            </Button>
            <Drawer
                open={open}
                onClose={() => setOpen(false)}
                placement={placement}
                size={size}
                title="絞り込み"
                footer={
                    <Button block onClick={() => setOpen(false)}>
                        適用する
                    </Button>
                }
            >
                <fieldset className="m-0 border-0 p-0">
                    <legend className="mb-2 font-bold">状態</legend>
                    <div className="flex flex-col">
                        <Checkbox defaultChecked>下書き</Checkbox>
                        <Checkbox>申請中</Checkbox>
                        <Checkbox>承認済み</Checkbox>
                        <Checkbox>差し戻し</Checkbox>
                    </div>
                </fieldset>
            </Drawer>
        </>
    );
}

const demo: ComponentDemo = {
    slug: "drawer",
    title: "ドロワー",
    category: "フィードバック",
    description: "画面の左右端から展開するモーダルなコンテナ。モバイルメニューや絞り込みパネルを格納する。",
    dadsUrl: "https://design.digital.go.jp/dads/components/drawer/",
    source: "@/components/ui/Drawer",
    examples: [
        {
            title: "右・左",
            description: "幅 288px、全高。閉じるボタンは開いた側の端に置く。Esc・閉じるボタン・暗幕のクリックで閉じ、開いたボタンへフォーカスが戻る。",
            render: () => (
                <div className="flex flex-wrap gap-4">
                    <DrawerExample placement="right" label="右から開く" />
                    <DrawerExample placement="left" label="左から開く" />
                </div>
            ),
        },
        {
            title: "広い幅（lg）",
            description: "md 以上で幅 512px。モバイルでは 288px のまま。",
            render: () => <DrawerExample placement="right" size="lg" label="広いドロワーを開く" />,
        },
    ],
};

export default demo;
