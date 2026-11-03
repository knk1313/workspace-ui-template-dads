import { FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { StackedList, StackedListItem } from "@/components/ui/StackedList";
import { useToast } from "@/components/ui/Toast";
import type { Application } from "@/mocks/applications";
import { formatFileSize } from "../list/format";

// 添付ファイルタブ。ファイル名・サイズとダウンロードボタンを並べる。

export function AttachmentsTab({ attachments }: { attachments: Application["attachments"] }) {
    const { toast } = useToast();

    if (attachments.length === 0) {
        return <EmptyState as="h2" title="添付ファイルはありません" description="申請者がファイルを添付すると、ここに表示されます。" />;
    }

    return (
        <Card as="section" padding="sm" className="overflow-hidden">
            <CardHeader title="添付ファイル" description={`${attachments.length} 件`} />
            <StackedList className="mt-3 border-t border-border">
                {attachments.map((file) => (
                    <StackedListItem
                        key={file.name}
                        // 複数行になってもアイコンが 1 行目の文字と揃うよう、行の高さに合わせて少し下げる
                        leading={<Icon icon={FileText} size="lg" className="mt-0.5 text-text-muted" />}
                        title={file.name}
                        description={<span className="nums">{formatFileSize(file.size)}</span>}
                        meta={
                            <Button
                                variant="text"
                                size="sm"
                                aria-label={`${file.name} をダウンロード`}
                                // 架空のデータなので実ファイルはない。実装時はファイルの URL へのリンク（ButtonAnchor download）にする。
                                onClick={() => toast({ type: "info", title: `${file.name} のダウンロードを開始しました`, description: "表示例のため、実際のファイルは保存されません。" })}
                            >
                                ダウンロード
                            </Button>
                        }
                    />
                ))}
            </StackedList>
        </Card>
    );
}
