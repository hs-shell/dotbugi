import { Calendar } from '@/option/calendar';
import SummaryCard from '@/option/SummaryCard';
export default function DashboardPage() {
  return (
    <div className=" py-16">
      <SummaryCard />
      <Calendar />
    </div>
  );
}
