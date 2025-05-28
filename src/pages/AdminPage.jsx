import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocações } from "../hooks/useLocações";
import { useMaquinas } from "../hooks/useMaquinas";
import { useClientes } from "../hooks/useClientes";
import { useCategorias } from "../hooks/useCategorias";
import { useDashboard } from "../hooks/useDashboard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { locações, loading: loadingLocações } = useLocações();
  const { maquinas, loading: loadingMaquinas } = useMaquinas();
  const { clientes, loading: loadingClientes } = useClientes();
  const { categorias, loading: loadingCategorias } = useCategorias();
  const { dashboardData } = useDashboard();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleDevolverMaquina = async (locação) => {
    try {
      console.log("Devolvendo máquina:", locação);
    } catch (error) {
      console.error("Erro ao devolver máquina:", error);
    }
  };

  const handleExcluirMaquina = async (maquinaId) => {
    try {
      console.log("Excluindo máquina:", maquinaId);
    } catch (error) {
      console.error("Erro ao excluir máquina:", error);
    }
  };

  const handleExcluirCliente = async (clienteId) => {
    try {
      console.log("Excluindo cliente:", clienteId);
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    }
  };

  const handleExcluirCategoria = async (categoriaId) => {
    try {
      console.log("Excluindo categoria:", categoriaId);
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Total de Locações
            </h3>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="bx bx-calendar-check text-2xl text-green-600"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {dashboardData?.totalLocações || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Receita Total
            </h3>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="bx bx-dollar text-2xl text-blue-600"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            R$ {dashboardData?.receitaTotal?.toFixed(2) || "0.00"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Máquinas Ativas
            </h3>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="bx bx-wrench text-2xl text-purple-600"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {dashboardData?.maquinasAtivas || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Clientes Ativos
            </h3>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="bx bx-user text-2xl text-orange-600"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {dashboardData?.clientesAtivos || 0}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Receita por Período
          </h3>
          {dashboardData?.receitaPorPeriodo && (
            <Bar
              data={{
                labels: dashboardData.receitaPorPeriodo.map((item) =>
                  format(new Date(item.periodo), "MMM/yy", { locale: ptBR })
                ),
                datasets: [
                  {
                    label: "Receita",
                    data: dashboardData.receitaPorPeriodo.map(
                      (item) => item.valor
                    ),
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    borderColor: "rgb(34, 197, 94)",
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) =>
                        `R$ ${value.toLocaleString("pt-BR")}`,
                    },
                  },
                },
              }}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Máquinas Mais Locadas
          </h3>
          <div className="space-y-4">
            {dashboardData?.maquinasMaisLocadas?.map((maquina, index) => (
              <div
                key={maquina.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{maquina.nome}</p>
                    <p className="text-sm text-gray-500">{maquina.categoria}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    {maquina.totalLocações} locações
                  </p>
                  <p className="text-sm text-gray-500">
                    R$ {maquina.receitaTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Atividades Recentes
        </h3>
        <div className="space-y-4">
          {dashboardData?.atividadesRecentes?.map((atividade) => (
            <div
              key={atividade.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    atividade.tipo === "locação"
                      ? "bg-green-100"
                      : atividade.tipo === "devolução"
                      ? "bg-blue-100"
                      : "bg-purple-100"
                  }`}
                >
                  <i
                    className={`bx ${
                      atividade.tipo === "locação"
                        ? "bx-calendar-check text-green-600"
                        : atividade.tipo === "devolução"
                        ? "bx-calendar-x text-blue-600"
                        : "bx-wrench text-purple-600"
                    } text-xl`}
                  ></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {atividade.descricao}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(atividade.data), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">
                  R$ {atividade.valor.toFixed(2)}
                </p>
                <p
                  className={`text-sm ${
                    atividade.status === "concluída"
                      ? "text-green-600"
                      : atividade.status === "pendente"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {atividade.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderLocações = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Locações</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Máquina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingLocações ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Carregando locações...</span>
                    </div>
                  </td>
                </tr>
              ) : locações.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Nenhuma locação encontrada
                  </td>
                </tr>
              ) : (
                locações.map((locação) => (
                  <tr key={locação.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {locação.cliente?.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {locação.cliente?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {locação.maquina?.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {locação.maquina?.categoria}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(locação.dataInicio), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(locação.dataFim), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        R$ {locação.valorTotal.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          locação.status === "concluída"
                            ? "bg-green-100 text-green-800"
                            : locação.status === "pendente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {locação.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDevolverMaquina(locação)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Devolver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMaquinas = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Máquinas</h2>
        <button
          onClick={() => navigate("/admin/maquinas/nova")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Nova Máquina
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingMaquinas ? (
          <div className="col-span-full text-center py-8">
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500">Carregando máquinas...</span>
            </div>
          </div>
        ) : maquinas.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhuma máquina cadastrada
          </div>
        ) : (
          maquinas.map((maquina) => (
            <motion.div
              key={maquina.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="aspect-video bg-gray-100">
                {maquina.imagemUrl ? (
                  <img
                    src={maquina.imagemUrl}
                    alt={maquina.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="bx bx-image text-4xl text-gray-400"></i>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {maquina.nome}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {maquina.categoria}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    R$ {maquina.valorDiaria}/dia
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      maquina.disponivel
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {maquina.disponivel ? "Disponível" : "Indisponível"}
                  </span>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 flex justify-end gap-2">
                <button
                  onClick={() => navigate(`/admin/maquinas/${maquina.id}`)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleExcluirMaquina(maquina.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const renderClientes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button
          onClick={() => navigate("/admin/clientes/novo")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingClientes ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Carregando clientes...</span>
                    </div>
                  </td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Nenhum cliente cadastrado
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {cliente.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cliente.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cliente.telefone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cliente.totalLocações || 0} locações
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() =>
                          navigate(`/admin/clientes/${cliente.id}`)
                        }
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluirCliente(cliente.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCategorias = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Categorias</h2>
        <button
          onClick={() => navigate("/admin/categorias/nova")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingCategorias ? (
          <div className="col-span-full text-center py-8">
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500">Carregando categorias...</span>
            </div>
          </div>
        ) : categorias.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhuma categoria cadastrada
          </div>
        ) : (
          categorias.map((categoria) => (
            <motion.div
              key={categoria.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {categoria.nome}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/admin/categorias/${categoria.id}`)
                    }
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <i className="bx bx-edit text-xl"></i>
                  </button>
                  <button
                    onClick={() => handleExcluirCategoria(categoria.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <i className="bx bx-trash text-xl"></i>
                  </button>
                </div>
              </div>
              <p className="text-gray-500 mb-4">{categoria.descricao}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{categoria.totalMaquinas || 0} máquinas</span>
                <span>{categoria.totalLocações || 0} locações</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">
                  Sistema de Locações
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <i className="bx bx-log-out text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "dashboard"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("locações")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "locações"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Locações
          </button>
          <button
            onClick={() => setActiveTab("maquinas")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "maquinas"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Máquinas
          </button>
          <button
            onClick={() => setActiveTab("clientes")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "clientes"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => setActiveTab("categorias")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "categorias"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Categorias
          </button>
        </div>

        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "locações" && renderLocações()}
        {activeTab === "maquinas" && renderMaquinas()}
        {activeTab === "clientes" && renderClientes()}
        {activeTab === "categorias" && renderCategorias()}
      </div>
    </div>
  );
}
