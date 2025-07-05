import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TopMachinesChart() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchTopMachines = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const locacoesQuery = query(
          collection(db, "locacoes"),
          where("status", "==", "concluida")
        );
        const locacoesSnapshot = await getDocs(locacoesQuery);

        const maquinasCount = {};
        locacoesSnapshot.forEach((doc) => {
          const locacao = doc.data();
          if (Array.isArray(locacao.maquinas) && locacao.maquinas.length > 0) {
            locacao.maquinas.forEach((m) => {
              if (!m.maquinaId) return;
              if (!maquinasCount[m.maquinaId]) {
                maquinasCount[m.maquinaId] = {
                  id: m.maquinaId,
                  nome: m.maquinaNome || m.nome || "Máquina não encontrada",
                  quantidade: 0,
                };
              }
              maquinasCount[m.maquinaId].quantidade += m.quantidade
                ? Number(m.quantidade)
                : 1;
            });
          } else if (locacao.maquinaId) {
            if (!maquinasCount[locacao.maquinaId]) {
              maquinasCount[locacao.maquinaId] = {
                id: locacao.maquinaId,
                nome: locacao.maquinaNome || "Máquina não encontrada",
                quantidade: 0,
              };
            }
            maquinasCount[locacao.maquinaId].quantidade += 1;
          }
        });

        const topMachines = Object.values(maquinasCount)
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5);

        setChartData(topMachines);
      } catch (err) {
        console.error("Erro ao buscar máquinas mais locadas:", err);
        setError("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopMachines();
  }, []);

  const chartConfig = {
    labels: chartData.map((item) => item.nome),
    datasets: [
      {
        label: "Quantidade de Locações",
        data: chartData.map((item) => item.quantidade),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "rgb(255, 255, 255)",
        bodyColor: "rgb(255, 255, 255)",
        borderColor: "rgba(17, 24, 39, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function (context) {
            return context[0].label;
          },
          label: function (context) {
            return `Locações: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          font: {
            size: 10,
            weight: "500",
          },
          maxRotation: 45,
          minRotation: 0,
          padding: 5,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
          borderDash: [5, 5],
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          font: {
            size: 12,
          },
          stepSize: 1,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-2">
            Máquinas Mais Locadas
          </h2>
          <p className="text-gray-500 text-sm">
            Top 5 máquinas com mais locações
          </p>
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-2">
            Máquinas Mais Locadas
          </h2>
          <p className="text-gray-500 text-sm">
            Top 5 máquinas com mais locações
          </p>
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-2">
              Erro ao carregar dados
            </p>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-2">
            Máquinas Mais Locadas
          </h2>
          <p className="text-gray-500 text-sm">
            Top 5 máquinas com mais locações
          </p>
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-2">
              Nenhuma locação encontrada
            </p>
            <p className="text-gray-500 text-sm">
              Não há dados de locações concluídas
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-2">
          Máquinas Mais Locadas
        </h2>
        <p className="text-gray-500 text-sm">
          Top 5 máquinas com mais locações
        </p>
      </div>

      <div className="h-96">
        <Bar data={chartConfig} options={options} />
      </div>
    </div>
  );
}
