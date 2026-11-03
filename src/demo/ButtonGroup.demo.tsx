import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "button-group",
    title: "ボタングループ",
    category: "要素",
    description: "DADS のボタン配置ルール。進行方向は右（確定は右端、キャンセルは左端）、間隔は 16px。モバイルでは確定を上にして縦に積む。",
    dadsUrl: "https://design.digital.go.jp/dads/components/button/",
    source: "@/components/ui/ButtonGroup",
    examples: [
        {
            title: "右寄せ（フォームの送信）",
            description: "DOM の順序は「キャンセル → 確定」。md 未満では縦積みになり、確定が上に来る。",
            render: () => (
                <ButtonGroup>
                    <Button variant="text">キャンセル</Button>
                    <Button variant="outline">下書き保存</Button>
                    <Button>送信する</Button>
                </ButtonGroup>
            ),
        },
        {
            title: "左寄せ・中央寄せ",
            render: () => (
                <div className="flex flex-col gap-6">
                    <ButtonGroup align="start">
                        <Button>検索</Button>
                        <Button variant="outline">条件をクリア</Button>
                    </ButtonGroup>
                    <ButtonGroup align="center">
                        <Button>閉じる</Button>
                    </ButtonGroup>
                </div>
            ),
        },
        {
            title: "縦並び",
            description: "direction=column では常に縦に積み、間隔は 8px。",
            render: () => (
                <ButtonGroup direction="column" align="start">
                    <Button block>次へ進む</Button>
                    <Button block variant="outline">
                        前に戻る
                    </Button>
                </ButtonGroup>
            ),
        },
        {
            title: "モバイルでも横並び",
            render: () => (
                <ButtonGroup stackOnMobile={false}>
                    <Button size="sm" variant="outline">
                        戻る
                    </Button>
                    <Button size="sm">次へ</Button>
                </ButtonGroup>
            ),
        },
    ],
};

export default demo;
