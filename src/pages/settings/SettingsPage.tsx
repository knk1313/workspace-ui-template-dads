import { useEffect, useRef, useState, type FormEvent } from "react";
import { getMockOptions, setMockOptions, type MockOptions } from "@/api/mock";
import { setQueryData, useMutation, useQuery } from "@/api/query";
import { getNotificationSettings, getProfile, saveNotificationSettings, saveProfile } from "@/api/settings";
import type { NotificationSettings, Profile } from "@/api/types";
import { useSearchParams } from "react-router";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Divider } from "@/components/ui/Divider";
import { FileUpload } from "@/components/ui/FileUpload";
import { FormField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormLayout";
import { Input } from "@/components/ui/Input";
import { Link } from "@/components/ui/Link";
import { LoadError } from "@/components/ui/LoadError";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Skeleton } from "@/components/ui/Skeleton";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { LOCALE_OPTIONS, TIME_ZONE_OPTIONS, useDisplaySettings } from "@/context/DisplaySettings";
import { useLayoutPreference, type LayoutKind } from "@/context/LayoutPreference";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { formatDateTime } from "@/lib/format";
import { DEPARTMENTS, PROFILE, SAMPLE_DATETIME } from "@/mocks/settings";

// 設定画面。タブで「アカウント」「通知」「表示」に分け、各タブの中は設定画面型のフォーム
// （FormSection layout="settings": md 以上で左に見出し・説明、右に項目）にする。
// 保存はセクションごとの「保存する」で行う（タブをまたいで未保存の変更が混ざらないようにするため）。
// プロフィールと通知の設定は src/api/ のダミー API から読み書きする。保存していない変更があるまま画面を離れると確認を出す。

const TAB_VALUES = ["account", "notifications", "display"] as const;
type TabValue = (typeof TAB_VALUES)[number];

const IMAGE_ACCEPT = "image/png,image/jpeg";
const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const BIO_MAX = 200;
// 形式の厳密な検査はサーバー側で行う前提で、明らかな入力誤り（@ やドメインの欠落）だけを見る。
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SettingsPage() {
    // 選択中のタブは URL（?tab=）に持つ。画面レイアウトを保存するとシェルが入れ替わってこの画面が描き直されるため、
    // コンポーネントの state に持つと「表示」タブから「アカウント」タブに戻ってしまう。
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get("tab");
    const tab: TabValue = TAB_VALUES.includes(tabParam as TabValue) ? (tabParam as TabValue) : "account";

    const selectTab = (next: string) => {
        setSearchParams(next === "account" ? {} : { tab: next }, { replace: true });
    };

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="設定"
                description="プロフィール、通知、画面の表示を変更できます。"
                breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "設定" }]}
            />
            <Tabs
                label="設定の分類"
                value={tab}
                onChange={selectTab}
                items={[
                    { value: "account", label: "アカウント", panel: <AccountTab /> },
                    { value: "notifications", label: "通知", panel: <NotificationsTab /> },
                    { value: "display", label: "表示", panel: <DisplayTab /> },
                ]}
            />
            <ScreenExamples />
        </div>
    );
}

/* ───────────── アカウント ───────────── */

type ProfileErrors = { name?: string; email?: string; image?: string };

/** 読み込み中のフォームの形。 */
function FormSkeleton({ label }: { label: string }) {
    return (
        <Card>
            <CardBody className="flex flex-col gap-6" aria-busy="true">
                <p role="status" className="sr-only">
                    {label}を読み込んでいます
                </p>
                <Skeleton className="w-40" />
                <Skeleton variant="rect" className="h-12 w-full max-w-md" />
                <Skeleton variant="rect" className="h-12 w-full max-w-md" />
                <Skeleton lines={3} className="max-w-md" />
            </CardBody>
        </Card>
    );
}

