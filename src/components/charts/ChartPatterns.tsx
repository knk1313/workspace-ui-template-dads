import { useId } from "react";
import { CHART_COLORS, patternId, seriesStyle, toSafeId, type DotShape, type PatternKind } from "./chartUtils";

// 塗りの模様（<pattern>）と、凡例用の小さな記号。
// 色だけに依存しない識別手段として、棒・面の 2 系列目以降に斜線・ドットなどを重ねる（ガイドブック「色以外の識別手段」）。
// 模様の線は面（surface）色で描き、下地に系列色を敷く。

const CELL = 8; // 模様 1 周期の大きさ（px）
const LINE = 1.5; // 模様の線の太さ（px）

/** 1 つの <pattern>。id は useId 由来の接頭辞 + 系列番号で一意にする。 */
export function ChartPattern({ id, kind, color }: { id: string; kind: PatternKind; color: string }) {
    const fg = CHART_COLORS.surface;
    return (
        <pattern id={id} width={CELL} height={CELL} patternUnits="userSpaceOnUse">
            <rect width={CELL} height={CELL} fill={color} />
            {kind === "diagonal" && <path d={`M0 ${CELL}L${CELL} 0M-2 2L2 -2M${CELL - 2} ${CELL + 2}L${CELL + 2} ${CELL - 2}`} stroke={fg} strokeWidth={LINE} />}
            {kind === "dots" && <circle cx={CELL / 2} cy={CELL / 2} r={LINE} fill={fg} />}
            {kind === "crosshatch" && (
                <path d={`M0 0L${CELL} ${CELL}M0 ${CELL}L${CELL} 0`} stroke={fg} strokeWidth={LINE * 0.8} />
            )}
            {kind === "horizontal" && <path d={`M0 ${CELL / 2}H${CELL}`} stroke={fg} strokeWidth={LINE} />}
        </pattern>
    );
}

export type ChartPatternsProps = {
    /** useId を toSafeId で整えた接頭辞。 */
    idPrefix: string;
    /** 系列数。この数だけ pattern を定義する。 */
    count: number;
    /** 系列色の配列（既定は SERIES_COLORS）。 */
    palette?: readonly string[];
};

/** グラフの SVG 内に置く <defs>。系列 2 以降の模様を定義する。 */
export function ChartPatterns({ idPrefix, count, palette }: ChartPatternsProps) {
    return (
        <defs>
            {Array.from({ length: count }, (_, i) => {
                const style = seriesStyle(i, palette);
                if (style.pattern === "solid") return null;
                return <ChartPattern key={i} id={patternId(idPrefix, i)} kind={style.pattern} color={style.color} />;
            })}
        </defs>
    );
}

/** データ点の形を SVG path で描く（中心 0,0、半径 r）。recharts の Symbols と同じ形を凡例にも使うためここで定義する。 */
export function shapePath(shape: DotShape, r: number): string {
    switch (shape) {
        case "square":
            return `M${-r} ${-r}h${r * 2}v${r * 2}h${-r * 2}Z`;
        case "triangle":
            return `M0 ${-r * 1.15}L${r * 1.15} ${r * 0.9}H${-r * 1.15}Z`;
        case "diamond":
            return `M0 ${-r * 1.3}L${r * 1.3} 0L0 ${r * 1.3}L${-r * 1.3} 0Z`;
        case "cross": {
            const w = r * 0.45;
            return `M${-w} ${-r}h${w * 2}v${r - w}h${r - w}v${w * 2}h${-(r - w)}v${r - w}h${-w * 2}v${-(r - w)}h${-(r - w)}v${-w * 2}h${r - w}Z`;
        }
        case "circle":
        default:
            return `M${-r} 0a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
    }
}

export type SeriesSymbolProps = {
    kind: "line" | "fill";
    color: string;
    shape?: DotShape;
    dash?: string;
    pattern?: PatternKind;
    /** 模様を使うか（グラフ側の patterns オプションと揃える）。 */
    patterns?: boolean;
    className?: string;
};

/**
 * 凡例の記号。line は線種 + データ点の形、fill は四角（模様付き）。
 * 装飾なので aria-hidden（系列名はテキストで隣に出す）。
 */
export function SeriesSymbol({ kind, color, shape, dash, pattern = "solid", patterns = true, className }: SeriesSymbolProps) {
    // 凡例は複数のグラフと同じページに並ぶので、pattern の id は記号ごとに useId で一意にする。
    const id = `legend-${toSafeId(useId())}`;
    if (kind === "line") {
        return (
            <svg className={className} width="28" height="16" viewBox="0 0 28 16" aria-hidden="true" focusable="false">
                <path d="M1 8H27" stroke={color} strokeWidth={2} strokeDasharray={dash} fill="none" />
                {/* データ点を描かない系列（showDots=false）や目標線は、線種だけで示す */}
                {shape && <path d={shapePath(shape, 4)} transform="translate(14 8)" fill={color} />}
            </svg>
        );
    }
    const usePattern = patterns && pattern !== "solid";
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            {usePattern && (
                <defs>
                    <ChartPattern id={id} kind={pattern} color={color} />
                </defs>
            )}
            <rect x="0.5" y="0.5" width="15" height="15" fill={usePattern ? `url(#${id})` : color} stroke={color} />
        </svg>
    );
}
