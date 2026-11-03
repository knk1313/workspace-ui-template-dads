import { cloneElement, useEffect, useId, useRef, useState, type ReactElement } from "react";
import { cn } from "@/lib/cn";

// ツールチップ（WAI-ARIA APG の Tooltip パターン。docs/decisions.md D-11）。
// アイコンだけのボタンの補足など、短い文字列をホバー / フォーカスで表示する。
//   - 子要素（フォーカス可能な 1 つの要素）に aria-describedby を付け、テキストは常に支援技術へ渡す（タッチ端末でも読める）
//   - hover / focus で短い遅延の後に表示、離れたら消す。Esc で消す
//   - 見た目は solid-gray-900 の面に白文字（14px は補足用途として許容）
// ツールチップにしか書かれていない情報が操作に必須にならないようにする（ラベルや aria-label を先に用意する）。

type ChildProps = {
    "aria-describedby"?: string;
};

export type TooltipProps = {
    content: string;
    /** フォーカス可能な要素 1 つ（Button など）。 */
    children: ReactElement<ChildProps>;
    /** 表示までの遅延（ミリ秒）。 */
    delay?: number;
    placement?: "top" | "bottom";
    className?: string;
};

export function Tooltip({ content, children, delay = 150, placement = "top", className }: TooltipProps) {
    const id = useId();
    const [visible, setVisible] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function show() {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setVisible(true), delay);
    }

    function hide() {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        setVisible(false);
    }

    useEffect(() => {
        if (!visible) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setVisible(false);
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [visible]);

    useEffect(() => () => {
        if (timer.current) clearTimeout(timer.current);
    }, []);

    // 子要素には aria-describedby だけを付け、hover / focus はラッパーで受ける（ラッパーは子要素と同じ大きさ）。
    const child = cloneElement(children, {
        "aria-describedby": [children.props["aria-describedby"], id].filter(Boolean).join(" "),
    });

    return (
        <span className={cn("relative inline-flex", className)} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
            {child}
            {/* 非表示のときも DOM に残し（sr-only）、aria-describedby で常に参照できるようにする。 */}
            <span
                id={id}
                role="tooltip"
                className={cn(
                    visible
                        ? cn(
                              "pointer-events-none absolute left-1/2 z-30 w-max max-w-xs -translate-x-1/2 rounded-4 bg-text-strong px-2 py-1 text-14 leading-130 tracking-0 text-text-inverse",
                              placement === "top" ? "bottom-full mb-1" : "top-full mt-1",
                          )
                        : "sr-only",
                )}
            >
                {content}
            </span>
        </span>
    );
}
