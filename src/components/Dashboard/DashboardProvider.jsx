import { useState, useEffect } from "react";
import TopMachinesChart from "./TopMachinesChart";
import RevenueChart from "./RevenueChart";
import RecentActivities from "./RecentActivities";
import Calendar from "./Calendar";
import {
  getEstatisticas,
  getMaquinasMaisLocadas,
  getReceitaPorPeriodo,
  getAtividadesRecentes,
} from "../../services/dashboardService";

export default function DashboardProvider() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estatisticas, setEstatisticas] = useState({
    totalClientes: 0,
    totalMaquinas: 0,
    totalLocacoes: 0,
    receitaTotal: 0,
  });
  const [maquinasMaisLocadas, setMaquinasMaisLocadas] = useState([]);
  const [receitaPorPeriodo, setReceitaPorPeriodo] = useState([]);
  const [atividadesRecentes, setAtividadesRecentes] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsLoading(true);

        const [estatisticasData, maquinasData, receitaData, atividadesData] =
          await Promise.all([
            getEstatisticas(),
            getMaquinasMaisLocadas(),
            getReceitaPorPeriodo(),
            getAtividadesRecentes(),
          ]);

        setEstatisticas(estatisticasData);
        setMaquinasMaisLocadas(maquinasData);
        setReceitaPorPeriodo(receitaData);
        setAtividadesRecentes(atividadesData);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
        setError("Erro ao carregar dados do dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Total de Clientes
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {estatisticas.totalClientes}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Total de Máquinas
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {estatisticas.totalMaquinas}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Total de Locações
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {estatisticas.totalLocacoes}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Receita Total
          </h3>
          <p className="text-3xl font-bold text-green-600">
            R${" "}
            {estatisticas.receitaTotal.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Máquinas Mais Locadas
          </h3>
          <TopMachinesChart data={maquinasMaisLocadas} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Receita por Período
          </h3>
          <RevenueChart data={receitaPorPeriodo} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Atividades Recentes
          </h3>
          <RecentActivities atividades={atividadesRecentes} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Calendário
          </h3>
          <Calendar />
        </div>
      </div>
    </div>
  );
}
