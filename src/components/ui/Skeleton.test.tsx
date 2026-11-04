import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Skeleton, SkeletonTable } from "./Skeleton";
import { Spinner } from "./Spinner";

describe("Skeleton", () => {
    it("textは行数分のバーを描画し、aria-hiddenになる", () => {
        const { container } = render(<Skeleton lines={3} />);
        const root = container.firstElementChild!;
        expect(root).toHaveAttribute("aria-hidden", "true");
        expect(root.children).toHaveLength(3);
        expect(root.children[0]).toHaveClass("animate-pulse", "bg-surface-strong", "w-full");
        expect(root.children[2]).toHaveClass("w-2/3");
    });

    it("rect / circleは1つの要素で、幅・高さはclassNameで指定する", () => {
        const { container, rerender } = render(<Skeleton variant="rect" className="h-40 w-full" />);
        expect(container.firstElementChild).toHaveClass("rounded-8", "h-40", "w-full", "animate-pulse");
        expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
        rerender(<Skeleton variant="circle" className="size-12" />);
        expect(container.firstElementChild).toHaveClass("rounded-full", "size-12");
    });

    it("SkeletonTableは行数 × 列数のセルを描画する", () => {
        const { container } = render(<SkeletonTable rows={3} columns={5} />);
        const root = container.firstElementChild!;
        expect(root).toHaveAttribute("aria-hidden", "true");
        // ヘッダー 1 行 + 本体 3 行
        expect(root.children).toHaveLength(4);
        expect(root.children[1].children).toHaveLength(5);
    });

    it("親にaria-busyを付けて使ってもアクセシビリティ違反がない", async () => {
        const { container } = render(
            <section aria-label="書類一覧" aria-busy="true">
                <Spinner label="書類を読み込み中" />
                <Skeleton lines={2} />
                <SkeletonTable rows={2} columns={3} />
            </section>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("書類を読み込み中");
        await expectNoA11yViolations(container);
    });
});
