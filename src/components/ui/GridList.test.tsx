import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Button } from "./Button";
import { GridList, GridListItem } from "./GridList";

describe("GridList", () => {
    it("ul role=listとカードのliを描画する", () => {
        render(
            <GridList>
                <GridListItem title="住民票の写し" description="交付申請" meta="証明書" />
                <GridListItem title="印鑑登録証明書" />
            </GridList>,
        );
        const list = screen.getByRole("list");
        expect(list).toHaveClass("grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3");
        const items = screen.getAllByRole("listitem");
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveClass("rounded-8", "border", "border-border", "bg-surface", "p-4");
        expect(screen.getByText("交付申請")).toBeInTheDocument();
        expect(screen.getByText("証明書")).toBeInTheDocument();
    });

    it("columnsで最大列数を変える", () => {
        const { rerender } = render(
            <GridList columns={2}>
                <GridListItem title="A" />
            </GridList>,
        );
        expect(screen.getByRole("list")).toHaveClass("sm:grid-cols-2");
        expect(screen.getByRole("list")).not.toHaveClass("lg:grid-cols-3");
        rerender(
            <GridList columns={4}>
                <GridListItem title="A" />
            </GridList>,
        );
        expect(screen.getByRole("list")).toHaveClass("xl:grid-cols-4");
        rerender(
            <GridList columns={1}>
                <GridListItem title="A" />
            </GridList>,
        );
        expect(screen.getByRole("list")).toHaveClass("grid-cols-1");
        expect(screen.getByRole("list")).not.toHaveClass("sm:grid-cols-2");
    });

    it("hrefでタイトルがリンクになり、actionsは擬似要素の上に乗る", () => {
        render(
            <MemoryRouter>
                <GridList>
                    <GridListItem title="住民票の写し" href="/services/1" actions={<Button size="sm">申請する</Button>} />
                </GridList>
            </MemoryRouter>,
        );
        const link = screen.getByRole("link", { name: "住民票の写し" });
        expect(link).toHaveAttribute("href", "/services/1");
        expect(link).toHaveClass("after:absolute", "after:inset-0");
        expect(screen.getByRole("button", { name: "申請する" }).parentElement).toHaveClass("relative");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <MemoryRouter>
                <GridList columns={2}>
                    <GridListItem title="A" description="a" meta="m" href="/a" actions={<Button size="sm">操作</Button>} />
                    <GridListItem title="B" />
                </GridList>
            </MemoryRouter>,
        );
        await expectNoA11yViolations(container);
    });
});
