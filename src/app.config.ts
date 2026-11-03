// アプリ全体の設定。テンプレートを自分のアプリにするときは、まずこのファイルを書き換える。
// index.html の <title> と description も、ビルド時にここの値で置き換える（vite.config.ts）。
// ナビゲーションに出す画面の URL はここで定義し、各 URL の画面は src/routes.tsx で対応付ける。
import { FilePlus2, FileText, Landmark, LayoutDashboard, Settings, type LucideIcon } from "lucide-react";

export type NavChild = { readonly label: string; readonly href: string; readonly end?: boolean };
export type NavItem = {
    readonly label: string;
    readonly href: string;
    readonly icon: LucideIcon;
    readonly end?: boolean;
    readonly children?: readonly NavChild[];
};
export type NavSection = { readonly title?: string; readonly items: readonly NavItem[] };

const navigation = [
    {
        items: [{ label: "ダッシュボード", href: "/", icon: LayoutDashboard, end: true }],
    },
    {
        title: "申請",
        items: [
            { label: "申請一覧", href: "/applications", icon: FileText, end: true },
            { label: "新規申請", href: "/applications/new", icon: FilePlus2, end: true },
        ],
    },
    {
        title: "管理",
        items: [{ label: "設定", href: "/settings", icon: Settings, end: true }],
    },
] as const satisfies readonly NavSection[];

export const appConfig = {
    /** ヘッダーとブラウザタイトルに表示するアプリ名。 */
    name: "申請管理システム",
    /** index.html の meta description。 */
    description: "デジタル庁デザインシステム（DADS）に準拠した管理画面のテンプレート",
    /** ヘッダーのアプリ名の左に置くアイコン。 */
    logo: Landmark as LucideIcon,
    /** サイドバー（または上部ナビ）のナビゲーション。 */
    navigation: navigation as readonly NavSection[],
    /** 日付表示の既定値。利用者は設定画面で変更できる。 */
    display: {
        locale: "ja-JP",
        timeZone: "Asia/Tokyo",
    },
};
