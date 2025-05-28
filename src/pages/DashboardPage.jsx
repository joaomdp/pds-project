import { DashboardProvider } from "../components/Dashboard/DashboardProvider";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-slate-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <div className="container mx-auto px-4 py-8">
            <DashboardProvider />
          </div>
        </main>
      </div>
    </div>
  );
}
