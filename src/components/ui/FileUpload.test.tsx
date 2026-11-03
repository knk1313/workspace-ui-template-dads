import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { FileUpload, formatFileSize } from "./FileUpload";
import { FormField } from "./FormField";

function Controlled({ multiple = false, onChange, dropArea = true }: { multiple?: boolean; onChange?: (f: File[]) => void; dropArea?: boolean }) {
    const [files, setFiles] = useState<File[]>([]);
    return (
        <FormField label="添付ファイル" supportText="PDF または画像、1 ファイル 10 MB まで">
            <FileUpload
                files={files}
                onChange={(f) => {
                    setFiles(f);
                    onChange?.(f);
                }}
                multiple={multiple}
                accept=".pdf,image/*"
                dropArea={dropArea}
            />
        </FormField>
    );
}

const pdf = new File(["%PDF-1.4 dummy"], "report.pdf", { type: "application/pdf" });
const png = new File([new Uint8Array(2048)], "photo.png", { type: "image/png" });

describe("FileUpload", () => {
    it("サイズ表記", () => {
        expect(formatFileSize(512)).toBe("512 B");
        expect(formatFileSize(2048)).toBe("2.0 KB");
        expect(formatFileSize(15 * 1024 * 1024)).toBe("15 MB");
    });

    it("input[type=file] がラベルと関連付き、Tab で到達できる。未選択メッセージを出す", async () => {
        const user = userEvent.setup();
        render(<Controlled />);
        const input = screen.getByLabelText(/添付ファイル/) as HTMLInputElement;
        expect(input.type).toBe("file");
        expect(input).toHaveAttribute("accept", ".pdf,image/*");
        expect(input).toHaveAccessibleDescription("PDF または画像、1 ファイル 10 MB まで");
        expect(input).toHaveClass("sr-only");
        expect(screen.getByText("ファイルを選択")).toHaveAttribute("for", input.id);
        expect(screen.getByText("ファイルが選択されていません")).toBeInTheDocument();
        expect(screen.getByText("または、このエリア内にドラッグ＆ドロップ")).toBeInTheDocument();
        await user.tab();
        expect(input).toHaveFocus();
    });

    it("ファイルを選ぶと onChange に渡り、一覧に名前とサイズと削除ボタンを表示する", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Controlled onChange={onChange} />);
        await user.upload(screen.getByLabelText(/添付ファイル/), pdf);
        expect(onChange).toHaveBeenLastCalledWith([pdf]);
        const list = screen.getByRole("list", { name: "選択したファイル" });
        expect(list).toHaveTextContent("report.pdf");
        expect(list).toHaveTextContent("14 B");
        const remove = screen.getByRole("button", { name: "report.pdf を削除" });
        await user.click(remove);
        expect(onChange).toHaveBeenLastCalledWith([]);
        expect(screen.getByText("ファイルが選択されていません")).toBeInTheDocument();
    });

    it("単一選択は置き換え、複数選択は追加する（重複は除く）", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const { unmount } = render(<Controlled onChange={onChange} />);
        const input = () => screen.getByLabelText(/添付ファイル/);
        await user.upload(input(), pdf);
        await user.upload(input(), png);
        expect(onChange).toHaveBeenLastCalledWith([png]);
        unmount();

        render(<Controlled onChange={onChange} multiple />);
        await user.upload(input(), [pdf, png]);
        expect(onChange).toHaveBeenLastCalledWith([pdf, png]);
        await user.upload(input(), [pdf]);
        expect(onChange).toHaveBeenLastCalledWith([pdf, png]);
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    it("ドロップエリアにドロップできる。drag over で見た目が変わる", () => {
        const onChange = vi.fn();
        render(<Controlled onChange={onChange} multiple />);
        const area = screen.getByText("または、このエリア内にドラッグ＆ドロップ").closest("div.border-dashed")!;
        expect(area).toHaveClass("bg-surface-muted");
        fireEvent.dragOver(area, { dataTransfer: { files: [] } });
        expect(area).toHaveClass("bg-primary-surface", "border-primary");
        fireEvent.drop(area, { dataTransfer: { files: [pdf, png] } });
        expect(onChange).toHaveBeenLastCalledWith([pdf, png]);
        expect(area).not.toHaveClass("bg-primary-surface");
    });

    it("dropArea=false でボタンだけにできる。エラーを反映する", () => {
        render(
            <FormField label="A" errorText="PDF を選択してください">
                <FileUpload files={[]} onChange={() => {}} dropArea={false} />
            </FormField>,
        );
        expect(screen.queryByText(/ドラッグ＆ドロップ/)).not.toBeInTheDocument();
        expect(screen.getByLabelText(/A/)).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByText("ファイルを選択")).toHaveClass("border-error");
    });

    it("アクセシビリティ違反がない", async () => {
        const user = userEvent.setup();
        const { container } = render(
            <div>
                <Controlled multiple />
                <FormField label="B" errorText="選択してください">
                    <FileUpload files={[]} onChange={() => {}} />
                </FormField>
            </div>,
        );
        await user.upload(screen.getAllByLabelText(/添付ファイル/)[0], [pdf, png]);
        await expectNoA11yViolations(container);
    });
});
