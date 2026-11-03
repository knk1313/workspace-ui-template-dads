import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

// 申請の詳細を読み込んでいる間の表示。読み込み後のページ見出し・タブ・概要カードと同じ位置と大きさに置く。
export function DetailSkeleton() {
    return (
        <div className="flex flex-col gap-6" aria-busy="true">
            <p role="status" className="sr-only">
                申請を読み込んでいます
            </p>
            <div className="flex flex-col gap-4">
                <Skeleton className="w-48" />
                <Skeleton variant="rect" className="h-10 w-2/3" />
                <Skeleton className="w-80 max-w-full" />
            </div>
            <Skeleton variant="rect" className="h-12 w-full max-w-md" />
            <Card>
                <CardBody>
                    <Skeleton lines={6} />
                </CardBody>
            </Card>
        </div>
    );
}
