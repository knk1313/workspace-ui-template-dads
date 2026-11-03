import { useEffect, useId, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { useFormField, type FieldSize } from "./FormField";
import { Icon } from "./Icon";
import { CONTROL_HEIGHT, Input } from "./Input";

// DADS 日付ピッカー／カレンダー（HTML 版 date-picker.css / calendar.css）。
// 直接入力（YYYY-MM-DD、inputMode="numeric"）を主とし、カレンダーは補助として「カレンダーを開く」ボタンからだけ開く
// （フォーカスやホバーで開かない。生年月日のような既知の日付ではカレンダーボタンを置かない: showCalendar={false}）。
// 入力内容は blur 時に正規化する（全角数字 → 半角、区切り「/」「.」→「-」、ゼロ埋め）。
// サポートテキストで「西暦」と入力例を案内する（FormField の supportText に書く）。
// カレンダーは APG「Date Picker Dialog」に従う: role="dialog" の中に role="grid"（曜日 columnheader、日 gridcell）。
// 矢印キーで日、PageUp / PageDown で月（Shift で年）、Home / End で週の端、Enter / Space で選択、Esc で閉じて入力欄に戻る。

export type DatePickerProps = {
    /** "YYYY-MM-DD" または ""（未入力）。 */
    value: string;
    onChange: (value: string) => void;
    /** 選択できる最小の日付（"YYYY-MM-DD"）。 */
    min?: string;
    /** 選択できる最大の日付（"YYYY-MM-DD"）。 */
    max?: string;
    size?: FieldSize;
    invalid?: boolean;
    /** カレンダーボタンを表示する。既知の日付（生年月日など）の入力では false にする。 */
    showCalendar?: boolean;
    name?: string;
    id?: string;
    autoComplete?: string;
    className?: string;
    ref?: Ref<HTMLInputElement>;
};

type Ymd = { y: number; m: number; d: number };

const WEEKDAYS = [
    { short: "日", long: "日曜日" },
    { short: "月", long: "月曜日" },
    { short: "火", long: "火曜日" },
    { short: "水", long: "水曜日" },
    { short: "木", long: "木曜日" },
    { short: "金", long: "金曜日" },
    { short: "土", long: "土曜日" },
];

const pad = (n: number, len: number) => String(n).padStart(len, "0");

export function toIso({ y, m, d }: Ymd): string {
    return `${pad(y, 4)}-${pad(m, 2)}-${pad(d, 2)}`;
}

/** "YYYY-MM-DD" を厳密に解釈する。存在しない日付（2 月 30 日など）は undefined。 */
export function parseIso(text: string): Ymd | undefined {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!m) return undefined;
    const ymd = { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
    const date = new Date(ymd.y, ymd.m - 1, ymd.d);
    if (date.getFullYear() !== ymd.y || date.getMonth() !== ymd.m - 1 || date.getDate() !== ymd.d) return undefined;
    return ymd;
}

/** 利用者の入力をゆるく解釈して ISO 形式に正規化する。解釈できなければ undefined。 */
export function normalizeDateText(text: string): string | undefined {
    // 全角の数字と区切り（／ － ．）を半角に寄せてから解釈する
    const half = text
        .replace(/[０-９／－．]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
        .trim();
    const m = /^(\d{4})[-/.年]\s*(\d{1,2})[-/.月]\s*(\d{1,2})日?$/.exec(half) ?? /^(\d{4})(\d{2})(\d{2})$/.exec(half);
    if (!m) return undefined;
    const iso = toIso({ y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) });
    return parseIso(iso) ? iso : undefined;
}

function fromDate(date: Date): Ymd {
    return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() };
}

function addDays(ymd: Ymd, days: number): Ymd {
    return fromDate(new Date(ymd.y, ymd.m - 1, ymd.d + days));
}

function addMonths(ymd: Ymd, months: number): Ymd {
    // 月末の日付が次の月に存在しないときはその月の末日に寄せる（1/31 + 1 か月 = 2/28）
    const first = new Date(ymd.y, ymd.m - 1 + months, 1);
    const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return { y: first.getFullYear(), m: first.getMonth() + 1, d: Math.min(ymd.d, lastDay) };
}

function compare(a: Ymd, b: Ymd): number {
    return toIso(a).localeCompare(toIso(b));
}

function sameYmd(a: Ymd, b: Ymd): boolean {
    return a.y === b.y && a.m === b.m && a.d === b.d;
}

