import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { invalidate, setQueryData, useMutation, useQuery } from "./query";

function Reader({ queryKey, fetcher }: { queryKey: string; fetcher: () => Promise<string> }) {
    const q = useQuery(queryKey, fetcher);
    return (
        <div>
            <p>{q.isLoading ? "loading" : q.error ? `error: ${q.error.message}` : `data: ${q.data}`}</p>
            {q.isRefreshing && <p>refreshing</p>}
            <button type="button" onClick={() => void q.reload()}>
                reload
            </button>
        </div>
    );
}

describe("useQuery", () => {
    it("読み込み中 → データの順に表示し、同じキーの 2 つ目の呼び出しは通信をまとめる", async () => {
        const fetcher = vi.fn(async () => "A");
        render(
            <>
                <Reader queryKey="k" fetcher={fetcher} />
                <Reader queryKey="k" fetcher={fetcher} />
            </>,
        );
        expect(screen.getAllByText("loading")).toHaveLength(2);
        expect(await screen.findAllByText("data: A")).toHaveLength(2);
        expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("一度読み込んだ結果は、開き直したときに読み込み中を出さずにすぐ表示し、裏で読み込み直す", async () => {
        let value = "A";
        const fetcher = vi.fn(async () => value);
        const { unmount } = render(<Reader queryKey="k" fetcher={fetcher} />);
        await screen.findByText("data: A");
        unmount();
        value = "B";
        render(<Reader queryKey="k" fetcher={fetcher} />);
        expect(screen.getByText("data: A")).toBeInTheDocument();
        expect(await screen.findByText("data: B")).toBeInTheDocument();
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("fetcher を毎回作り直しても、描き直すたびに通信はしない", async () => {
        const calls = vi.fn();
        const { rerender } = render(<Reader queryKey="k" fetcher={async () => (calls(), "A")} />);
        await screen.findByText("data: A");
        rerender(<Reader queryKey="k" fetcher={async () => (calls(), "A")} />);
        rerender(<Reader queryKey="k" fetcher={async () => (calls(), "A")} />);
        expect(calls).toHaveBeenCalledTimes(1);
    });

    it("失敗すると error を返し、reload でやり直せる", async () => {
        const fetcher = vi.fn().mockRejectedValueOnce(new Error("通信に失敗しました")).mockResolvedValue("B");
        render(<Reader queryKey="k" fetcher={fetcher} />);
        expect(await screen.findByText("error: 通信に失敗しました")).toBeInTheDocument();
        act(() => screen.getByRole("button", { name: "reload" }).click());
        expect(await screen.findByText("data: B")).toBeInTheDocument();
    });

    it("invalidate すると、表示中のキーを読み込み直す（前の結果は表示したまま）", async () => {
        let value = "A";
        const fetcher = vi.fn(async () => value);
        render(<Reader queryKey="items/1" fetcher={fetcher} />);
        await screen.findByText("data: A");
        value = "B";
        act(() => invalidate("items"));
        expect(await screen.findByText("data: B")).toBeInTheDocument();
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("読み込み直しが失敗しても前の結果を消さない", async () => {
        const fetcher = vi.fn().mockResolvedValueOnce("A").mockRejectedValueOnce(new Error("失敗"));
        render(<Reader queryKey="k" fetcher={fetcher} />);
        await screen.findByText("data: A");
        act(() => invalidate("k"));
        await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
        // error と data の両方があるとき、画面はエラーを出しつつ前の内容を残せる
        expect(await screen.findByText("error: 失敗")).toBeInTheDocument();
    });

    it("setQueryData で結果を書き換えられる（楽観的な更新）", async () => {
        render(<Reader queryKey="k" fetcher={async () => "A"} />);
        await screen.findByText("data: A");
        act(() => setQueryData<string>("k", (prev) => `${prev}+`));
        expect(screen.getByText("data: A+")).toBeInTheDocument();
    });
});

describe("useMutation", () => {
    function Saver({ fn }: { fn: () => Promise<void> }) {
        const m = useMutation(fn);
        return (
            <button type="button" onClick={() => void m.run().catch(() => {})}>
                {m.pending ? "saving" : "save"}
            </button>
        );
    }

    it("実行中は pending になり、終わると（失敗しても）戻る", async () => {
        let resolve!: () => void;
        const fn = vi.fn(() => new Promise<void>((r) => (resolve = r)));
        render(<Saver fn={fn} />);
        act(() => screen.getByRole("button").click());
        expect(screen.getByRole("button")).toHaveTextContent("saving");
        await act(async () => resolve());
        expect(screen.getByRole("button")).toHaveTextContent("save");

        const failing = vi.fn(async () => {
            throw new Error("失敗");
        });
        render(<Saver fn={failing} />);
        const [, second] = screen.getAllByRole("button");
        await act(async () => second.click());
        expect(second).toHaveTextContent("save");
    });
});
