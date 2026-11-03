import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { createApplication, getApplication, invalidateApplications, updateApplication } from "@/api/applications";
import { useMutation, useQuery } from "@/api/query";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ActionPanel } from "@/components/ui/ActionPanel";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumb";
import { ErrorPage } from "@/components/ui/ErrorPage";
import { LoadError } from "@/components/ui/LoadError";
import { NotificationBanner } from "@/components/ui/NotificationBanner";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { StepNavigation } from "@/components/ui/StepNavigation";
import { useToast } from "@/components/ui/Toast";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { useMediaQuery } from "@/layouts/useMediaQuery";
import { findApplicationContact, toMockFiles } from "@/mocks/applicationForm";
import type { Application, ApplicationInput } from "@/api/types";
import { ApplicationFormComplete, COMPLETE_HEADING_ID } from "./form/ApplicationFormComplete";
import { ApplicationFormConfirm } from "./form/ApplicationFormConfirm";
import { ApplicationFormFields } from "./form/ApplicationFormFields";
import { ERROR_SUMMARY_HEADING_ID, ErrorSummary } from "./form/ErrorSummary";
import {
    EMPTY_VALUES,
    normalizeAmount,
    todayIso,
    validateApplicationForm,
    type ApplicationFormValues,
    type FieldError,
    type FieldName,
} from "./form/validation";

// 申請の作成・編集フォーム（/applications/new、/applications/:id/edit）。
// 入力 → 確認 → 完了 の 3 ステップ（編集は 入力 → 確認 で、更新後は詳細画面へ戻る）。
// DADS のバリデーション方針に従い、検証は「確認へ進む」を押したときだけ行う（入力中・フォーカスアウトではエラーを出さない）。
// 送信ボタンは無効化せず、エラーは上部のバナー（各項目へのリンク付き）と各項目のエラーテキストで示す。
// 入力途中で画面を離れようとすると確認を出す（useUnsavedChangesWarning）。送信に失敗したときは確認画面に残り、入力内容を失わない。

export type ApplicationFormPageProps = {
    mode: "create" | "edit";
};

type Step = "input" | "confirm" | "complete";

const STEP_HEADING_ID = "application-step-heading";
const SUBMIT_ERROR_ID = "application-submit-error";

function initialValues(application: Application | undefined): ApplicationFormValues {
    if (!application) return EMPTY_VALUES;
    const contact = findApplicationContact(application);
    return {
        ...EMPTY_VALUES,
        title: application.title,
        category: application.category,
        amount: application.amount > 0 ? String(application.amount) : "",
        applicant: application.applicant,
        // モックの「個人」は所属なしとして扱う
        organization: application.organization === "個人" ? "" : application.organization,
        email: contact.email,
        phone: contact.phone,
        desiredDate: contact.desiredDate,
        assignee: application.assignee,
        attachments: toMockFiles(application.attachments),
        memo: application.memo ?? "",
        // 確認事項は編集のたびに改めて確認してもらう
        agreed: false,
    };
}

function isDirty(values: ApplicationFormValues, initial: ApplicationFormValues): boolean {
    return (Object.keys(values) as FieldName[]).some((k) => {
        const a = values[k];
        const b = initial[k];
        if (Array.isArray(a) && Array.isArray(b)) return a.length !== b.length || a.some((f, i) => f !== b[i]);
        return a !== b;
    });
}

function toInput(values: ApplicationFormValues): ApplicationInput {
    return {
        title: values.title.trim(),
        category: values.category || "other",
        amount: normalizeAmount(values.amount) ?? 0,
        applicant: values.applicant.trim(),
        organization: values.organization.trim() || "個人",
        assignee: values.assignee,
        attachments: values.attachments.map((f) => ({ name: f.name, size: f.size })),
        memo: values.memo.trim() || undefined,
    };
}

export default function ApplicationFormPage({ mode }: ApplicationFormPageProps) {
    if (mode === "create") return <ApplicationForm key="new" mode="create" application={undefined} />;
    return <EditApplicationForm />;
}