/** 月表の行列（日曜始まり、先頭・末尾の空きは null）。 */
function monthGrid(y: number, m: number): (Ymd | null)[][] {
    const firstWeekday = new Date(y, m - 1, 1).getDay();
    const days = new Date(y, m, 0).getDate();
    const cells: (Ymd | null)[] = [...Array<null>(firstWeekday).fill(null), ...Array.from({ length: days }, (_, i) => ({ y, m, d: i + 1 }))];
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (Ymd | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
}

const NAV_BUTTON =
    "flex size-11 shrink-0 items-center justify-center rounded-6 border border-current bg-surface text-primary hover:bg-primary-outline-hover hover:text-primary-hover active:bg-primary-outline-active focus-visible:focus-ring";

export function DatePicker({
    value,
    onChange,
    min,
    max,
    size,
    invalid,
    showCalendar = true,
    name,
    id,
    autoComplete,
    className,
    ref,
}: DatePickerProps) {
    const field = useFormField();
    const autoId = useId();
    const inputId = id ?? (field && !field.group ? field.id : autoId);
    const dialogId = `${inputId}-calendar`;
    const monthLabelId = `${dialogId}-month`;
    const dayId = (ymd: Ymd) => `${dialogId}-${toIso(ymd)}`;

    // 入力欄の文字列は value と別に持つ（入力途中の不完全な文字列を保持するため）。value が外から変わったら追従する。
    const [text, setText] = useState(value);
    const [syncedValue, setSyncedValue] = useState(value);
    if (value !== syncedValue) {
        setSyncedValue(value);
        setText(value);
    }

    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState<Ymd>(() => parseIso(value) ?? fromDate(new Date()));
    const [view, setView] = useState<{ y: number; m: number }>(() => ({ y: focused.y, m: focused.m }));
    const pendingFocus = useRef(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const today = fromDate(new Date());
    const selected = parseIso(value);
    const minYmd = min ? parseIso(min) : undefined;
    const maxYmd = max ? parseIso(max) : undefined;
    const isOutOfRange = (ymd: Ymd) => (minYmd ? compare(ymd, minYmd) < 0 : false) || (maxYmd ? compare(ymd, maxYmd) > 0 : false);

    const moveFocus = (next: Ymd) => {
        setFocused(next);
        setView({ y: next.y, m: next.m });
        pendingFocus.current = true;
    };

    const openCalendar = () => {
        // 入力済みの日付があればその月を、なければ今日を含む月を表示する（DADS）
        const start = parseIso(value) ?? today;
        moveFocus(start);
        setOpen(true);
    };

    const closeCalendar = (focusTarget: "input" | "button" | "none") => {
        setOpen(false);
        if (focusTarget === "input") inputRef.current?.focus();
        if (focusTarget === "button") buttonRef.current?.focus();
    };

    // 開いたとき・キー操作で日を移動したときに、その日のボタンへフォーカスを移す
    useEffect(() => {
        if (open && pendingFocus.current) {
            pendingFocus.current = false;
            document.getElementById(dayId(focused))?.focus();
        }
    });

    // 外側クリックで閉じる
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    const commitText = () => {
        if (text.trim() === "") {
            if (value !== "") onChange("");
            return;
        }
        const iso = normalizeDateText(text);
        if (iso) {
            setText(iso);
            if (iso !== value) onChange(iso);
        }
        // 解釈できない文字列はそのまま残し、エラー表示は FormField の errorText に任せる
    };

    const select = (ymd: Ymd) => {
        if (isOutOfRange(ymd)) return;
        onChange(toIso(ymd));
        setText(toIso(ymd));
        closeCalendar("input");
    };

    const onGridKeyDown = (e: KeyboardEvent<HTMLElement>, ymd: Ymd) => {
        let next: Ymd | undefined;
        switch (e.key) {
            case "ArrowRight":
                next = addDays(ymd, 1);
                break;
            case "ArrowLeft":
                next = addDays(ymd, -1);
                break;
            case "ArrowDown":
                next = addDays(ymd, 7);
                break;
            case "ArrowUp":
                next = addDays(ymd, -7);
                break;
            case "PageDown":
                next = e.shiftKey ? addMonths(ymd, 12) : addMonths(ymd, 1);
                break;
            case "PageUp":
                next = e.shiftKey ? addMonths(ymd, -12) : addMonths(ymd, -1);
                break;
            case "Home":
                next = addDays(ymd, -new Date(ymd.y, ymd.m - 1, ymd.d).getDay());
                break;
            case "End":
                next = addDays(ymd, 6 - new Date(ymd.y, ymd.m - 1, ymd.d).getDay());
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                select(ymd);
                return;
            default:
                return;
        }
        e.preventDefault();
        moveFocus(next);
    };

    const onDialogKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            closeCalendar("input");
        }
    };

    const rows = monthGrid(view.y, view.m);
    const focusedInView = focused.y === view.y && focused.m === view.m ? focused : { y: view.y, m: view.m, d: 1 };

    return (
        <div ref={rootRef} className={cn("relative flex w-fit max-w-full items-end gap-4", className)}>
            <Input
                ref={(el) => {
                    inputRef.current = el;
                    if (typeof ref === "function") ref(el);
                    else if (ref) ref.current = el;
                }}
                id={inputId}
                size={size}
                invalid={invalid}
                block={false}
                inputMode="numeric"
                autoComplete={autoComplete}
                name={name}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={commitText}
                onKeyDown={(e) => {
                    if (e.key === "Enter") commitText();
                }}
                className="w-44 nums"
            />
            {showCalendar && (
                <button
                    ref={buttonRef}
                    type="button"
                    aria-label="カレンダーを開く"
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    aria-controls={open ? dialogId : undefined}
                    onClick={() => (open ? closeCalendar("button") : openCalendar())}
                    className={cn(NAV_BUTTON, CONTROL_HEIGHT[size ?? field?.size ?? "md"])}
                >
                    <Icon icon={CalendarIcon} size="lg" />
                </button>
            )}
            {open && (
                <div
                    id={dialogId}
                    role="dialog"
                    aria-modal="false"
                    aria-label="カレンダー"
                    onKeyDown={onDialogKeyDown}
                    onBlur={(e) => {
                        // Tab でダイアログの外に出たら閉じる（非モーダルのため）
                        if (e.relatedTarget && rootRef.current && !rootRef.current.contains(e.relatedTarget as Node)) setOpen(false);
                    }}
                    className="absolute left-0 top-full z-10 mt-1 flex w-max flex-col rounded-8 border border-border bg-surface text-16 leading-none tracking-2 text-text shadow-1"
                >
                    <div className="flex items-center justify-between gap-2 p-4">
                        <button type="button" aria-label="前の月" onClick={() => setView(({ y, m }) => addMonths({ y, m, d: 1 }, -1))} className={NAV_BUTTON}>
                            <Icon icon={ChevronLeft} size="md" />
                        </button>
                        <p id={monthLabelId} aria-live="polite" className="m-0 font-bold">
                            {view.y}年{view.m}月
                        </p>
                        <button type="button" aria-label="次の月" onClick={() => setView(({ y, m }) => addMonths({ y, m, d: 1 }, 1))} className={NAV_BUTTON}>
                            <Icon icon={ChevronRight} size="md" />
                        </button>
                    </div>
                    <table role="grid" aria-labelledby={monthLabelId} className="mx-3 mb-2 border-collapse">
                        <thead>
                            <tr>
                                {WEEKDAYS.map((w) => (
                                    <th key={w.short} role="columnheader" scope="col" abbr={w.long} className="size-12 p-0 text-center align-middle font-bold text-solid-gray-700">
                                        <span aria-hidden="true">{w.short}</span>
                                        <span className="sr-only">{w.long}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, ri) => (
                                <tr key={ri}>
                                    {row.map((ymd, ci) => {
                                        if (!ymd) return <td key={ci} role="gridcell" className="p-0" />;
                                        const isSelected = selected ? sameYmd(ymd, selected) : false;
                                        const isToday = sameYmd(ymd, today);
                                        const disabled = isOutOfRange(ymd);
                                        return (
                                            <td key={ci} role="gridcell" aria-selected={isSelected} className="p-0">
                                                <button
                                                    type="button"
                                                    id={dayId(ymd)}
                                                    tabIndex={sameYmd(ymd, focusedInView) ? 0 : -1}
                                                    aria-label={`${ymd.y}年${ymd.m}月${ymd.d}日`}
                                                    aria-current={isToday ? "date" : undefined}
                                                    aria-disabled={disabled || undefined}
                                                    onClick={() => select(ymd)}
                                                    onKeyDown={(e) => onGridKeyDown(e, ymd)}
                                                    className={cn(
                                                        "m-1 flex size-10 items-center justify-center rounded-full border border-transparent text-16 leading-none underline-offset-3 nums focus-visible:focus-ring-fill",
                                                        isSelected
                                                            ? "bg-primary text-text-on-primary"
                                                            : "bg-transparent hover:border-border-emphasis hover:bg-surface-muted hover:underline active:bg-surface-strong",
                                                        isToday && !isSelected && "font-bold underline",
                                                        disabled && "text-text-disabled hover:border-transparent hover:bg-transparent hover:no-underline",
                                                    )}
                                                >
                                                    {ymd.d}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex items-center justify-between gap-4 p-4">
                        <Button variant="text" size="sm" onClick={() => moveFocus(today)}>
                            今日
                        </Button>
                        <Button variant="text" size="sm" onClick={() => closeCalendar("button")}>
                            閉じる
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
