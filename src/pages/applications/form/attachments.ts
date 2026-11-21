// 既存の添付ファイルを、編集画面のフォームで扱う形にする。
// API が返す添付ファイルは名前とサイズだけなので、FileUpload に渡せる File（中身は空）に置き換える。
// 実際の API で中身を差し替えられるようにするときは、ここを「既存のファイルを残す／消す」の操作に作り替える。

import type { Application } from "@/api/applicationTypes";

function fileTypeOf(name: string): string | null {
    if (/\.pdf$/i.test(name)) return "application/pdf";
    if (/\.png$/i.test(name)) return "image/png";
    if (/\.jpe?g$/i.test(name)) return "image/jpeg";
    return null;
}

/**
 * 既存の添付ファイル（API が返す名前とサイズ）を、FileUpload で扱える File にする（中身は空の、同じ大きさのもの）。
 * フォームで受け付ける PDF・画像だけを引き継ぐ。それ以外（Excel など、旧様式で受け付けた想定のもの）は
 * keptAttachments で別に持ち、更新するときにそのまま送り返す（編集画面で扱わないだけで、消さない）。
 */
export function toFormFiles(attachments: Application["attachments"]): File[] {
    return attachments.flatMap((a) => {
        const type = fileTypeOf(a.name);
        return type ? [new File([new Uint8Array(a.size)], a.name, { type, lastModified: 0 })] : [];
    });
}

/** 編集画面では変えられない（フォームで受け付けない形式の）添付ファイル。更新しても残す。 */
export function keptAttachments(attachments: Application["attachments"]): Application["attachments"] {
    return attachments.filter((a) => fileTypeOf(a.name) === null);
}
