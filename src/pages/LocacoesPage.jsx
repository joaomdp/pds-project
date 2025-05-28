import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import LocacoesProvider from "../components/Locacoes/LocacoesProvider";

export default function LocacoesPage() {
  const [busca, setBusca] = useState("");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="w-full lg:ml-64 flex-1 p-6 md:p-8 lg:p-12 bg-gray-50 overflow-y-auto pt-24 md:pt-20 lg:pt-4">
        <motion.header
          className="mb-8 md:mb-10 lg:mb-12 flex flex-col md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 md:mb-3">
              Locações Ativas
            </h1>
            <p className="text-base md:text-lg text-gray-500">
              Visualize e gerencie suas locações em andamento.
            </p>
          </div>
        </motion.header>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md mb-6 md:mb-8">
          <div className="relative">
            <i className="bx bx-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
            <input
              type="text"
              placeholder="Buscar locação por cliente ou máquina..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-3 md:py-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <LocacoesProvider termoBusca={busca} />
      </main>
    </div>
  );
}
