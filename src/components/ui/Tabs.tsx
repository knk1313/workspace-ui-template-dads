import {
    createContext,
    useCallback,
    useContext,
    useId,
    useRef,
    useState,
    type ButtonHTMLAttributes,
    type HTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// DADS タブ（https://design.digital.go.jp/dads/components/tab/ / HTML 版 tab.css）。
// WAI-ARIA APG の Tabs パターン: role="tablist" / "tab" / "tabpanel"、選択タブ以外は tabIndex=-1（ロービング）、
// ← → で隣のタブへ、Home / End で先頭 / 末尾へ移動し、自動で選択する（activation="manual" のときは Enter / Space で選択）。
// 見た目: 選択タブは上端ではなく下端に 4px のキーカラー線 + 太字、未選択は 1px の罫線、hover は背景 solid-gray-50 + 下線。
// 高さは 44px 以上。タブが幅に収まらないときは横スクロールする。
//
//   <Tabs label="申請の詳細" items={[{ value: "summary", label: "概要", panel: <Summary /> }, …]} />
//   または
//   <Tabs label="…" defaultValue="a">
//     <TabList><Tab value="a">A</Tab><Tab value="b">B</Tab></TabList>
//     <TabPanel value="a">…</TabPanel><TabPanel value="b">…</TabPanel>
//   </Tabs>

export type TabItem = {
    value: string;
    label: ReactNode;
    panel: ReactNode;
    icon?: LucideIcon;
};

export type TabsActivation = "automatic" | "manual";

type TabsContextValue = {
    value: string;
    select: (value: string) => void;
    activation: TabsActivation;
    baseId: string;
    label: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(): TabsContextValue {
    const ctx = useContext(TabsContext);
    if (!ctx) throw new Error("TabList / Tab / TabPanelはTabsの中で使ってください");
    return ctx;
}

export const tabId = (baseId: string, value: string) => `${baseId}-tab-${value}`;
export const panelId = (baseId: string, value: string) => `${baseId}-panel-${value}`;

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> & {
    /** タブリストの aria-label（何を切り替えるか）。 */
    label: string;
    /** items を渡すと TabList / TabPanel を自動で描画する。 */
    items?: readonly TabItem[];
    /** 制御する場合の選択値。 */
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    activation?: TabsActivation;
    children?: ReactNode;
};

export function Tabs({ label, items, value, defaultValue, onChange, activation = "automatic", children, className, ...props }: TabsProps) {
    const baseId = useId();
    const [inner, setInner] = useState(defaultValue ?? items?.[0]?.value ?? "");
    const current = value ?? inner;
    const select = useCallback(
        (next: string) => {
            if (next === current) return;
            if (value === undefined) setInner(next);
            onChange?.(next);
        },
        [current, value, onChange],
    );

    return (
        <TabsContext.Provider value={{ value: current, select, activation, baseId, label }}>
            <div className={cn("flex min-w-0 flex-col", className)} {...props}>
                {items ? (
                    <>
                        <TabList>
                            {items.map((item) => (
                                <Tab key={item.value} value={item.value} icon={item.icon}>
                                    {item.label}
                                </Tab>
                            ))}
                        </TabList>
                        {items.map((item) => (
                            <TabPanel key={item.value} value={item.value}>
                                {item.panel}
                            </TabPanel>
                        ))}
                    </>
                ) : (
                    children
                )}
            </div>
        </TabsContext.Provider>
    );
}

export type TabListProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function TabList({ children, className, ...props }: TabListProps) {
    const { label, activation, select } = useTabs();
    const ref = useRef<HTMLDivElement>(null);

    function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        const tabs = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
        const index = tabs.findIndex((t) => t === document.activeElement);
        if (tabs.length === 0 || index < 0) return;
        let next: number | null = null;
        switch (e.key) {
            case "ArrowRight":
                next = (index + 1) % tabs.length;
                break;
            case "ArrowLeft":
                next = (index - 1 + tabs.length) % tabs.length;
                break;
            case "Home":
                next = 0;
                break;
            case "End":
                next = tabs.length - 1;
                break;
            default:
                return;
        }
        e.preventDefault();
        const target = tabs[next];
        target.focus();
        if (activation === "automatic") select(target.dataset.value ?? "");
    }

    return (
        <div
            ref={ref}
            role="tablist"
            aria-label={label}
            onKeyDown={onKeyDown}
            className={cn("flex items-stretch overflow-x-auto border-b border-border", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export type TabProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "children"> & {
    value: string;
    children: ReactNode;
    icon?: LucideIcon;
};

export function Tab({ value, children, icon, className, ...props }: TabProps) {
    const { value: current, select, baseId } = useTabs();
    const selected = current === value;
    return (
        <button
            type="button"
            role="tab"
            id={tabId(baseId, value)}
            aria-selected={selected}
            aria-controls={panelId(baseId, value)}
            tabIndex={selected ? 0 : -1}
            data-value={value}
            onClick={() => select(value)}
            className={cn(
                "flex min-h-11 shrink-0 items-center gap-1 px-4 py-3 text-16 leading-120 tracking-0 text-text transition-colors",
                "focus-visible:focus-ring focus-visible:rounded-4",
                selected ? "border-b-4 border-primary font-bold text-primary" : "border-b-4 border-transparent hover:bg-surface-muted hover:underline hover:underline-offset-3",
                className,
            )}
            {...props}
        >
            {icon && <Icon icon={icon} size="md" />}
            {children}
        </button>
    );
}

export type TabPanelProps = HTMLAttributes<HTMLDivElement> & { value: string; children: ReactNode };

export function TabPanel({ value, children, className, ...props }: TabPanelProps) {
    const { value: current, baseId } = useTabs();
    const selected = current === value;
    return (
        <div
            role="tabpanel"
            id={panelId(baseId, value)}
            aria-labelledby={tabId(baseId, value)}
            tabIndex={0}
            hidden={!selected}
            className={cn("min-w-0 pt-4 text-16 leading-170 tracking-2 text-text focus-visible:focus-ring focus-visible:rounded-4", className)}
            {...props}
        >
            {children}
        </div>
    );
}
