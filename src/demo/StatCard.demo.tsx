import { Clock, FileText, Inbox, Users } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "stat-card",
    title: "指標（KPI カード）",
    category: "データ表示",
    description: "判断や行動を左右する値を、前期比や注記とともに示す。DADS にはないためダッシュボードデザインの実践ガイドブックの「指標」に従う。",
    source: "@/components/ui/StatCard",
    examples: [
        {
            title: "基本（値 + 前期比 + 注記）",
            description: "増減は矢印アイコン + 符号 + 色（増加 Blue 800 / 減少 Red 900）で示し、スクリーンリーダーには「前月比 12.3% 増加」と伝える。",
            render: () => (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="今月の申請件数" value="1,234" unit="件" delta={{ value: "+12.3%", trend: "up", label: "前月比" }} note="2026年10月末時点" icon={FileText} />
                    <StatCard label="未処理" value="56" unit="件" delta={{ value: "-8 件", trend: "down", label: "前週比" }} note="毎朝 6:00 更新" icon={Inbox} />
                    <StatCard label="平均処理日数" value="3.2" unit="日" delta={{ value: "±0", trend: "flat", label: "前月比" }} icon={Clock} />
                    <StatCard label="利用者数" value="8,910" unit="人" delta={{ value: "+2.1%", trend: "up", label: "前年同月比" }} icon={Users} />
                </div>
            ),
        },
        {
            title: "左上の強調（highlight）",
            description: "ダッシュボードの左上に置く全体の指標はキーカラーの面で最も目を引くようにする。増減の色は白のままにし、アイコンと符号で伝える。",
            render: () => (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatCard label="今月の交付件数" value="4,521" unit="件" delta={{ value: "+5.4%", trend: "up", label: "前月比" }} note="2026年10月末時点" highlight />
                    <StatCard label="受付中" value="312" unit="件" delta={{ value: "-3.1%", trend: "down", label: "前月比" }} />
                    <StatCard label="完了" value="4,209" unit="件" delta={{ value: "+6.0%", trend: "up", label: "前月比" }} />
                </div>
            ),
        },
        {
            title: "リンク付き",
            description: "ラベルがリンクになり、カード全体がクリック領域になる（詳細一覧へ）。",
            render: () => (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StatCard label="差戻し中の申請" value="7" unit="件" href="/components/data-table" note="対応が必要です" />
                    <StatCard label="期限切れ間近" value="12" unit="件" href="/components/data-table" delta={{ value: "+4 件", trend: "up", label: "昨日比" }} />
                </div>
            ),
        },
    ],
};

export default demo;
