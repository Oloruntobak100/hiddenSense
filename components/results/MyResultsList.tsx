import type { MyResultItem } from "@/lib/data/my-results";
import { MyResultsTable } from "@/components/results/MyResultsTable";

/** Dashboard URL that re-opens the My Results datatable after viewing a past reveal. */
export const DASHBOARD_RESULTS_RETURN = "/dashboard?results=1";

export function resultHref(
  item: { sessionId: string; moodResultId: string | null },
  returnTo?: string,
) {
  const params = new URLSearchParams();
  if (item.moodResultId) params.set("moodResultId", item.moodResultId);
  if (returnTo) {
    params.set("returnTo", returnTo);
    params.set("fromHistory", "1");
  }
  const q = params.toString();
  return `/result/${item.sessionId}${q ? `?${q}` : ""}`;
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
