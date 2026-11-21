import { useEffect } from "react";
import { appConfig } from "@/app.config";

/**
 * ブラウザーのタブの名前（document.title）を、画面ごとに「画面の名前 | アプリ名」にする。
 * 画面を移ってもタブの名前が変わらないと、スクリーンリーダーやタブの一覧で今いる画面を見分けられないため（WCAG 2.4.2）。
 * 画面の見出し（h1）と同じ文言を渡す。
 */
export function usePageTitle(title: string): void {
    useEffect(() => {
        document.title = title ? `${title} | ${appConfig.name}` : appConfig.name;
    }, [title]);
}
