import { useMemo } from "react";
import { applicationQueries } from "@/api/applications";
import { useQuery } from "@/api/query";

/**
 * 担当者の選択肢（職員の一覧）。
 * current に今の値を渡すと、一覧を読み込むまでの間や読み込めなかったときも、その値を選択肢に含める
 * （選んである担当者が、空欄に見えないように）。
 */
export function useStaffOptions(current = "") {
    const { data, error, reload } = useQuery(applicationQueries.staff);
    const options = useMemo(() => {
        const names = (data ?? []).map((s) => s.name);
        if (current && !names.includes(current)) names.unshift(current);
        return names.map((name) => ({ value: name, label: name }));
    }, [data, current]);
    return { options, isLoading: !data && !error, error: data ? undefined : error, reload };
}