function AccountTab() {
    const profile = useQuery("settings/profile", getProfile);
    return (
        <div className="flex flex-col gap-6">
            {profile.error && !profile.data ? (
                <LoadError subject="プロフィール" error={profile.error} onRetry={profile.reload} />
            ) : profile.data ? (
                <ProfileForm initial={profile.data} />
            ) : (
                <FormSkeleton label="プロフィール" />
            )}
            <AccountDeletion />
        </div>
    );
}

function ProfileForm({ initial }: { initial: Profile }) {
    const { toast } = useToast();
    const save = useMutation(saveProfile);
    const [saved, setSaved] = useState(initial);
    const [name, setName] = useState(initial.name);
    const [email, setEmail] = useState(initial.email);
    const [department, setDepartment] = useState<string>(initial.department);
    const [bio, setBio] = useState(initial.bio);
    const [images, setImages] = useState<File[]>([]);
    const [errors, setErrors] = useState<ProfileErrors>({});
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const [preview, setPreviewFile] = useObjectUrl();

    const onImageChange = (files: File[]) => {
        setImages(files);
        // 画像の形式・サイズは選んだ時点で分かるので、送信を待たずに知らせる。
        const file = files[0];
        let image: string | undefined;
        if (file && !IMAGE_ACCEPT.split(",").includes(file.type)) image = "PNG または JPEG の画像を選んでください";
        else if (file && file.size > IMAGE_MAX_BYTES) image = "2 MB 以下の画像を選んでください";
        setErrors((prev) => ({ ...prev, image }));
        setPreviewFile(image ? undefined : file);
    };

    const dirty = name !== saved.name || email !== saved.email || department !== saved.department || bio !== saved.bio || images.length > 0;
    useUnsavedChangesWarning(dirty, { title: "プロフィールの変更を破棄して移動しますか" });

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (save.pending) return;
        const next: ProfileErrors = { image: errors.image };
        if (!name.trim()) next.name = "表示名を入力してください";
        if (!email.trim()) next.email = "メールアドレスを入力してください";
        else if (!EMAIL_PATTERN.test(email.trim())) next.email = "メールアドレスを「name@example.go.jp」の形式で入力してください";
        setErrors(next);
        // 最初の誤りにフォーカスを移し、何を直せばよいかをその場で読めるようにする。
        if (next.name) return nameRef.current?.focus();
        if (next.email) return emailRef.current?.focus();
        if (next.image) return;
        try {
            const result = await save.run({ name: name.trim(), email: email.trim(), department, bio });
            setQueryData<Profile>("settings/profile", () => result);
            setSaved(result);
            setName(result.name);
            setEmail(result.email);
            setImages([]);
            toast({ type: "success", title: "プロフィールを保存しました" });
        } catch (err) {
            // 入力はそのまま残し、もう一度「保存する」を押せばやり直せる
            toast({ type: "error", title: "プロフィールを保存できませんでした", description: (err as Error).message });
        }
    };

    return (
        <Card>
            <CardBody>
                <form noValidate onSubmit={onSubmit}>
                    <FormSection layout="settings" title="プロフィール" description="ほかの職員に表示される名前と連絡先です。">
                        <FormField label="表示名" requirement="required" supportText="申請の担当者欄などに表示されます。" errorText={errors.name}>
                            <Input ref={nameRef} name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </FormField>
                        <FormField label="メールアドレス" requirement="required" errorText={errors.email}>
                            <Input
                                ref={emailRef}
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </FormField>
                        <FormField label="所属">
                            <Select
                                name="department"
                                block
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                            />
                        </FormField>
                        <FormField label="自己紹介" requirement="optional" supportText={`担当業務などを ${BIO_MAX} 文字以内で書いてください。`}>
                            <Textarea name="bio" rows={4} counterMax={BIO_MAX} value={bio} onChange={(e) => setBio(e.target.value)} />
                        </FormField>
                        <FormField label="プロフィール画像" requirement="optional" supportText="PNG または JPEG、2 MB まで。" errorText={errors.image}>
                            {/* アバター（48px）とファイル選択ボタン（48px）は高さが同じなので、上端で揃えると中央も揃う。
                                選択後にファイル一覧が下に伸びてもアバターが中央へずれないよう items-start にする。 */}
                            <div className="flex items-start gap-4">
                                <Avatar name={name.trim() || PROFILE.name} src={preview} size="lg" />
                                <FileUpload files={images} onChange={onImageChange} accept={IMAGE_ACCEPT} dropArea={false} buttonLabel="画像を選択" className="min-w-0 flex-1" />
                            </div>
                        </FormField>
                        <ActionPanel
                            label="プロフィールの操作"
                            primary={
                                <Button type="submit" loading={save.pending}>
                                    保存する
                                </Button>
                            }
                        />
                    </FormSection>
                </form>
            </CardBody>
        </Card>
    );
}

