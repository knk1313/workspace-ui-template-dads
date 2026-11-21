import { useMemo } from "react";
import { applicationQueries } from "@/api/applications";
import { useQuery } from "@/api/query";

/** 担当者の選択肢（職員の一覧）。読み込むまでは空。 */
export function useStaffOptions(): { value: string; label: string }[] {
    const staff = useQuery(applicationQueries.staff);
    return useMemo(() => (staff.data ?? []).map((s) => ({ value: s.name, label: s.name })), [staff.data]);
}
