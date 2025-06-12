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
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  getMonth,
  getYear,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const checkButtonStatus = () => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const isFirstWeekOfMonth = dayOfMonth <= 5; // Permite até o dia 5 do mês

    // Verifica se o PDF já foi gerado neste mês
    const currentMonth = getMonth(today);
    const currentYear = getYear(today);
    const lastGeneratedMonth = localStorage.getItem("lastGeneratedMonth");
    const lastGeneratedYear = localStorage.getItem("lastGeneratedYear");

    const isNewMonth =
      !lastGeneratedMonth ||
      parseInt(lastGeneratedMonth) !== currentMonth ||
      parseInt(lastGeneratedYear) !== currentYear;

    setIsButtonEnabled(isFirstWeekOfMonth && isNewMonth);
  };

  useEffect(() => {
    checkButtonStatus();
    // Verificar status do botão a cada dia
    const interval = setInterval(checkButtonStatus, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      const today = new Date();
      const mesAtual = format(today, "MMMM yyyy", { locale: ptBR });

      // Título
      doc.setFontSize(16);
      doc.text(`Relatório de Faturamento - ${mesAtual}`, 14, 15);

      // Dados da tabela
      const tableData = chartData.map((item) => [
        item.mes,
        `R$ ${item.valor.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`,
      ]);

      doc.autoTable({
        startY: 25,
        head: [["Mês", "Valor"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [34, 197, 94] },
      });

      // Salvar o PDF
      doc.save(`faturamento-${mesAtual}.pdf`);

      // Salvar a data da última geração
      localStorage.setItem("lastGeneratedMonth", getMonth(today).toString());
      localStorage.setItem("lastGeneratedYear", getYear(today).toString());
      setPdfGenerated(true);
      setIsButtonEnabled(false);

      // Resetar os valores após gerar o PDF
      const locacoesRef = collection(db, "locacoes");
      const locacoesQuery = query(
        locacoesRef,
        where("status", "==", "concluida"),
        where("dataConclusao", ">=", startOfMonth(today)),
        where("dataConclusao", "<=", endOfMonth(today))
      );

      const locacoesSnapshot = await getDocs(locacoesQuery);
      const batch = db.batch();

      locacoesSnapshot.forEach((doc) => {
        const locacaoRef = doc.ref;
        batch.update(locacaoRef, { valorTotal: 0 });
      });

      await batch.commit();

      // Atualizar o estado local
      setChartData((prevData) =>
        prevData.map((item) => ({
          ...item,
          valor: item.mes === mesAtual ? 0 : item.valor,
        }))
      );
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      setError("Erro ao gerar relatório");
    }
  };

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Faturamento Mensal</h2>
        <button
          onClick={generatePDF}
          disabled={!isButtonEnabled}
          className={`px-4 py-2 rounded-lg ${
            isButtonEnabled
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } transition-colors`}
        >
          {isButtonEnabled
            ? "Gerar Relatório PDF"
            : pdfGenerated
            ? "Relatório já gerado este mês"
            : "Aguarde os primeiros dias do mês"}
        </button>
      </div>
      <div className="h-64">
        <Line data={chartConfig} options={options} />
      </div>
    </div>
  );
}