function AccountDeletion() {
    const { toast } = useToast();
    const { confirm } = useConfirm();

    const onDelete = async () => {
        const ok = await confirm({
            title: "アカウントを削除しますか",
            message: "削除すると、このアカウントでログインできなくなります。この操作は取り消せません。",
            confirmLabel: "削除する",
            tone: "error",
        });
        if (!ok) return;
        toast({ type: "info", title: "サンプルのため、アカウントは削除されません" });
    };

    return (
        <>
            {/* 危険な操作。枠をエラー色にすると「エラーが起きている」と誤読されるため、見出しと説明で明示する。 */}
            <Card>
                <CardBody>
                    <FormSection
                        layout="settings"
                        title="アカウントの削除"
                        description="アカウントと、このアカウントで作成した下書きを削除します。削除したアカウントは元に戻せません。"
                    >
                        <div className="flex flex-col gap-4">
                            <p className="m-0 text-std-16N-170 text-text">
                                処理中の申請がある場合は、担当者を変更してから削除してください。
                            </p>
                            <div>
                                <Button variant="outline" tone="error" onClick={onDelete}>
                                    アカウントを削除
                                </Button>
                            </div>
                        </div>
                    </FormSection>
                </CardBody>
            </Card>
        </>
    );
}

/** 選んだ画像のプレビュー用 URL を持ち、差し替えたときとアンマウント時に解放する。 */
function useObjectUrl(): [string | undefined, (file: File | undefined) => void] {
    const [url, setUrl] = useState<string>();
    const urlRef = useRef<string | undefined>(undefined);
    useEffect(() => () => revoke(urlRef.current), []);
    const update = (file: File | undefined) => {
        revoke(urlRef.current);
        // createObjectURL がない環境（テスト用 DOM など）ではプレビューを出さない。
        const next = file && typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : undefined;
        urlRef.current = next;
        setUrl(next);
    };
    return [url, update];
}

