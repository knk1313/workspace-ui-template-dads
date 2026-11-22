import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { appConfig } from "@/app.config";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Link } from "@/components/ui/Link";
import { NotificationBanner } from "@/components/ui/NotificationBanner";
import { useToast } from "@/components/ui/Toast";
import { authQueries, login } from "@/api/auth";
import { setQueryData, useMutation } from "@/api/query";
import type { LoginState } from "@/layouts/AppLayout";
import { usePageTitle } from "@/hooks/usePageTitle";

// ログイン画面（シェルなし）。アプリケーションシェルの外にあるため、自前で <main id="main"> を持つ。
// 認証は src/api/auth.ts の login を通す（見本では fail@example.jp のときだけ失敗として扱う）。
// 実際のアプリでは、login の中身を認証の API の呼び出しに置き換える。

type LoginErrors = { email?: string; password?: string };

export default function LoginPage() {
    usePageTitle("ログイン");
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState<LoginErrors>({});
    const [authFailed, setAuthFailed] = useState(false);
    const signIn = useMutation(login);
    const loading = signIn.pending;
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLHeadingElement>(null);

    // 認証失敗のバナーが出たら、そこへフォーカスを移して読み上げさせる。
    useEffect(() => {
        if (authFailed) bannerRef.current?.focus();
    }, [authFailed]);

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;
        const next: LoginErrors = {};
        if (!email.trim()) next.email = "メールアドレスを入力してください";
        if (!password) next.password = "パスワードを入力してください";
        setErrors(next);
        setAuthFailed(false);
        if (next.email) return emailRef.current?.focus();
        if (next.password) return passwordRef.current?.focus();

        try {
            const user = await signIn.run({ email: email.trim(), password, remember });
            if (!user) {
                setAuthFailed(true);
                return;
            }
            setQueryData(authQueries.me, () => user);
            toast({ type: "success", title: "ログインしました" });
            // ログインを求められた画面へ戻る（「戻る」でログイン画面に入り直さないよう置き換える）
            navigate((location.state as LoginState)?.from ?? "/", { replace: true });
        } catch (err) {
            // 通信の失敗は、入力の誤りと区別して知らせる（入力はそのまま残す）
            toast({ type: "error", title: "ログインできませんでした", description: (err as Error).message });
        }
    };

    return (
        <div className="flex min-h-dvh flex-col bg-canvas text-text">
            <main id="main" className="flex flex-1 items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardBody className="flex flex-col gap-6 md:px-10 md:py-10">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <p className="m-0 flex items-center gap-2 text-std-18B-160 text-text-strong">
                                <Icon icon={appConfig.logo} size="lg" className="text-primary" />
                                {appConfig.name}
                            </p>
                            <h1 className="m-0 text-std-28B-150 text-text-strong">ログイン</h1>
                            {/* 見本用。自分のアプリにするときは消す */}
                            <p className="m-0 text-std-16N-170 text-text-muted">見本のため、どのメールアドレスとパスワードでもログインできます</p>
                        </div>

                        {authFailed && (
                            <NotificationBanner
                                type="error"
                                headingRef={bannerRef}
                                title="メールアドレスかパスワードが違います"
                                description="入力した内容を確かめて、もう一度ログインしてください"
                            />
                        )}

                        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
                            <FormField label="メールアドレス" errorText={errors.email}>
                                <Input
                                    ref={emailRef}
                                    type="email"
                                    name="email"
                                    autoComplete="username"
                                    inputMode="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </FormField>
                            <div className="flex flex-col gap-1">
                                <FormField label="パスワード" errorText={errors.password}>
                                    <Input
                                        ref={passwordRef}
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </FormField>
                                <Checkbox checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)}>
                                    パスワードを表示
                                </Checkbox>
                            </div>
                            <Checkbox name="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)}>
                                ログイン状態を保持する
                            </Checkbox>
                            <Button type="submit" size="lg" block loading={loading}>
                                ログイン
                            </Button>
                        </form>

                        {/* パスワード再設定の画面はテンプレートに含めていない（開くと 404）。実際の URL に差し替える。 */}
                        <p className="m-0 text-center text-std-16N-170">
                            <Link to="/password-reset">パスワードを忘れた場合</Link>
                        </p>
                    </CardBody>
                </Card>
            </main>
            {/* 利用規約・お問い合わせもテンプレートでは 404 になる。実際の URL に差し替える。 */}
            <footer className="px-4 pb-8">
                <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-6 gap-y-2 p-0 text-std-16N-170">
                    <li>
                        <Link to="/terms">利用規約</Link>
                    </li>
                    <li>
                        <Link to="/contact">お問い合わせ</Link>
                    </li>
                </ul>
            </footer>
        </div>
    );
}