/** 編集: 対象の申請を読み込んでからフォームを出す。 */
function EditApplicationForm() {
    const { id = "" } = useParams();
    const fetchDetail = useCallback(() => getApplication(id), [id]);
    const detail = useQuery(`applications/${id}`, fetchDetail);
    const application = detail.data?.application;

    if (detail.isLoading) {
        return (
            <div className="flex flex-col gap-6" aria-busy="true">
                <p role="status" className="sr-only">
                    申請を読み込んでいます
                </p>
                <Skeleton className="w-64" />
                <Skeleton variant="rect" className="h-10 w-1/2" />
                <Skeleton lines={8} />
            </div>
        );
    }
    if (detail.error && detail.data === undefined) {
        return (
            <div className="flex flex-col gap-6">
                <PageHeader title="申請を編集" breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "申請一覧", href: "/applications" }, { label: "編集" }]} />
                <LoadError subject="申請" error={detail.error} onRetry={detail.reload} />
            </div>
        );
    }
    if (!application) {
        return (
            <ErrorPage
                status={404}
                title="申請が見つかりません"
                description="指定された申請は存在しないか、削除された可能性があります。申請一覧から探し直してください。"
                actions={<ButtonLink to="/applications">申請一覧へ戻る</ButtonLink>}
            />
        );
    }

    // 編集対象が変わったら（/applications/a/edit → /applications/b/edit）入力状態を作り直す
    return <ApplicationForm key={application.id} mode="edit" application={application} />;
}