function revoke(url: string | undefined) {
    if (url && typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(url);
}

/* ───────────── 通知 ───────────── */

const NOTIFICATIONS_KEY = "settings/notifications";

function NotificationsTab() {
    const settings = useQuery(NOTIFICATIONS_KEY, getNotificationSettings);
    if (settings.error && !settings.data) return <LoadError subject="通知の設定" error={settings.error} onRetry={settings.reload} />;
    if (!settings.data) return <FormSkeleton label="通知の設定" />;
    return <NotificationsForm settings={settings.data} />;
}

type EventKey = "onSubmitted" | "onReturned" | "weeklyDigest";

function NotificationsForm({ settings }: { settings: NotificationSettings }) {
    const { toast } = useToast();
    const saveChannels = useMutation(saveNotificationSettings);
    // スイッチは切り替えた時点で反映する（DADS: 保存ボタンで確定する項目にはスイッチを使わない）。
    // 通信の結果を待たずに画面へ反映し（楽観的な更新）、失敗したら元に戻して知らせる。
    // 通知方法はまとめて確定したいのでチェックボックス + 保存ボタンにする。
    const { onSubmitted, onReturned, weeklyDigest } = settings;
    const [byEmail, setByEmail] = useState(settings.channels.email);
    const [inApp, setInApp] = useState(settings.channels.inApp);
    const [channelError, setChannelError] = useState<string>();
    const firstChannelRef = useRef<HTMLInputElement>(null);

    const dirty = byEmail !== settings.channels.email || inApp !== settings.channels.inApp;
    useUnsavedChangesWarning(dirty, { title: "通知方法の変更を破棄して移動しますか" });

    const toggle = async (key: EventKey, value: boolean) => {
        const previous = settings;
        const next = { ...settings, [key]: value };
        setQueryData<NotificationSettings>(NOTIFICATIONS_KEY, () => next);
        try {
            await saveNotificationSettings(next);
        } catch (err) {
            setQueryData<NotificationSettings>(NOTIFICATIONS_KEY, () => previous);
            toast({ type: "error", title: "通知の設定を変更できませんでした", description: (err as Error).message });
        }
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (saveChannels.pending) return;
        if (!byEmail && !inApp) {
            setChannelError("通知方法を 1 つ以上選んでください");
            firstChannelRef.current?.focus();
            return;
        }
        setChannelError(undefined);
        try {
            const result = await saveChannels.run({ ...settings, channels: { email: byEmail, inApp } });
            setQueryData<NotificationSettings>(NOTIFICATIONS_KEY, () => result);
            toast({ type: "success", title: "通知方法を保存しました" });
        } catch (err) {
            toast({ type: "error", title: "通知方法を保存できませんでした", description: (err as Error).message });
        }
    };

    return (
        <Card>
            <CardBody className="flex flex-col gap-8">
                <FormSection layout="settings" title="通知するできごと" description="オンにしたできごとが起きたときに通知します。切り替えるとすぐに反映されます。">
                    {/* ラベルの長さが違ってもスイッチの位置が揃うよう、行を幅いっぱいにしてスイッチを右端に寄せる。 */}
                    <ul className="m-0 flex list-none flex-col gap-2 p-0">
                        <li>
                            <Switch className="flex w-full max-w-sm justify-between" label="申請が届いたとき" checked={onSubmitted} onChange={(v) => void toggle("onSubmitted", v)} />
                        </li>
                        <li>
                            <Switch className="flex w-full max-w-sm justify-between" label="差戻しがあったとき" checked={onReturned} onChange={(v) => void toggle("onReturned", v)} />
                        </li>
                        <li>
                            <Switch className="flex w-full max-w-sm justify-between" label="週次のまとめ" checked={weeklyDigest} onChange={(v) => void toggle("weeklyDigest", v)} />
                        </li>
                    </ul>
                </FormSection>
                <Divider />
                <form noValidate onSubmit={onSubmit}>
                    <FormSection layout="settings" title="通知方法" description="通知を受け取る方法を選びます。">
                        <FormField label="受け取る方法" as="fieldset" requirement="required" supportText="複数選べます。" errorText={channelError}>
                            <div className="flex flex-col">
                                <Checkbox ref={firstChannelRef} name="channel" value="email" checked={byEmail} onChange={(e) => setByEmail(e.target.checked)}>
                                    メール
                                </Checkbox>
                                <Checkbox name="channel" value="in-app" checked={inApp} onChange={(e) => setInApp(e.target.checked)}>
                                    システム内（画面右上のお知らせ）
                                </Checkbox>
                            </div>
                        </FormField>
                        <ActionPanel
                            label="通知方法の操作"
                            primary={
                                <Button type="submit" loading={saveChannels.pending}>
                                    保存する
                                </Button>
                            }
                        />
                    </FormSection>
                </form>
            </CardBody>
        </Card>
    );
}

/* ───────────── 表示 ───────────── */

const LAYOUT_OPTIONS: { value: LayoutKind; label: string }[] = [
    { value: "sidebar", label: "サイドバー型（左にメニュー）" },
    { value: "topnav", label: "上部ナビゲーション型（上にメニュー）" },
];

function DisplayTab() {
    const { toast } = useToast();
    const { layout, setLayout } = useLayoutPreference();
    const { settings, setSettings } = useDisplaySettings();
    // 保存するまでは画面全体に反映しない（選んでいる途中でシェルが入れ替わると操作中の場所を見失うため）。
    const [draftLayout, setDraftLayout] = useState<LayoutKind>(layout);
    const [locale, setLocale] = useState(settings.locale);
    const [timeZone, setTimeZone] = useState(settings.timeZone);
    const dirty = draftLayout !== layout || locale !== settings.locale || timeZone !== settings.timeZone;
    useUnsavedChangesWarning(dirty, { title: "表示の変更を破棄して移動しますか" });

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSettings({ locale, timeZone });
        setLayout(draftLayout);
        toast({ type: "success", title: "表示の設定を保存しました" });
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardBody>
                    <form noValidate onSubmit={onSubmit}>
                        <FormSection layout="settings" title="表示" description="画面のレイアウトと日時の表示形式を選びます。この端末のブラウザに保存されます。">
                            <FormField label="画面レイアウト" as="fieldset" supportText="メニューの項目が少ない場合は上部ナビゲーション型も使えます。">
                                <RadioGroup name="layout" value={draftLayout} onChange={(v) => setDraftLayout(v as LayoutKind)} options={LAYOUT_OPTIONS} />
                            </FormField>
                            <FormField label="日付の形式" as="fieldset">
                                <RadioGroup name="locale" value={locale} onChange={setLocale} options={LOCALE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
                            </FormField>
                            <FormField label="タイムゾーン">
                                <Select
                                    name="timeZone"
                                    value={timeZone}
                                    onChange={(e) => setTimeZone(e.target.value)}
                                    options={TIME_ZONE_OPTIONS.map((tz) => ({ value: tz, label: tz }))}
                                />
                            </FormField>
                            <Panel padding="sm" aria-live="polite">
                                <p className="m-0 text-std-16N-170 text-text">
                                    表示例: <span className="nums font-bold text-text-strong">{formatDateTime(SAMPLE_DATETIME, { locale, timeZone })}</span>
                                </p>
                            </Panel>
                            <ActionPanel label="表示の操作" primary={<Button type="submit">保存する</Button>} />
                        </FormSection>
                    </form>
                </CardBody>
            </Card>
            <MockApiOptions />
        </div>
    );
}

// 見本用: ダミー API の通信を失敗させたり遅くしたりして、エラー表示・再試行・読み込み中・保存中の表示を確かめる。
// 自分のアプリにするときは、src/api/mock.ts と一緒に削除する。
function MockApiOptions() {
    const [options, setOptions] = useState<MockOptions>(getMockOptions);
    const update = (next: MockOptions) => {
        setMockOptions(next);
        setOptions(next);
    };
    return (
        <Card as="section">
            <CardHeader
                title="動作の確認（見本用）"
                description="通信の失敗や遅延を起こして、エラーの表示や再読み込み、読み込み中の表示を確かめられます。ブラウザのタブを閉じると元に戻ります。"
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
                            label="通信を遅くする（3 秒）"
                            checked={options.slow}
                            onChange={(slow) => update({ ...options, slow })}
                        />
                    </li>
                </ul>
            </CardBody>
        </Card>
    );
}

/* ───────────── 画面例 ───────────── */

// テンプレートのプレビュー用。ログイン・404・500 の画面はナビゲーションに出ないため、ここから開けるようにしている。
// 自分のアプリにするときは、このカードごと削除してよい（不要なら削除）。
function ScreenExamples() {
    return (
        <Card as="section">
            <CardHeader title="画面例" description="ナビゲーションに出ない、テンプレートに含まれる画面です。" />
            <CardBody>
                <ul className="m-0 flex list-disc flex-col gap-2 pl-6 text-std-16N-170">
                    <li>
                        <Link to="/login">ログイン画面</Link>
                    </li>
                    <li>
                        <Link to="/example/not-found">404 画面（ページが見つかりません）</Link>
                    </li>
                    <li>
                        <Link to="/error/500">500 画面（システムエラー）</Link>
                    </li>
                </ul>
            </CardBody>
        </Card>
    );
}
