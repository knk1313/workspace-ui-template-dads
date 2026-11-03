import { useId, useState, type ChangeEvent, type DragEvent, type Ref } from "react";
import { cn } from "@/lib/cn";
import { Button, buttonClassName } from "./Button";
import { useFormField } from "./FormField";

// DADS ファイルアップロード／ドロップエリア（HTML 版 file-upload.css）。
// ネイティブの <input type="file"> を視覚的に隠し（sr-only。Tab では到達できる）、<label> を「ファイルを選択」ボタンの見た目にする。
// ドロップエリアは補助で、ファイル選択ボタンを必ず置く（WCAG 2.5.7 ドラッグ動作）。
// 選択ファイルは一覧（名前・サイズ・削除ボタン）に表示し、未選択時は「ファイルが選択されていません」を必ず表示する。
// エラー（形式・サイズなど）の判定とエラーテキストは利用側で行い、FormField の errorText で示す。

export type FileUploadProps = {
    files: File[];
    onChange: (files: File[]) => void;
    /** 受け付ける形式（input の accept と同じ書式）。サポートテキストにも必ず書く。 */
    accept?: string;
    multiple?: boolean;
    /** ドロップエリアを表示する。狭い場所ではボタンだけにできる。 */
    dropArea?: boolean;
    /** ファイル選択ボタンのラベル。 */
    buttonLabel?: string;
    invalid?: boolean;
    name?: string;
    id?: string;
    className?: string;
    ref?: Ref<HTMLInputElement>;
};

/** 1 024 進みのサイズ表記（例: 1.2 MB）。 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const units = ["KB", "MB", "GB"];
    let value = bytes / 1024;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit += 1;
    }
    return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

export function FileUpload({ files, onChange, accept, multiple = false, dropArea = true, buttonLabel = "ファイルを選択", invalid, name, id, className, ref }: FileUploadProps) {
    const field = useFormField();
    const autoId = useId();
    const inputId = id ?? (field && !field.group ? field.id : autoId);
    const isInvalid = invalid ?? field?.invalid ?? false;
    const [dragOver, setDragOver] = useState(false);

    const addFiles = (incoming: File[]) => {
        if (incoming.length === 0) return;
        if (!multiple) {
            onChange([incoming[0]]);
            return;
        }
        // 同じ名前・サイズ・更新日時のファイルは重複として除く
        const merged = [...files];
        for (const f of incoming) {
            if (!merged.some((m) => m.name === f.name && m.size === f.size && m.lastModified === f.lastModified)) merged.push(f);
        }
        onChange(merged);
    };

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        addFiles(Array.from(e.target.files ?? []));
        // 同じファイルをもう一度選んでも change が発火するように値を消す
        e.target.value = "";
    };

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(Array.from(e.dataTransfer.files));
    };

    const remove = (index: number) => onChange(files.filter((_, i) => i !== index));

    const control = (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <input
                ref={ref}
                id={inputId}
                type="file"
                name={name}
                accept={accept}
                multiple={multiple}
                aria-describedby={field?.describedBy}
                aria-invalid={isInvalid || undefined}
                aria-required={field?.required ? true : undefined}
                onChange={onInputChange}
                className="peer sr-only"
            />
            {/* input にフォーカスが当たったらこのラベルにフォーカスリングを出す */}
            <label htmlFor={inputId} className={cn(buttonClassName({ variant: "outline", size: "md" }), "cursor-pointer peer-focus-visible:focus-ring", isInvalid && "border-error")}>
                {buttonLabel}
            </label>
            {dropArea && <p className="m-0 min-w-48 flex-1 text-16 leading-170 tracking-2 text-text">または、このエリア内にドラッグ＆ドロップ</p>}
        </div>
    );

    return (
        <div className={cn("flex flex-col gap-4 text-16 leading-170 tracking-2 text-text break-words", className)}>
            {dropArea ? (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (!dragOver) setDragOver(true);
                    }}
                    onDragLeave={(e) => {
                        // 子要素へ移動したときの dragleave は無視する
                        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragOver(false);
                    }}
                    onDrop={onDrop}
                    className={cn(
                        "rounded-8 border border-dashed p-8",
                        dragOver ? "border-primary bg-primary-surface" : "bg-surface-muted",
                        !dragOver && (isInvalid ? "border-error" : "border-border-on-canvas"),
                    )}
                >
                    {control}
                </div>
            ) : (
                control
            )}
            {files.length === 0 ? (
                <p className="m-0 text-text-muted">ファイルが選択されていません</p>
            ) : (
                <ul aria-label="選択したファイル" className="m-0 flex list-none flex-col gap-1 p-0">
                    {files.map((file, i) => (
                        <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-baseline gap-2">
                            <Button variant="outline" size="xs" aria-label={`${file.name} を削除`} onClick={() => remove(i)} className="min-w-12 shrink-0">
                                削除
                            </Button>
                            <span className="min-w-0 flex-1">
                                <span className="mr-4 font-bold">{file.name}</span>
                                <span className="text-text-muted nums">{formatFileSize(file.size)}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
