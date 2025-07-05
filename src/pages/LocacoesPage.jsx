import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import LocacoesProvider from "../components/Locacoes/LocacoesProvider";
import LocarMaquinaModal from "../components/Maquinas/LocarMaquinaModal";
import { useLocacoes } from "../hooks/useLocacoes";

export default function LocacoesPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todas"); // "todas", "ativas", "reservadas"
  const [showRenovarModal, setShowRenovarModal] = useState(false);
  const [locacaoParaRenovar, setLocacaoParaRenovar] = useState(null);
  const { removerLocacao } = useLocacoes();
  const location = useLocation();
  const scrollToRef = useRef(null);

  useEffect(() => {
    if (location.state?.scrollToLocacao) {
      // Aguardar um pouco para garantir que os componentes foram renderizados
      setTimeout(() => {
        if (scrollToRef.current) {
          scrollToRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 500);
    }
  }, [location.state]);

  const handleRenovarLocacao = (locacao) => {
    setLocacaoParaRenovar(locacao);
    setShowRenovarModal(true);
  };

  const handleDeletarLocacao = async (locacaoId) => {
    try {
      await removerLocacao(locacaoId);
    } catch {
      alert("Erro ao deletar locação.");
    }
  };

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
          <div className="space-y-4">
            {/* Campo de busca */}
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

            {/* Filtro de status discreto */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 font-medium">Filtrar:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFiltroStatus("todas")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filtroStatus === "todas"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFiltroStatus("ativas")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filtroStatus === "ativas"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Ativas
                </button>
                <button
                  onClick={() => setFiltroStatus("reservadas")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filtroStatus === "reservadas"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Reservas
                </button>
              </div>
            </div>
          </div>
        </div>

        <LocacoesProvider
          termoBusca={busca}
          filtroStatus={filtroStatus}
          onRenovar={handleRenovarLocacao}
          onDeletar={handleDeletarLocacao}
          scrollToLocacao={location.state?.scrollToLocacao}
          scrollToRef={scrollToRef}
        />

        {locacaoParaRenovar && (
          <LocarMaquinaModal
            isOpen={showRenovarModal}
            onClose={() => {
              setShowRenovarModal(false);
              setLocacaoParaRenovar(null);
            }}
            locacaoAtual={locacaoParaRenovar}
            modoRenovacao={true}
          />
        )}
      </main>
    </div>
  );
}
