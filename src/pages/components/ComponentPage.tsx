import { useParams } from "react-router";
import { Anchor, Link } from "@/components/ui/Link";
import { findDemo } from "@/demo/registry";
import NotFoundPage from "@/pages/NotFoundPage";

// 1 コンポーネントのデモ（/components/:slug）。examples を順に描画する。
export default function ComponentPage() {
    const { slug = "" } = useParams();
    const demo = findDemo(slug);
    if (!demo) return <NotFoundPage />;

    return (
        <div className="flex flex-col gap-10">
            <div>
                <nav aria-label="パンくずリスト" className="text-16">
                    <ol className="m-0 flex list-none flex-wrap gap-1 p-0">
                        <li>
                            <Link to="/components">コンポーネント</Link>
                            <span aria-hidden="true"> › </span>
                        </li>
                        <li aria-current="page">{demo.title}</li>
                    </ol>
                </nav>
                <h1 className="mt-2 text-std-28B-150 text-text-strong">{demo.title}</h1>
                <p className="mt-2 text-text-muted">{demo.description}</p>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-16">
                    <dt className="font-bold">import</dt>
                    <dd className="m-0 font-mono text-mono-16N-150">{demo.source}</dd>
                    <dt className="font-bold">DADS</dt>
                    <dd className="m-0">
                        {demo.dadsUrl ? (
                            <Anchor href={demo.dadsUrl} newTab>
                                {demo.dadsUrl.replace("https://design.digital.go.jp/dads/", "")}
                            </Anchor>
                        ) : (
                            "該当コンポーネントなし（DADS の原則から設計）"
                        )}
                    </dd>
                </dl>
            </div>
            {demo.examples.map((ex) => (
                <section key={ex.title} aria-labelledby={`ex-${ex.title}`} className="flex flex-col gap-4">
                    <div>
                        <h2 id={`ex-${ex.title}`} className="text-std-20B-150 text-text-strong">
                            {ex.title}
                        </h2>
                        {ex.description && <p className="mt-1 text-text-muted">{ex.description}</p>}
                    </div>
                    <div className="rounded-8 border border-border bg-surface p-6">{ex.render()}</div>
                </section>
            ))}
        </div>
    );
}
