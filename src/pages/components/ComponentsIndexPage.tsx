import { Link } from "@/components/ui/Link";
import { CATEGORY_ORDER, demos } from "@/demo/registry";

// コンポーネント一覧（/components）。カテゴリごとにデモページへのリンクを並べる。
export default function ComponentsIndexPage() {
    return (
        <div className="flex flex-col gap-10">
            <div>
                <h1 className="text-std-28B-150 text-text-strong">コンポーネント</h1>
                <p className="mt-2 text-text-muted">デジタル庁デザインシステム（DADS）に準拠した部品の使用例とバリエーションです。</p>
            </div>
            {CATEGORY_ORDER.map((category) => {
                const items = demos.filter((d) => d.category === category);
                if (items.length === 0) return null;
                return (
                    <section key={category} aria-labelledby={`cat-${category}`}>
                        <h2 id={`cat-${category}`} className="text-std-20B-150 text-text-strong">
                            {category}
                        </h2>
                        <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((d) => (
                                <li key={d.slug}>
                                    <Link to={`/components/${d.slug}`}>{d.title}</Link>
                                    <p className="text-16 text-text-muted">{d.description}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                );
            })}
        </div>
    );
}
