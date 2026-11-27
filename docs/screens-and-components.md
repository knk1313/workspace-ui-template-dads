# 画面と部品

見本の画面と、`src/components/`の部品の一覧。部品の値（角丸や行の高さ）を導入先に合わせて変えるときは、[local-design-system.md](local-design-system.md)を参照。

## 画面（見本）

見本の画面と、主に使っている部品は次のとおりです。

| URL | 画面 | 主な部品 |
| --- | --- | --- |
| `/` | ダッシュボード | StatCard、LineChart、BarChart、DonutChart、DataTable、ActivityFeed |
| `/applications` | 一覧（検索、絞り込み、一括操作） | SearchBox、Select、ChipTag、DataTable、Pagination、DropdownMenu、ModalDialog、Drawer |
| `/applications/:id` | 詳細 | PageHeader、Tabs、DescriptionList、StackedList、Timeline、NotificationBanner |
| `/applications/new`、`/applications/:id/edit` | 作成と編集のフォーム（入力、確認、完了） | StepNavigation、FormField、Input、RadioGroup、DatePicker、Combobox、FileUpload、Switch、ActionPanel |
| `/settings` | 設定（設定画面の型のフォーム） | Tabs、FormSection、Switch、RadioGroup、Select |
| `/login` | ログイン | Card、Input、Checkbox、NotificationBanner |
| `*`、`/error/500` | 404、500 | ErrorPage |

ログイン、404、500の画面はナビゲーションに出ないため、設定の画面の末尾に、各画面へのリンクを置いています。画面のレイアウトは、設定の「表示」で「サイドバー型」と「上部ナビゲーション型」を切り替えられます。

## 部品

部品はすべて`src/components/`にあります。使い方は、各ファイルの冒頭のコメント、Propsの型、同じ場所にある`*.test.tsx`を見てください。ほかの部品の中で使う小さな部品（`FormField`、`Icon`、`RadioGroup`、`Spinner`、グラフの模様とツールチップ）は、専用のテストを置かず、それを使う部品のテストで確かめています。組み合わせ方は、見本の画面が参考になります。分類ごとの部品は次のとおりです。

| 分類 | 部品（`src/components/ui/`） |
| --- | --- |
| 要素 | Button、ButtonLink、ButtonAnchor、IconButton、ButtonGroup、Link、Anchor、Icon、Spinner |
| レイアウト | Container、Card（CardHeader、CardBody、CardFooter）、Panel、Divider、Heading、PageHeader |
| アプリケーションのシェル（`src/layouts/`） | AppShell（サイドバー型、折りたたみ可、モバイルではドロワー）、TopNavLayout（上部ナビゲーション型） |
| ナビゲーション | SideNav、HeaderNav、Breadcrumb、Tabs、Pagination、StepNavigation、CommandPalette |
| フォーム | FormField（ラベル、要否、サポートテキスト、エラー）、Input、Textarea、Select、Combobox、Checkbox、Radio、RadioGroup、Switch、DatePicker、FileUpload、SearchBox、FormLayout、FormSection、ActionPanel |
| データの表示 | Table、TableCellLine、DataTable（並べ替え、行の選択、一括操作、ページ送り、空の状態、読み込み中、横スクロール）、DescriptionList、StatCard、StackedList、GridList、ActivityFeed、Timeline、ChipLabel、StatusChip、ChipTag、Avatar、AvatarGroup |
| グラフ（`src/components/charts/`） | LineChart、BarChart（縦、横、積み上げ）、AreaChart（積み上げ、100%）、DonutChart、ChartFrame（凡例、単位、出典、注記、数値の表への切り替え） |
| フィードバック | NotificationBanner、Toast（useToast、「元に戻す」などの操作を付けられる）、LoadError、ModalDialog、ConfirmDialog（useConfirm）、Drawer、DropdownMenu、Popover、Tooltip、EmptyState、Skeleton、ErrorPage |

散布図は、ダッシュボードのガイドブックが勧めるグラフに含まれないため、用意していません。
