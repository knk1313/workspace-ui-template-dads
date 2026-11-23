import { useState } from "react";
import { getMockOptions, setMockOptions, type MockOptions } from "@/api/mock";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";

// 見本用: ダミー API の通信を失敗させたり遅くしたりして、エラー表示・再試行・読み込み中・保存中の表示を確かめる。
// 自分のアプリにするときは、src/api/mock.ts と一緒にこのファイルを消し、SettingsPage.tsx の <MockApiOptions /> を消す。
export function MockApiOptions() {
    const [options, setOptions] = useState<MockOptions>(getMockOptions);
    const update = (next: MockOptions) => {
        setMockOptions(next);
        setOptions(next);
    };
    return (
        <Card as="section">
            <CardHeader
                title="動作の確認（見本用）"
                description="通信の失敗や遅延を起こして、エラーの表示や読み込み中の表示を確かめられます。ブラウザーのタブを閉じると元に戻ります。"
            />
            <CardBody>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    <li>
                        <Switch
                            className="flex w-full max-w-sm justify-between"
                            label="通信を失敗させる"
                            checked={options.fail}
                            onChange={(fail) => update({ ...options, fail })}
                        />
                    </li>
                    <li>
                        <Switch
                            className="flex w-full max-w-sm justify-between"
                            label="通信を遅くする（3秒）"
                            checked={options.slow}
                            onChange={(slow) => update({ ...options, slow })}
                        />
                    </li>
                </ul>
            </CardBody>
        </Card>
    );
}
