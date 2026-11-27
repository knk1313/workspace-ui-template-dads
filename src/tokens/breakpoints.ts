// ブレークポイント（JS から使う値）。CSS の値は local.css の --breakpoint-*。
// 2 つは同じ値にする（src/tokens/local.test.ts が一致を検査する）。
// 画面の切り替えを JS で行うとき（useMediaQuery）は、幅を直書きせずにここの値を使う。

export const BREAKPOINTS = {
    sm: "40rem",
    md: "48rem",
    lg: "64rem",
    xl: "80rem",
    "2xl": "96rem",
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** `(min-width: 48rem)` のようなメディアクエリを返す。Tailwind の `md:` と同じ幅から一致する。 */
export function minWidth(bp: Breakpoint): string {
    return `(min-width: ${BREAKPOINTS[bp]})`;
}
