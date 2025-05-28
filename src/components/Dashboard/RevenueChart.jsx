import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function RevenueChart() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const locacoesQuery = query(
          collection(db, "locacoes"),
          where("status", "==", "concluida")
        );
        const locacoesSnapshot = await getDocs(locacoesQuery);

        const meses = Array.from({ length: 6 }, (_, i) => {
          const date = subMonths(new Date(), i);
          return {
            mes: format(date, "MMM yyyy", { locale: ptBR }),
            dataInicio: startOfMonth(date),
            dataFim: endOfMonth(date),
            valor: 0,
          };
        }).reverse();

        locacoesSnapshot.forEach((doc) => {
          const locacao = doc.data();
          const dataConclusao = locacao.dataConclusao?.toDate();
          const valor = locacao.valorTotal || 0;

          if (dataConclusao) {
            const mesIndex = meses.findIndex(
              (mes) =>
                dataConclusao >= mes.dataInicio && dataConclusao <= mes.dataFim
            );
            if (mesIndex !== -1) {
              meses[mesIndex].valor += valor;
            }
          }
        });

        setChartData(meses);
      } catch (err) {
        console.error("Erro ao buscar receita:", err);
        setError("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  const chartConfig = {
    labels: chartData.map((item) => item.mes),
    datasets: [
      {
        label: "Receita (R$)",
        data: chartData.map((item) => item.valor),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgb(34, 197, 94)",
        tension: 0.4,
        fill: true,
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
            const value = context.raw;
            return `Receita: R$ ${value.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `R$ ${value.toLocaleString("pt-BR")}`,
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
        Nenhuma receita encontrada
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="h-64">
        <Line data={chartConfig} options={options} />
      </div>
    </div>
  );
}
