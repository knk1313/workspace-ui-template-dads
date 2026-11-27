import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { applicationQueries, createApplication, invalidateApplications, updateApplication } from "@/api/applications";
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
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Application, ApplicationInput } from "@/api/applicationTypes";
import { keptAttachments, toFormFiles } from "./form/attachments";
import { ApplicationFormComplete, COMPLETE_HEADING_ID } from "./form/ApplicationFormComplete";
import { ApplicationFormConfirm } from "./form/ApplicationFormConfirm";
import { ApplicationFormFields } from "./form/ApplicationFormFields";
import { ERROR_SUMMARY_HEADING_ID, ErrorSummary } from "./form/ErrorSummary";
import { listHrefOf, type ListLinkState } from "./listLink";
import {
    EMPTY_VALUES,
    normalizeAmount,
    todayIso,
    validateApplicationForm,
    type ApplicationFormValues,
    type FieldError,
    type FieldName,
} from "./form/validation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { minWidth } from "@/tokens/breakpoints";

// 申請の作成・編集フォーム（/applications/new、/applications/:id/edit）。
// 入力 → 確認 → 完了 の 3 ステップ（編集は 入力 → 確認 で、更新後は詳細画面へ戻る）。
// DADS のバリデーション方針に従い、検証は「確認へ進む」を押したときだけ行う（入力中・フォーカスアウトではエラーを出さない）。
// 送信ボタンは無効化せず、エラーは上部のバナー（各項目へのリンク付き）と各項目のエラーテキストで示す。
// 入力途中で画面を離れようとすると確認を出す（useUnsavedChangesWarning）。送信に失敗したときは確認画面に残り、入力内容を失わない。
// 確認の段階は URL（?step=confirm）にも持つ。ブラウザーの「戻る」で入力の段階に戻れるようにするため（同じパスの中の移動なので、離脱の確認は出ない）。
// 一覧から来たときは、一覧の絞り込みの条件（state.listSearch）を詳細画面との行き来で引き継ぐ。

export type ApplicationFormPageProps = {
    mode: "create" | "edit";
};

type Step = "input" | "confirm" | "complete";

const STEP_HEADING_ID = "application-step-heading";
const SUBMIT_ERROR_ID = "application-submit-error";

function initialValues(application: Application | undefined): ApplicationFormValues {
    if (!application) return EMPTY_VALUES;
    return {
        ...EMPTY_VALUES,
        title: application.title,
        category: application.category,
        amount: application.amount > 0 ? String(application.amount) : "",
        applicant: application.applicant,
        // モックの「個人」は所属なしとして扱う
        organization: application.organization === "個人" ? "" : application.organization,
        email: application.email,
        phone: application.phone,
        desiredDate: application.desiredDate,
        assignee: application.assignee,
        attachments: toFormFiles(application.attachments),
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

/**
 * フォームの値を API に送る形にする。
 * kept は編集画面で扱わない既存の添付ファイル。フォームの添付だけを送ると消えてしまうため、後ろに足して送る。
 */
function toInput(values: ApplicationFormValues, kept: Application["attachments"] = []): ApplicationInput {
    return {
        title: values.title.trim(),
        category: values.category || "other",
        amount: normalizeAmount(values.amount) ?? 0,
        applicant: values.applicant.trim(),
        organization: values.organization.trim() || "個人",
        email: values.email.trim(),
        phone: values.phone.trim(),
        desiredDate: values.desiredDate,
        assignee: values.assignee,
        attachments: [...values.attachments.map((f) => ({ name: f.name, size: f.size })), ...kept],
        memo: values.memo.trim() || undefined,
    };
}

export default function ApplicationFormPage({ mode }: ApplicationFormPageProps) {
    usePageTitle(mode === "create" ? "新規申請" : "申請を編集");
    if (mode === "create") return <ApplicationForm key="new" mode="create" application={undefined} />;
    return <EditApplicationForm />;
}

/** 編集: 対象の申請を読み込んでからフォームを出す。 */
function EditApplicationForm() {
    const { id = "" } = useParams();
    const detail = useQuery(applicationQueries.detail(id));
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
                description="この申請は削除されたか、受付番号が違います。申請一覧から探し直してください。"
                actions={<ButtonLink to="/applications">申請一覧へ戻る</ButtonLink>}
            />
        );
    }

    // 編集対象が変わったら（/applications/a/edit → /applications/b/edit）入力状態を作り直す
    return <ApplicationForm key={application.id} mode="edit" application={application} />;
}