function ApplicationForm({ mode, application }: { mode: "create" | "edit"; application: Application | undefined }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const isEdit = mode === "edit";
    const create = useMutation(createApplication);
    const update = useMutation(updateApplication);
    const submitting = create.pending || update.pending;
    const [submitError, setSubmitError] = useState<string>();
    // 横並びのステップは 375px 幅に収まらず「完了」が隠れるため、md 未満は縦並びにする（DADS もモバイルは縦を推奨）
    const isWide = useMediaQuery("(min-width: 48rem)");

    const [initial, setInitial] = useState(() => initialValues(application));
    const [values, setValues] = useState(initial);
    const [errors, setErrors] = useState<FieldError[]>([]);
    const [step, setStep] = useState<Step>("input");
    const [receiptNumber, setReceiptNumber] = useState("");
    // 送信のたびに増やす。同じエラーのまま再送信したときもバナーへフォーカスを移し直すため。
    const [submitCount, setSubmitCount] = useState(0);
    const today = todayIso();

    // ステップが変わったら、そのステップの見出しへフォーカスを移す（初回表示では動かさない）
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        document.getElementById(step === "complete" ? COMPLETE_HEADING_ID : STEP_HEADING_ID)?.focus();
    }, [step]);

    useEffect(() => {
        if (submitCount > 0 && errors.length > 0) document.getElementById(ERROR_SUMMARY_HEADING_ID)?.focus();
    }, [submitCount, errors]);

    const onChange = <K extends FieldName>(field: K, value: ApplicationFormValues[K]) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const goToConfirm = () => {
        const found = validateApplicationForm(values, today);
        setErrors(found);
        setSubmitCount((n) => n + 1);
        if (found.length === 0) setStep("confirm");
    };

    const dirty = step !== "complete" && isDirty(values, initial);
    const { allowNavigation } = useUnsavedChangesWarning(dirty, {
        title: isEdit ? "編集内容を破棄して移動しますか" : "入力内容を破棄して移動しますか",
    });

    const submit = async () => {
        if (submitting) return;
        setSubmitError(undefined);
        try {
            if (isEdit && application) {
                await update.run(application.id, toInput(values));
                invalidateApplications();
                toast({ type: "success", title: "申請内容を更新しました", description: `${application.number}「${values.title.trim()}」` });
                allowNavigation();
                navigate(`/applications/${application.id}`);
                return;
            }
            const created = await create.run(toInput(values));
            invalidateApplications();
            setReceiptNumber(created.number);
            setStep("complete");
        } catch (e) {
            // 確認画面に残り、入力内容を失わずに再送信できるようにする
            setSubmitError((e as Error).message);
            document.getElementById(SUBMIT_ERROR_ID)?.querySelector<HTMLElement>("[tabindex='-1']")?.focus();
        }
    };

    const saveDraft = () => {
        toast({ type: "success", title: "下書きを保存しました", description: "入力途中の内容を保存しました（見本のため、実際には保存されません）。" });
    };

    const backPath = isEdit && application ? `/applications/${application.id}` : "/applications";

    // 入力途中なら useUnsavedChangesWarning が確認を出す
    const cancel = () => navigate(backPath);

    const restart = () => {
        setInitial(EMPTY_VALUES);
        setValues(EMPTY_VALUES);
        setErrors([]);
        setSubmitCount(0);
        setStep("input");
    };

    const steps = isEdit ? [{ label: "入力" }, { label: "確認" }] : [{ label: "入力" }, { label: "確認" }, { label: "完了" }];
    const currentStep = step === "input" ? 0 : step === "confirm" ? 1 : 2;

    const breadcrumbs: BreadcrumbItem[] =
        isEdit && application
            ? [
                  { label: "ホーム", href: "/" },
                  { label: "申請一覧", href: "/applications" },
                  { label: application.number, href: `/applications/${application.id}` },
                  { label: "編集" },
              ]
            : [{ label: "ホーム", href: "/" }, { label: "申請一覧", href: "/applications" }, { label: "新規申請" }];

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title={isEdit ? "申請を編集" : "新規申請"}
                description={isEdit && application ? `${application.number}「${application.title}」` : "必要事項を入力し、確認画面で内容を確かめてから申請してください。"}
                breadcrumbs={breadcrumbs}
            />
            <StepNavigation steps={steps} current={currentStep} orientation={isWide ? "horizontal" : "vertical"} />

            {step === "input" && (
                <form
                    noValidate
                    aria-labelledby={STEP_HEADING_ID}
                    onSubmit={(e) => {
                        e.preventDefault();
                        goToConfirm();
                    }}
                    className="flex flex-col gap-8"
                >
                    {errors.length > 0 && <ErrorSummary errors={errors} />}
                    <StepHeading>{isEdit ? "申請内容の編集" : "申請内容の入力"}</StepHeading>
                    <ApplicationFormFields values={values} errors={errors} onChange={onChange} minDate={today} />
                    {/* 画面下部への固定表示はフォームの上に浮いて見え、入力欄を隠すため使わない。フォームの末尾に罫線で区切って置く。 */}
                    <ActionPanel
                        className="border-t border-border pt-6"
                        label="フォームの操作"
                        primary={<Button type="submit">確認へ進む</Button>}
                        secondary={
                            <Button variant="outline" onClick={saveDraft}>
                                下書き保存
                            </Button>
                        }
                        cancel={
                            <Button variant="text" onClick={cancel}>
                                キャンセル
                            </Button>
                        }
                    />
                </form>
            )}

            {step === "confirm" && (
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <StepHeading>入力内容の確認</StepHeading>
                        <p className="m-0 text-16 leading-170 tracking-2 text-text">
                            内容に誤りがなければ「{isEdit ? "更新する" : "申請する"}」を押してください。直す場合は「修正する」で入力画面に戻ります。
                        </p>
                    </div>
                    {submitError && (
                        <NotificationBanner
                            id={SUBMIT_ERROR_ID}
                            type="error"
                            title={isEdit ? "更新できませんでした" : "申請できませんでした"}
                            description={`${submitError}入力した内容は残っています。`}
                            live
                        />
                    )}
                    <ApplicationFormConfirm values={values} />
                    <ActionPanel
                        className="border-t border-border pt-6"
                        label="確認の操作"
                        primary={
                            <Button loading={submitting} onClick={submit}>
                                {isEdit ? "更新する" : "申請する"}
                            </Button>
                        }
                        secondary={
                            <Button variant="outline" onClick={() => setStep("input")}>
                                修正する
                            </Button>
                        }
                    />
                </div>
            )}

            {step === "complete" && <ApplicationFormComplete receiptNumber={receiptNumber} email={values.email.trim()} onRestart={restart} />}
        </div>
    );
}

function StepHeading({ children }: { children: string }) {
    return (
        <h2 id={STEP_HEADING_ID} tabIndex={-1} className="m-0 text-std-24B-150 text-text-strong focus-visible:focus-ring">
            {children}
        </h2>
    );
}
