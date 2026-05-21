import type { MyResultItem } from "@/lib/data/my-results";
import { MyResultsTable } from "@/components/results/MyResultsTable";

export function resultHref(item: { sessionId: string; moodResultId: string | null }) {
  const base = `/result/${item.sessionId}`;
  return item.moodResultId ? `${base}?moodResultId=${item.moodResultId}` : base;
}

type MyResultsListProps = {
  items: MyResultItem[];
  emptyCtaHref?: string;
  onItemClick?: () => void;
};

/** @deprecated Use MyResultsTable — kept as alias for existing imports. */
export function MyResultsList(props: MyResultsListProps) {
  return <MyResultsTable {...props} />;
}
