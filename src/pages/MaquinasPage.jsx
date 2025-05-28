import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import MaquinasProvider from "../components/Maquinas/MaquinasProvider";

export default function MaquinasPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="w-full lg:ml-64 flex-1 p-6 md:p-8 lg:p-12 bg-gray-100 overflow-y-auto pt-24 md:pt-20 lg:pt-4">
        <motion.header
          className="mb-8 md:mb-10 lg:mb-12 flex flex-col md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 md:mb-3">
              Máquinas para Locação
            </h1>
            <p className="text-base md:text-lg text-gray-500">
              Gerencie e localize rapidamente suas máquinas.
            </p>
          </div>
        </motion.header>

        <MaquinasProvider />
      </main>
    </div>
  );
}
