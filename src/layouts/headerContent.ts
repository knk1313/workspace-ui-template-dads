// ヘッダーの検索（コマンドパレット）とお知らせに出す、アプリ固有の内容の入り口。
// 実装は下の export の行の先にある。何も出さない版は ./headerContentEmpty、見本の申請管理の版は src/pages/applications/headerContent.ts。
// 自分のアプリにするときは、export の行の先を書き換えるか、このファイルに直接実装する。
// npm run remove-samples を実行すると、export の行の先が何も出さない版に切り替わる。

export type HeaderNotification = { id: string; title: string; description?: string; href?: string };

export type HeaderNotifications = {
    items: HeaderNotification[];
    isLoading: boolean;
    error: Error | undefined;
};

export { useHeaderNotifications, useHeaderSearchItems } from "@/pages/applications/headerContent";
