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
          const maquinaId = locacao.maquinaId;
          const maquinaNome = locacao.maquinaNome;
          if (maquinaId) {
            if (!maquinasCount[maquinaId]) {
              maquinasCount[maquinaId] = {
                id: maquinaId,
                nome: maquinaNome,
                quantidade: 0,
              };
            }
            maquinasCount[maquinaId].quantidade += 1;
          }
        });

        const topMachines = Object.values(maquinasCount)
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 2);

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
        label: "Quantidade de Locações Concluídas",
        data: chartData.map((item) => item.quantidade),
        backgroundColor: "rgb(34, 197, 94)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const dataIndex = context.dataIndex;
            const machine = chartData[dataIndex];
            return [
              `Máquina: ${machine.nome}`,
              `Locações: ${machine.quantidade}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Nenhuma locação concluída encontrada
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="h-64">
        <Bar data={chartConfig} options={options} />
      </div>
    </div>
  );
}
