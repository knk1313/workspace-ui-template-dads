import { useState } from "react";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { FormLayout, FormSection } from "@/components/ui/FormLayout";
import { Input } from "@/components/ui/Input";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import type { ComponentDemo } from "./types";

function ApplicationForm() {
    return (
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-10">
            <FormLayout>
                <FormSection title="申請者" description="申請する方の情報を入力してください。">
                    <FormLayout columns={2}>
                        <FormField label="姓" requirement="required">
                            <Input autoComplete="family-name" />
                        </FormField>
                        <FormField label="名" requirement="required">
                            <Input autoComplete="given-name" />
                        </FormField>
                        <FormField label="メールアドレス" requirement="required" supportText="半角英数字" className="md:col-span-2">
                            <Input type="email" autoComplete="email" />
                        </FormField>
                        <FormField label="都道府県" requirement="required">
                            <Select
                                block
                                placeholder="選択してください"
                                options={[
                                    { value: "13", label: "東京都" },
                                    { value: "14", label: "神奈川県" },
                                ]}
                            />
                        </FormField>
                    </FormLayout>
                </FormSection>
                <FormSection title="申請内容">
                    <FormField label="区分" as="fieldset" requirement="required">
                        <RadioGroup
                            name="kind"
                            options={[
                                { value: "new", label: "新規" },
                                { value: "renew", label: "更新" },
                            ]}
                        />
                    </FormField>
                    <FormField label="備考" requirement="optional">
                        <Textarea rows={3} />
                    </FormField>
                    <Checkbox>入力内容に誤りがないことを確認しました</Checkbox>
                </FormSection>
            </FormLayout>
            <ActionPanel primary={<Button type="submit">申請する</Button>} secondary={<Button variant="outline">下書き保存</Button>} cancel={<Button variant="text">キャンセル</Button>} />
        </form>
    );
}

function SettingsForm() {
    const [publicProfile, setPublicProfile] = useState(false);
    return (
        <FormLayout gap="lg">
            <FormSection title="プロフィール" description="他のメンバーに表示される情報です。" layout="settings">
                <FormField label="表示名" requirement="required">
                    <Input />
                </FormField>
                <FormField label="所属" requirement="optional">
                    <Input />
                </FormField>
            </FormSection>
            <hr className="m-0 border-0 border-t border-border" />
            <FormSection title="公開設定" description="切り替えるとすぐに反映されます。" layout="settings">
                <Switch label="プロフィールを公開する" checked={publicProfile} onChange={setPublicProfile} />
            </FormSection>
        </FormLayout>
    );
}

const demo: ComponentDemo = {
    slug: "form-layout",
    title: "フォームレイアウト",
    category: "フォーム",
    description: "項目を縦に積むフォームの骨組み。FormSection で見出し・説明付きのまとまりを作り、設定画面では見出しを左に置ける。",
    source: "@/components/ui/FormLayout, @/components/ui/ActionPanel",
    examples: [
        {
            title: "申請フォーム（縦積み + 2 列）",
            description: "FormLayout columns={2} は短い項目を並べるときだけ使う。幅いっぱいにする項目は md:col-span-2。",
            render: () => <ApplicationForm />,
        },
        {
            title: "設定画面（layout=\"settings\"）",
            description: "md 以上は左 1/3 に見出しと説明、右 2/3 に項目。モバイルは縦に積む。",
            render: () => <SettingsForm />,
        },
    ],
};

export default demo;
