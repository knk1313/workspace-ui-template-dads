import { useId } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Combobox } from "@/components/ui/Combobox";
import { DatePicker } from "@/components/ui/DatePicker";
import { FileUpload } from "@/components/ui/FileUpload";
import { FormField } from "@/components/ui/FormField";
import { FormLayout, FormSection } from "@/components/ui/FormLayout";
import { Input } from "@/components/ui/Input";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { ASSIGNEES } from "@/mocks/applications";
import { CATEGORY_LABELS, type ApplicationCategory } from "@/api/applicationTypes";
import { fieldId } from "./fields";
import {
    ACCEPTED_FILE_TYPES,
    MEMO_MAX,
    TITLE_MAX,
    requiresAmount,
    requiresAttachment,
    type ApplicationFormValues,
    type FieldError,
    type FieldName,
} from "./validation";

// 入力画面の項目。値とエラーは親（ApplicationFormPage）が持ち、ここは表示と変更の通知だけを行う。
// 見出しは h2（ステップ見出し）の下なので FormSection は h3 にする。

export type ApplicationFormFieldsProps = {
    values: ApplicationFormValues;
    errors: FieldError[];
    onChange: <K extends FieldName>(field: K, value: ApplicationFormValues[K]) => void;
    /** 希望日に選べる最小の日付（今日）。 */
    minDate: string;
};

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as ApplicationCategory[]).map((value) => ({ value, label: CATEGORY_LABELS[value] }));
const ASSIGNEE_OPTIONS = ASSIGNEES.map((name) => ({ value: name, label: name }));

