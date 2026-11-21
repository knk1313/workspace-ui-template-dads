import type { CommandItem } from "@/components/ui/CommandPalette";
import type { HeaderNotifications } from "./headerContent";

// ヘッダーの検索の候補とお知らせの、何も出さない版（npm run remove-samples のあとに使う）。
// 検索の候補を足したり、お知らせを API から読み込んだりするときは、このファイルを書き換える。

const NO_ITEMS: CommandItem[] = [];
const NO_NOTIFICATIONS: HeaderNotifications = { items: [], isLoading: false, error: undefined };

/** 検索で、ナビゲーションの画面に加えて出す候補。 */
export function useHeaderSearchItems(navigate: (to: string) => void): CommandItem[] {
    void navigate; // 候補を足すときは、onSelect で navigate("/…") を呼ぶ
    return NO_ITEMS;
}

/** お知らせ。 */
export function useHeaderNotifications(): HeaderNotifications {
    return NO_NOTIFICATIONS;
}
