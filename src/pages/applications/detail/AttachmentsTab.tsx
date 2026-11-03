import { FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { StackedList, StackedListItem } from "@/components/ui/StackedList";
import { useToast } from "@/components/ui/Toast";
import type { Application } from "@/api/types";
import { formatFileSize } from "../list/format";

// 添付ファイルタブ。ファイル名・サイズとダウンロードボタンを並べる。

export function AttachmentsTab({ attachments }: { attachments: Application["attachments"] }) {
    const { toast } = useToast();

    if (attachments.length === 0) {
        return <EmptyState as="h2" title="添付ファイルはありません" description="申請者がファイルを添付すると、ここに表示されます" />;
    }

    return (
        <Card as="section" padding="sm" className="overflow-hidden">
            <CardHeader title="添付ファイル" description={`${attachments.length}件`} />
            <StackedList className="mt-3 border-t border-border">
                {attachments.map((file) => (
                    <StackedListItem
                        key={file.name}
                        // 1 行目の高さの枠で上下中央に置き、ファイル名が折り返してもアイコンを 1 行目にそろえる
                        leading={
                            <span className="flex h-lh items-center">
                                <Icon icon={FileText} size="lg" className="text-text-muted" />
                            </span>
                        }
                        title={file.name}
                        description={<span className="nums">{formatFileSize(file.size)}</span>}
                        meta={
                            <Button
                                variant="text"
                                size="sm"
                                aria-label={`${file.name}をダウンロード`}
                                // 架空のデータなので実ファイルはない。実装時はファイルの URL へのリンク（ButtonAnchor download）にする。
                                onClick={() => toast({ type: "info", title: `${file.name}のダウンロードを開始しました`, description: "見本のため、実際のファイルは保存しません" })}
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
