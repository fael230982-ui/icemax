import { DashboardSections } from "../components/DashboardSections";
import { MetricGrid } from "../components/MetricGrid";
import { Shell } from "../components/Shell";
import { Topbar } from "../components/Topbar";

export default function Home() {
  return (
    <Shell>
      <Topbar />
      <MetricGrid />
      <DashboardSections />
    </Shell>
  );
}
