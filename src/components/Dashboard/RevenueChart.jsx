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
  Filler,
} from "chart.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RevenueChart() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [availableMonths, setAvailableMonths] = useState([]);

  // Gerar lista de meses disponíveis (últimos 12 meses)
  useEffect(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      months.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy", { locale: ptBR }),
        date: date,
      });
    }
    setAvailableMonths(months);
  }, []);

  const generatePDF = async () => {
    try {
      console.log("Iniciando geração do PDF...");

      // Verificar se há dados
      if (!chartData || chartData.length === 0) {
        alert("Não há dados para gerar o relatório. Selecione outro período.");
        return;
      }

      // Criar documento A4
      const doc = new jsPDF();
      const selectedDate = parseISO(selectedMonth + "-01");
      const mesSelecionado = format(selectedDate, "MMMM yyyy", {
        locale: ptBR,
      });

      // Configurações de página
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Cabeçalho
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, pageWidth, 40, "F");

      // Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, "bold");
      doc.text("RELATÓRIO DE FATURAMENTO", pageWidth / 2, 20, {
        align: "center",
      });

      // Subtítulo
      doc.setFontSize(14);
      doc.setFont(undefined, "normal");
      doc.text(mesSelecionado.toUpperCase(), pageWidth / 2, 32, {
        align: "center",
      });

      // Informações do relatório
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(
        `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
        margin,
        55
      );
      doc.text(`Período analisado: ${mesSelecionado}`, margin, 62);

      // Calcular estatísticas
      const totalReceita = chartData.reduce(
        (sum, item) => sum + (item.valor || 0),
        0
      );

      // Tabela de dados
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("DETALHAMENTO MENSAL", margin, 85);

      // Cabeçalho da tabela
      doc.setFillColor(34, 197, 94);
      doc.rect(margin, 90, contentWidth, 12, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Mês", margin + 8, 98);
      doc.text("Receita (R$)", margin + 120, 98);
      doc.text("Status", margin + 220, 98);

      // Dados da tabela
      let yPosition = 107;
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      doc.setFont(undefined, "normal");

      chartData.forEach((item, index) => {
        // Linha de dados
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, yPosition - 4, contentWidth, 10, "F");
        }

        const status = item.valor > 0 ? "Ativo" : "Sem dados";

        doc.text(item.mes, margin + 8, yPosition);
        doc.text(
          `R$ ${item.valor.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}`,
          margin + 120,
          yPosition
        );

        // Status com cor
        if (status === "Ativo") {
          doc.setTextColor(34, 197, 94);
        } else {
          doc.setTextColor(156, 163, 175);
        }
        doc.text(status, margin + 220, yPosition);
        doc.setTextColor(50, 50, 50);

        yPosition += 10;
      });

      // Linha do total
      doc.setFillColor(34, 197, 94);
      doc.rect(margin, yPosition - 4, contentWidth, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont(undefined, "bold");
      doc.text("TOTAL", margin + 8, yPosition + 2);
      doc.text(
        `R$ ${totalReceita.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`,
        margin + 120,
        yPosition + 2
      );
      doc.text(
        `${chartData.filter((item) => item.valor > 0).length} meses`,
        margin + 220,
        yPosition + 2
      );

      // Rodapé
      yPosition += 25;
      doc.setFillColor(248, 250, 252);
      doc.rect(0, yPosition, pageWidth, 30, "F");

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text(
        "Este relatório foi gerado automaticamente pelo sistema de gestão.",
        pageWidth / 2,
        yPosition + 10,
        { align: "center" }
      );
      doc.text(
        "Para dúvidas ou sugestões, entre em contato com a equipe de suporte.",
        pageWidth / 2,
        yPosition + 17,
        { align: "center" }
      );

      // Salvar
      const fileName = `relatorio-faturamento-${mesSelecionado
        .toLowerCase()
        .replace(/\s+/g, "-")}.pdf`;
      doc.save(fileName);

      console.log("PDF gerado com sucesso:", fileName);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert(`Erro ao gerar o relatório: ${err.message}`);
    }
  };

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const selectedDate = parseISO(selectedMonth + "-01");
        const endDate = endOfMonth(selectedDate);

        // Criar dados para o gráfico (últimos 6 meses incluindo o selecionado)
        const meses = [];
        for (let i = 5; i >= 0; i--) {
          const date = subMonths(selectedDate, i);
          meses.push({
            mes: format(date, "MMM yyyy", { locale: ptBR }),
            dataInicio: startOfMonth(date),
            dataFim: endOfMonth(date),
            valor: 0,
          });
        }

        // Buscar dados dos últimos 6 meses para comparação
        const seisMesesAtras = subMonths(selectedDate, 5);

        try {
          // Buscar apenas locações concluídas
          const locacoesQuery = query(
            collection(db, "locacoes"),
            where("status", "==", "concluida")
          );

          const locacoesSnapshot = await getDocs(locacoesQuery);

          // Filtrar localmente por data
          const locacoesFiltradas = [];
          locacoesSnapshot.forEach((doc) => {
            const locacao = doc.data();
            let dataConclusao = null;
            let valorTotal = 0;

            // Tratar diferentes formatos de data
            if (locacao.dataConclusao) {
              if (locacao.dataConclusao.toDate) {
                dataConclusao = locacao.dataConclusao.toDate();
              } else if (locacao.dataConclusao instanceof Date) {
                dataConclusao = locacao.dataConclusao;
              } else if (typeof locacao.dataConclusao === "string") {
                dataConclusao = new Date(locacao.dataConclusao);
              } else if (locacao.dataConclusao.seconds) {
                dataConclusao = new Date(locacao.dataConclusao.seconds * 1000);
              }
            }

            // Tratar diferentes formatos de valor
            if (
              locacao.valorTotal !== undefined &&
              locacao.valorTotal !== null
            ) {
              valorTotal = parseFloat(locacao.valorTotal) || 0;
            }

            if (
              dataConclusao &&
              !isNaN(dataConclusao.getTime()) &&
              dataConclusao >= startOfMonth(seisMesesAtras) &&
              dataConclusao <= endDate
            ) {
              locacoesFiltradas.push({
                dataConclusao,
                valorTotal,
              });
            }
          });

          // Preencher dados dos meses
          locacoesFiltradas.forEach((locacao) => {
            const dataConclusao = locacao.dataConclusao;
            const valor = locacao.valorTotal;

            const mesIndex = meses.findIndex(
              (mes) =>
                dataConclusao >= mes.dataInicio && dataConclusao <= mes.dataFim
            );
            if (mesIndex !== -1) {
              meses[mesIndex].valor += valor;
            }
          });
        } catch (firestoreError) {
          console.error("Erro na consulta Firestore:", firestoreError);
          setError(`Erro na consulta: ${firestoreError.message}`);
          return;
        }

        setChartData(meses);
      } catch (err) {
        console.error("Erro ao buscar receita:", err);
        setError(`Erro ao carregar dados: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenue();
  }, [selectedMonth]);

  const chartConfig = {
    labels: chartData.map((item) => item.mes),
    datasets: [
      {
        label: "Receita (R$)",
        data: chartData.map((item) => item.valor),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "rgb(255, 255, 255)",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          font: {
            size: 12,
          },
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
          callback: (value) => `R$ ${value.toLocaleString("pt-BR")}`,
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
            Faturamento
          </h2>
          <p className="text-gray-500 text-sm">Análise de receita mensal</p>
        </div>
        <div className="flex justify-center items-center h-80">
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
            Faturamento
          </h2>
          <p className="text-gray-500 text-sm">Análise de receita mensal</p>
        </div>
        <div className="flex justify-center items-center h-80">
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

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-2">
            Faturamento
          </h2>
          <p className="text-gray-500 text-sm">Análise de receita mensal</p>
        </div>
        <div className="flex justify-center items-center h-80">
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
              Nenhuma receita encontrada
            </p>
            <p className="text-gray-500 text-sm">
              Selecione outro período para visualizar os dados
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-2">Faturamento</h2>
        <p className="text-gray-500 text-sm mb-6">Análise de receita mensal</p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Período</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 text-sm font-medium"
            >
              {availableMonths.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={generatePDF}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 w-fit"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Exportar
          </button>
        </div>
      </div>

      <div className="h-80">
        <Line data={chartConfig} options={options} />
      </div>
    </div>
  );
}
