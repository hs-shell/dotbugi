import { Calendar } from '@/option/Calendar';
import SummaryCard from '@/option/SummaryCard';
export default function DashboardPage() {
  return (
    <div className="pb-16">
      <SummaryCard />
      <Calendar />
    </div>
  );
}
