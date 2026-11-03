import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, type TableProps } from "@/components/ui/Table";
import type { ComponentDemo } from "./types";

const rows = [
    { id: "A-2026-00121", name: "山田 太郎", category: "住民票の写し", amount: 300, date: "2026-10-01" },
    { id: "A-2026-00122", name: "佐藤 花子", category: "印鑑登録証明書", amount: 300, date: "2026-10-01" },
    { id: "A-2026-00123", name: "鈴木 一郎", category: "戸籍謄本", amount: 450, date: "2026-10-02" },
    { id: "A-2026-00124", name: "高橋 美咲", category: "課税証明書", amount: 300, date: "2026-10-03" },
];

function Sample(props: Partial<TableProps> & { selectedId?: string }) {
    const { selectedId, ...rest } = props;
    return (
        <Table caption="証明書の交付申請（2026年10月）" {...rest}>
            <TableHead>
                <TableRow>
                    <TableHeaderCell>申請番号</TableHeaderCell>
                    <TableHeaderCell>申請者</TableHeaderCell>
                    <TableHeaderCell>種別</TableHeaderCell>
                    <TableHeaderCell align="right">手数料（円）</TableHeaderCell>
                    <TableHeaderCell align="right">申請日</TableHeaderCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.id} selected={row.id === selectedId}>
                        <TableHeaderCell scope="row" variant="plain">
                            {row.id}
                        </TableHeaderCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell align="right">{row.amount.toLocaleString("ja-JP")}</TableCell>
                        <TableCell align="right">{row.date}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

const demo: ComponentDemo = {
    slug: "table",
    title: "テーブル",
    category: "データ表示",
    description: "行と列で構造化された情報を表示する静的な表。ヘッダーは太字 + 黒い下線で区切り、縦は上寄せ、数値・日付は右寄せ。操作を伴う表はデータテーブルを使う。",
    dadsUrl: "https://design.digital.go.jp/dads/components/table/",
    source: "@/components/ui/Table",
    examples: [
        {
            title: "基本",
            description: "caption で表のタイトルを付ける。申請番号の列は行見出し（th scope=\"row\"、plain）。",
            render: () => <Sample />,
        },
        {
            title: "Dense（情報密度優先）",
            description: "セルの余白を 12px 16px、行高を 1.3 に詰める。タッチ操作が想定される画面では避ける。",
            render: () => <Sample size="dense" />,
        },
        {
            title: "ストライプ + ホバーハイライト",
            description: "偶数行に薄い背景、カーソルの乗った行に key-50。罫線は背景とのコントラスト 3:1 を保つため濃くなる。",
            render: () => <Sample striped hoverHighlight />,
        },
        {
            title: "選択行",
            description: "選択された行は key-100 の背景。選択そのものはチェックボックスが伝える（データテーブル参照）。",
            render: () => <Sample selectable selectedId="A-2026-00123" />,
        },
        {
            title: "行見出し（DADS 既定の装飾）",
            description: "変数名と値のような表では行見出しを背景付き + 右線 black にする。",
            render: () => (
                <Table fullWidth={false}>
                    <TableBody>
                        <TableRow>
                            <TableHeaderCell scope="row">申請番号</TableHeaderCell>
                            <TableCell>A-2026-00123</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableHeaderCell scope="row">申請者</TableHeaderCell>
                            <TableCell>鈴木 一郎</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableHeaderCell scope="row">申請日</TableHeaderCell>
                            <TableCell>2026-10-02</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            ),
        },
        {
            title: "横スクロールと固定ヘッダー",
            description: "表の最小幅を指定すると領域内で横スクロールする（モバイルでは右端にシャドー）。stickyHeader で縦スクロール時に見出しを固定する。",
            render: () => <Sample className="min-w-table-min" stickyHeader wrapperClassName="max-h-60 overflow-y-auto" />,
        },
    ],
};

export default demo;
