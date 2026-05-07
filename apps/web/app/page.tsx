import { DashboardSections } from "../components/DashboardSections";
import { Shell } from "../components/Shell";
import { Topbar } from "../components/Topbar";

export default function Home() {
  return (
    <Shell>
      <Topbar />
      <DashboardSections />
    </Shell>
  );
}
