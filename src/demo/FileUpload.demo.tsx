import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { FormField } from "@/components/ui/FormField";
import type { ComponentDemo } from "./types";

const MAX_SIZE = 10 * 1024 * 1024;

function SingleExample() {
    const [files, setFiles] = useState<File[]>([]);
    return (
        <FormField label="本人確認書類" requirement="required" supportText="PDF または画像（JPEG / PNG）、10 MB まで。1 ファイルだけ添付できます">
            <FileUpload files={files} onChange={setFiles} accept=".pdf,image/jpeg,image/png" />
        </FormField>
    );
}

function MultipleExample() {
    const [files, setFiles] = useState<File[]>([]);
    const tooLarge = files.filter((f) => f.size > MAX_SIZE);
    return (
        <FormField
            label="添付資料"
            requirement="optional"
            supportText="PDF、10 MB まで。複数のファイルを添付できます"
            errorText={tooLarge.length > 0 ? `10 MB を超えるファイルがあります: ${tooLarge.map((f) => f.name).join("、")}` : undefined}
        >
            <FileUpload files={files} onChange={setFiles} accept=".pdf" multiple />
        </FormField>
    );
}

function ButtonOnlyExample() {
    const [files, setFiles] = useState<File[]>([]);
    return (
        <FormField label="プロフィール画像" supportText="JPEG / PNG、2 MB まで">
            <FileUpload files={files} onChange={setFiles} accept="image/jpeg,image/png" dropArea={false} buttonLabel="画像を選択" />
        </FormField>
    );
}

function ErrorExample() {
    const [files, setFiles] = useState<File[]>([]);
    return (
        <FormField label="申請書" requirement="required" supportText="PDF、10 MB まで" errorText="申請書を添付してください">
            <FileUpload files={files} onChange={setFiles} accept=".pdf" />
        </FormField>
    );
}

const demo: ComponentDemo = {
    slug: "file-upload",
    title: "ファイルアップロード",
    category: "フォーム",
    description: "ファイルを選択してアップロードする。ドラッグ＆ドロップは補助で、ファイル選択ボタンを必ず置く（WCAG 2.5.7）。",
    dadsUrl: "https://design.digital.go.jp/dads/components/file-upload/",
    source: "@/components/ui/FileUpload, @/components/ui/FormField",
    examples: [
        {
            title: "基本（1 ファイル）",
            description: "受け付ける形式とサイズはサポートテキストに書く。選択したファイルは名前・サイズ・削除ボタンで一覧にする。",
            render: () => <SingleExample />,
        },
        {
            title: "複数ファイル + サイズ検査",
            description: "検査は利用側で行い、FormField の errorText で示す。",
            render: () => <MultipleExample />,
        },
        {
            title: "ボタンだけ（ドロップエリアなし）",
            render: () => <ButtonOnlyExample />,
        },
        {
            title: "エラー",
            render: () => <ErrorExample />,
        },
    ],
};

export default demo;
