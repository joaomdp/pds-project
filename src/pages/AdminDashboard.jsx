import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import MyCalendar from "../components/Dashboard/Calendar";
import TopMachinesChart from "../components/Dashboard/TopMachinesChart";
import RevenueChart from "../components/Dashboard/RevenueChart";
import RecentActivities from "../components/Dashboard/RecentActivities";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="w-full lg:ml-64 flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto pt-24 md:pt-20 lg:pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 md:mb-10 lg:mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800">
              Painel Administrativo
            </h1>
            <p className="text-base md:text-lg text-slate-500 mt-2 md:mt-3">
              Resumo geral das atividades e locações
            </p>
          </div>
        </div>

        <motion.section
          className="bg-white rounded-lg border border-slate-200 mb-6 md:mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 md:p-6 border-b border-slate-200">
            <h2 className="text-lg md:text-xl font-medium text-slate-800">
              Agenda
            </h2>
          </div>
          <div className="p-4 md:p-6">
            <MyCalendar />
          </div>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          <motion.section
            className="bg-white rounded-lg border border-slate-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="p-4 md:p-6 border-b border-slate-200">
              <h2 className="text-lg md:text-xl font-medium text-slate-800">
                Top Máquinas
              </h2>
            </div>
            <div className="p-4 md:p-6">
              <TopMachinesChart />
            </div>
          </motion.section>

          <motion.section
            className="bg-white rounded-lg border border-slate-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="p-4 md:p-6 border-b border-slate-200">
              <h2 className="text-lg md:text-xl font-medium text-slate-800">
                Receita Mensal
              </h2>
            </div>
            <div className="p-4 md:p-6">
              <RevenueChart />
            </div>
          </motion.section>
        </div>

        <motion.section
          className="bg-white rounded-lg border border-slate-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="p-4 md:p-6 border-b border-slate-200">
            <h2 className="text-lg md:text-xl font-medium text-slate-800">
              Atividades Recentes
            </h2>
          </div>
          <div className="p-4 md:p-6">
            <RecentActivities />
          </div>
        </motion.section>
      </main>
    </div>
  );
}
