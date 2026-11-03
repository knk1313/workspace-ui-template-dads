import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Avatar, AvatarGroup, getInitials } from "./Avatar";

describe("Avatar", () => {
    it("名前からイニシャルを作る", () => {
        expect(getInitials("山田 太郎")).toBe("山太");
        expect(getInitials("山田　太郎")).toBe("山太");
        expect(getInitials("Taro Yamada")).toBe("TY");
        expect(getInitials("山田")).toBe("山");
        expect(getInitials("taro")).toBe("TA");
        expect(getInitials("")).toBe("");
    });

    it("画像がなければイニシャルを表示し、role=img + aria-label で名前を伝える", () => {
        render(<Avatar name="山田 太郎" />);
        const avatar = screen.getByRole("img", { name: "山田 太郎" });
        expect(avatar).toHaveTextContent("山太");
        expect(avatar.querySelector("[aria-hidden='true']")).toHaveTextContent("山太");
        expect(avatar).toHaveClass("size-10", "rounded-full");
    });

    it("src があれば画像（alt は空）を表示し、読み込み失敗でイニシャルに戻す", () => {
        render(<Avatar name="山田 太郎" src="/avatar.png" />);
        const avatar = screen.getByRole("img", { name: "山田 太郎" });
        const img = avatar.querySelector("img")!;
        expect(img).toHaveAttribute("src", "/avatar.png");
        expect(img).toHaveAttribute("alt", "");
        expect(avatar).not.toHaveTextContent("山太");
        fireEvent.error(img);
        expect(avatar.querySelector("img")).not.toBeInTheDocument();
        expect(avatar).toHaveTextContent("山太");
    });

    it("size / shape に応じたクラス", () => {
        const { rerender } = render(<Avatar name="A" size="sm" shape="square" />);
        expect(screen.getByRole("img")).toHaveClass("size-8", "rounded-8", "text-14");
        rerender(<Avatar name="A" size="lg" />);
        expect(screen.getByRole("img")).toHaveClass("size-12", "rounded-full", "text-18");
    });

    it("AvatarGroup は max までを表示し、超過分を「+n」で示す", () => {
        render(<AvatarGroup items={[{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }, { name: "E" }]} max={3} label="担当者" />);
        const list = screen.getByRole("list", { name: "担当者" });
        expect(list).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(3);
        expect(screen.getByText("+2")).toHaveAttribute("aria-hidden", "true");
        expect(screen.getByText("他 2 人")).toHaveClass("sr-only");
        expect(screen.getAllByRole("listitem")).toHaveLength(4);
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <div>
                <Avatar name="山田 太郎" />
                <Avatar name="佐藤 花子" src="/x.png" size="lg" shape="square" />
                <AvatarGroup items={[{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }]} />
            </div>,
        );
        await expectNoA11yViolations(container);
    });
});