function ApplicationForm({ mode, application }: { mode: "create" | "edit"; application: Application | undefined }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [listState] = useState<ListLinkState>(() => (location.state as ListLinkState) ?? null);
    const listHref = listHrefOf(listState);
    const { toast } = useToast();
    const isEdit = mode === "edit";
    const create = useMutation(createApplication);
    const update = useMutation(updateApplication);
    const submitting = create.pending || update.pending;
    const [submitError, setSubmitError] = useState<string>();
    // 横並びのステップは 375px 幅に収まらず「完了」が隠れるため、md 未満は縦並びにする（DADS もモバイルは縦を推奨）
    const isWide = useMediaQuery(minWidth("md"));

    const [initial, setInitial] = useState(() => initialValues(application));
    // 編集画面で扱わない形式の既存の添付ファイル。表示だけして、更新するときにそのまま送り返す
    const [kept] = useState(() => (application ? keptAttachments(application.attachments) : []));
    const [values, setValues] = useState(initial);
    const [errors, setErrors] = useState<FieldError[]>([]);
    // 確認の段階は URL で持つ。ただし、入力を検証して進んだときだけ確認を出す（?step=confirm を直接開いたときは入力から）
    const [reachedConfirm, setReachedConfirm] = useState(false);
    const [created, setCreated] = useState<Application>();
    // 更新したあとの移動先。確認の段階を履歴から外してから（一つ戻ってから）、置き換えで移る
    const [leaveTo, setLeaveTo] = useState<string>();
    const step: Step = created ? "complete" : leaveTo || (reachedConfirm && searchParams.get("step") === "confirm") ? "confirm" : "input";
    const submitErrorHeadingRef = useRef<HTMLHeadingElement>(null);
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
        const found = validateApplicationForm(values, today, application?.desiredDate);
        setErrors(found);
        setSubmitCount((n) => n + 1);
        if (found.length === 0) {
            setReachedConfirm(true);
            // 履歴に積む（ブラウザーの「戻る」で入力の段階に戻る）
            setSearchParams({ step: "confirm" }, { state: listState });
        }
    };

    useEffect(() => {
        if (leaveTo && !searchParams.get("step")) navigate(leaveTo, { replace: true, state: listState });
    }, [leaveTo, searchParams, navigate, listState]);

    // フォームの間は、ブラウザーにスクロールの位置を復元させない。更新したあとは履歴を一つ戻ってから詳細へ移るため、
    // 復元させると、詳細の画面が入力の段階の位置（途中）から表示される。段階を移ったときの位置は、見出しへのフォーカスで決まる。
    useEffect(() => {
        const previous = window.history.scrollRestoration;
        window.history.scrollRestoration = "manual";
        return () => {
            window.history.scrollRestoration = previous;
        };
    }, []);

    // 確認の段階から入力の段階に戻る。確認の段階は入力から履歴に積んで来ているので、一つ戻る
    const backToInput = () => navigate(-1);

    // 送信に失敗したら、エラーのバナーの見出しへフォーカスを移す（バナーを描いたあとに動かすため effect で行う）
    useEffect(() => {
        if (submitError) submitErrorHeadingRef.current?.focus();
    }, [submitError]);

    const dirty = step !== "complete" && isDirty(values, initial);
    const { allowNavigation } = useUnsavedChangesWarning(dirty, {
        title: isEdit ? "編集内容を破棄して移動する" : "入力内容を破棄して移動する",
    });

    const submit = async () => {
        if (submitting) return;
        setSubmitError(undefined);
        try {
            if (isEdit && application) {
                await update.run(application.id, toInput(values, kept));
                invalidateApplications();
                toast({ type: "success", title: "申請内容を更新しました", description: `${application.number}「${values.title.trim()}」` });
                allowNavigation();
                // 編集の画面を履歴から外す（更新したあとに「戻る」で編集の画面に入り直さないように）。
                // 確認の段階が履歴に積んであれば、先に一つ戻ってから置き換える（下の effect）
                if (searchParams.get("step")) {
                    setLeaveTo(`/applications/${application.id}`);
                    navigate(-1);
                } else {
                    navigate(`/applications/${application.id}`, { replace: true, state: listState });
                }
                return;
            }
            const result = await create.run(toInput(values));
            invalidateApplications();
            setCreated(result);
            // 完了したら確認の段階を履歴から外す
            setSearchParams({}, { replace: true, state: listState });
        } catch (e) {
            // 確認画面に残り、入力内容を失わずに再送信できるようにする
            setSubmitError((e as Error).message);
        }
    };

    const saveDraft = () => {
        // 保存した内容を基準にする（保存した直後に離れても、破棄の確認を出さない）
        setInitial(values);
        toast({ type: "success", title: "下書きを保存しました", description: "入力途中の内容を保存しました。見本のため、実際には保存しません。" });
    };

    const backPath = isEdit && application ? `/applications/${application.id}` : listHref;

    // 入力途中なら useUnsavedChangesWarning が確認を出す
    const cancel = () => navigate(backPath, { state: listState });

    const restart = () => {
        setInitial(EMPTY_VALUES);
        setValues(EMPTY_VALUES);
        setErrors([]);
        setSubmitCount(0);
        setReachedConfirm(false);
        setCreated(undefined);
    };

    const steps = isEdit ? [{ label: "入力" }, { label: "確認" }] : [{ label: "入力" }, { label: "確認" }, { label: "完了" }];
    const currentStep = step === "input" ? 0 : step === "confirm" ? 1 : 2;

    const breadcrumbs: BreadcrumbItem[] =
        isEdit && application
            ? [
                  { label: "ホーム", href: "/" },
                  { label: "申請一覧", href: listHref },
                  { label: application.number, href: `/applications/${application.id}`, state: listState },
                  { label: "編集" },
              ]
            : [{ label: "ホーム", href: "/" }, { label: "申請一覧", href: listHref }, { label: "新規申請" }];

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title={isEdit ? "申請を編集" : "新規申請"}
                description={isEdit && application ? `${application.number}「${application.title}」` : "必要事項を入力し、確認の画面で内容を確かめてから申請してください。"}
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
                    <ApplicationFormFields values={values} errors={errors} onChange={onChange} minDate={today} keptAttachments={kept} />
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
                            内容に誤りがなければ「{isEdit ? "更新する" : "申請する"}」を押してください。直す場合は「修正する」で入力の画面に戻ります。
                        </p>
                    </div>
                    {submitError && (
                        <NotificationBanner
                            id={SUBMIT_ERROR_ID}
                            type="error"
                            headingRef={submitErrorHeadingRef}
                            title={isEdit ? "更新できませんでした" : "申請できませんでした"}
                            description={
                                isEdit
                                    ? "編集した内容は残っています。時間をおいて、もう一度「更新する」を押してください。"
                                    : "入力した内容は残っています。時間をおいて、もう一度「申請する」を押してください。"
                            }
                            live
                        />
                    )}
                    <ApplicationFormConfirm values={values} keptAttachments={kept} />
                    <ActionPanel
                        className="border-t border-border pt-6"
                        label="確認の操作"
                        primary={
                            <Button loading={submitting} onClick={submit}>
                                {isEdit ? "更新する" : "申請する"}
                            </Button>
                        }
                        secondary={
                            <Button variant="outline" onClick={backToInput}>
                                修正する
                            </Button>
                        }
                    />
                </div>
            )}

            {step === "complete" && created && (
                <ApplicationFormComplete applicationId={created.id} receiptNumber={created.number} email={values.email.trim()} onRestart={restart} />
            )}
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
