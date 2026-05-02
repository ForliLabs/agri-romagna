import { PageSkeleton } from "@/components/ui/states";

export default function DashboardLoading() {
  return <PageSkeleton cards={4} rows={4} />;
}