export function ApplicationFormFields({ values, errors, onChange, minDate }: ApplicationFormFieldsProps) {
    const priorityHelpId = useId();
    const errorOf = (field: FieldName) => errors.find((e) => e.field === field)?.message;
    const amountRequired = requiresAmount(values.category);
    const attachmentRequired = requiresAttachment(values.category);

    return (
        <div className="flex flex-col gap-12">
            <FormSection title="基本情報" headingLevel={3}>
                <FormField
                    id={fieldId("title")}
                    label="件名"
                    requirement="required"
                    supportText={`申請の内容が分かる名前を${TITLE_MAX}文字以内で入力してください`}
                    errorText={errorOf("title")}
                >
                    <Input name="title" value={values.title} onChange={(e) => onChange("title", e.target.value)} />
                </FormField>
                <FormField id={fieldId("category")} label="種別" as="fieldset" requirement="required" errorText={errorOf("category")}>
                    <RadioGroup
                        name={fieldId("category")}
                        options={CATEGORY_OPTIONS}
                        value={values.category}
                        onChange={(v) => onChange("category", v as ApplicationCategory)}
                    />
                </FormField>
                <FormField
                    id={fieldId("amount")}
                    label="申請額（円）"
                    requirement={amountRequired ? "required" : "optional"}
                    supportText="補助金と許認可の申請では必須です。円単位の数字で入力してください（全角数字やカンマ区切りでも入力できます）。"
                    errorText={errorOf("amount")}
                >
                    <Input
                        name="amount"
                        inputMode="numeric"
                        autoComplete="off"
                        block={false}
                        className="w-full md:w-80"
                        value={values.amount}
                        onChange={(e) => onChange("amount", e.target.value)}
                    />
                </FormField>
            </FormSection>

            <FormSection title="申請者" headingLevel={3}>
                <FormLayout columns={2}>
                    <FormField
                        id={fieldId("applicant")}
                        label="氏名"
                        requirement="required"
                        supportText="姓と名の間に空白を入れてください"
                        errorText={errorOf("applicant")}
                    >
                        <Input name="applicant" autoComplete="name" value={values.applicant} onChange={(e) => onChange("applicant", e.target.value)} />
                    </FormField>
                    <FormField
                        id={fieldId("organization")}
                        label="所属"
                        requirement="optional"
                        supportText="法人・団体名。個人の場合は空欄で構いません。"
                        errorText={errorOf("organization")}
                    >
                        <Input
                            name="organization"
                            autoComplete="organization"
                            value={values.organization}
                            onChange={(e) => onChange("organization", e.target.value)}
                        />
                    </FormField>
                    <FormField
                        id={fieldId("email")}
                        label="メールアドレス"
                        requirement="required"
                        supportText="審査の結果をお知らせします"
                        errorText={errorOf("email")}
                    >
                        <Input
                            name="email"
                            type="email"
                            autoComplete="email"
                            spellCheck={false}
                            value={values.email}
                            onChange={(e) => onChange("email", e.target.value)}
                        />
                    </FormField>
                    <FormField
                        id={fieldId("phone")}
                        label="電話番号"
                        requirement="optional"
                        supportText="市外局番から、数字とハイフンで入力してください"
                        errorText={errorOf("phone")}
                    >
                        <Input name="phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(e) => onChange("phone", e.target.value)} />
                    </FormField>
                </FormLayout>
            </FormSection>

            <FormSection title="日程・担当" headingLevel={3}>
                <FormLayout columns={2}>
                    <FormField
                        id={fieldId("desiredDate")}
                        label="希望日"
                        requirement="required"
                        supportText="今日以降の日付を西暦で入力してください（例：2026-12-01）"
                        errorText={errorOf("desiredDate")}
                    >
                        <DatePicker name="desiredDate" value={values.desiredDate} min={minDate} onChange={(v) => onChange("desiredDate", v)} />
                    </FormField>
                    <FormField
                        id={fieldId("assignee")}
                        label="担当者"
                        requirement="optional"
                        supportText="名前の一部を入力すると候補を絞り込めます"
                        errorText={errorOf("assignee")}
                    >
                        <Combobox name="assignee" options={ASSIGNEE_OPTIONS} value={values.assignee} onChange={(v) => onChange("assignee", v)} />
                    </FormField>
                </FormLayout>
                <div className="flex flex-col gap-2">
                    <Switch
                        id={fieldId("priority")}
                        label={<span className="font-bold">優先対応</span>}
                        checked={values.priority}
                        onChange={(v) => onChange("priority", v)}
                        aria-describedby={priorityHelpId}
                    />
                    <p id={priorityHelpId} className="m-0 text-16 leading-170 tracking-2 text-text-muted">
                        期限が迫っている申請は、オンにすると審査の順番を早めます
                    </p>
                </div>
            </FormSection>

            <FormSection title="添付・補足" headingLevel={3}>
                <FormField
                    id={fieldId("attachments")}
                    label="添付ファイル"
                    requirement={attachmentRequired ? "required" : "optional"}
                    supportText="PDF、JPEG、PNGの形式で、1ファイル10 MBまでです。補助金の申請では、申請書（PDF）が必須です。"
                    errorText={errorOf("attachments")}
                >
                    <FileUpload
                        name="attachments"
                        multiple
                        accept={ACCEPTED_FILE_TYPES}
                        files={values.attachments}
                        onChange={(files) => onChange("attachments", files)}
                    />
                </FormField>
                <FormField
                    id={fieldId("memo")}
                    label="メモ"
                    requirement="optional"
                    supportText={`審査の担当者への補足を${MEMO_MAX}文字以内で入力してください`}
                    errorText={errorOf("memo")}
                >
                    <Textarea name="memo" rows={5} counterMax={MEMO_MAX} value={values.memo} onChange={(e) => onChange("memo", e.target.value)} />
                </FormField>
                <FormField id={fieldId("agreed")} label="確認事項" as="fieldset" requirement="required" errorText={errorOf("agreed")}>
                    <Checkbox id={fieldId("agreed")} name="agreed" checked={values.agreed} onChange={(e) => onChange("agreed", e.target.checked)}>
                        記載内容に誤りがないことを確かめた
                    </Checkbox>
                </FormField>
            </FormSection>
        </div>
    );
}
