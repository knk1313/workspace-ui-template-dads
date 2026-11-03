import { useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// アバター。利用者や担当者を示す画像、または名前のイニシャル。
// role="img" + aria-label に名前を持たせ、画像は alt="" にして名前が二重に読まれないようにする。
// 画像の読み込みに失敗したときはイニシャルに戻す。

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "square";

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    /** 名前。代替テキストとイニシャルに使う。 */
    name: string;
    src?: string;
    size?: AvatarSize;
    shape?: AvatarShape;
};

const SIZES: Record<AvatarSize, string> = {
    sm: "size-8 text-14", // 32px
    md: "size-10 text-16", // 40px
    lg: "size-12 text-18", // 48px
};

const SHAPES: Record<AvatarShape, string> = {
    circle: "rounded-full",
    square: "rounded-8",
};

/** 名前からイニシャルを作る。「山田 太郎」（半角または全角スペース区切り）→「山太」、「Taro Yamada」→「TY」、「山田」→「山」、「Taro」→「TA」。 */
export function getInitials(name: string): string {
    const tokens = name.trim().split(/[\s\u3000]+/).filter(Boolean);
    if (tokens.length === 0) return "";
    const chars = Array.from(tokens[0]);
    // 漢字・かななど全角文字の氏名は姓の 1 文字目だけにする（「佐藤 花子」→「佐」。「佐花」は読みにくい）。
    const isWideName = (chars[0]?.codePointAt(0) ?? 0) > 0x2e7f;
    if (isWideName) return chars[0];
    if (tokens.length >= 2) return (chars[0] + Array.from(tokens[1])[0]).toUpperCase();
    // 漢字・かななど全角文字は 1 文字で十分読める。ラテン文字は 2 文字取る。
    const isWide = (chars[0]?.codePointAt(0) ?? 0) > 0x2e7f;
    return (isWide ? chars.slice(0, 1) : chars.slice(0, 2)).join("").toUpperCase();
}

export function Avatar({ name, src, size = "md", shape = "circle", className, ...props }: AvatarProps) {
    const [failed, setFailed] = useState(false);
    const showImage = Boolean(src) && !failed;
    return (
        <span
            role="img"
            aria-label={name}
            className={cn(
                "inline-flex shrink-0 items-center justify-center overflow-hidden bg-primary-surface font-bold leading-none tracking-0 text-primary select-none",
                SIZES[size],
                SHAPES[shape],
                className,
            )}
            {...props}
        >
            {showImage ? <img src={src} alt="" className="size-full object-cover" onError={() => setFailed(true)} /> : <span aria-hidden="true">{getInitials(name)}</span>}
        </span>
    );
}

export type AvatarGroupItem = { name: string; src?: string };

export type AvatarGroupProps = Omit<HTMLAttributes<HTMLUListElement>, "children"> & {
    items: AvatarGroupItem[];
    /** 表示する最大数。超えた分は「+n」で示す。 */
    max?: number;
    size?: AvatarSize;
    /** リストの名前（例: "担当者"）。 */
    label?: string;
};

/** 複数のアバターを重ねて表示する。各アバターはリスト項目として名前が読める。 */
export function AvatarGroup({ items, max = 3, size = "md", label = "メンバー", className, ...props }: AvatarGroupProps) {
    const visible = items.slice(0, max);
    const rest = items.length - visible.length;
    return (
        <ul aria-label={label} className={cn("m-0 flex list-none items-center p-0 -space-x-2", className)} {...props}>
            {visible.map((item) => (
                <li key={item.name} className="flex">
                    <Avatar name={item.name} src={item.src} size={size} className="ring-2 ring-surface" />
                </li>
            ))}
            {rest > 0 && (
                <li className="flex">
                    <span
                        className={cn(
                            "inline-flex shrink-0 items-center justify-center rounded-full bg-surface-strong font-bold leading-none text-text ring-2 ring-surface nums",
                            SIZES[size],
                        )}
                    >
                        <span aria-hidden="true">+{rest}</span>
                        <span className="sr-only">他{rest}人</span>
                    </span>
                </li>
            )}
        </ul>
    );
}
