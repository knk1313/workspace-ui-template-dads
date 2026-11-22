import { useEffect, useSyncExternalStore } from "react";
import { appConfig } from "@/app.config";

// 画面の名前を、ブラウザーのタブと読み上げに伝える。
// 1 つの HTML の中で画面を切り替えるアプリでは、タブの名前を変えても画面が変わったことは読み上げられないため、
// 画面を移ったときに読み上げ用の領域（src/layouts/PageAnnouncer.tsx）にも書く。最初に開いたときは、ブラウザーがタブの名前を読み上げる。

let opened: string | undefined;
let announcement = "";
const listeners = new Set<() => void>();

function announce(title: string): void {
    const text = `「${title}」の画面を開きました`;
    // 同じ名前の画面に続けて移ったときも変化として伝わるよう、見えない空白の有無を切り替える
    announcement = announcement === text ? `${text}\u00a0` : text;
    for (const listener of listeners) listener();
}

export type PageTitleOptions = {
    /** 名前がまだ決まらない（読み込み中）。タブの名前だけを変え、読み上げない。 */
    pending?: boolean;
    /** false なら読み上げない（見出しへフォーカスを移す画面で、二重に読み上げないため）。 */
    announced?: boolean;
};

/**
 * ブラウザーのタブの名前（document.title）を、画面ごとに「画面の名前 | アプリ名」にし、画面を移ったことを読み上げる。
 * 画面を移ってもタブの名前が変わらないと、スクリーンリーダーやタブの一覧で今いる画面を見分けられないため（WCAG 2.4.2）。
 * 画面の見出し（h1）と同じ文言を渡す。
 */
export function usePageTitle(title: string, { pending = false, announced = true }: PageTitleOptions = {}): void {
    useEffect(() => {
        document.title = title ? `${title} | ${appConfig.name}` : appConfig.name;
        if (pending) return;
        const first = opened === undefined;
        opened = title;
        if (!first && announced) announce(title);
    }, [title, pending, announced]);
}

/** 画面を移ったときに読み上げる文（PageAnnouncer が使う）。 */
export function usePageAnnouncement(): string {
    return useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => announcement,
    );
}

/** 読み上げの状態を初めに戻す（単体テストで、テストごとに状態をそろえるために使う）。 */
export function resetPageAnnouncement(): void {
    opened = undefined;
    announcement = "";
}
