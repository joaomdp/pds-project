import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { motion } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip } from "react-tooltip";

export default function Calendar() {
  const [locacoes, setLocacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    setIsLoading(true);

    const locacoesQuery = query(
      collection(db, "locacoes"),
      where("status", "==", "ativa")
    );

    const unsubscribe = onSnapshot(
      locacoesQuery,
      (snapshot) => {
        const locacoesData = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (Array.isArray(data.maquinas) && data.maquinas.length > 0) {
            data.maquinas.forEach((m) => {
              locacoesData.push({
                id: doc.id + "-" + (m.maquinaId || m.nome || Math.random()),
                maquinaNome: m.maquinaNome || m.nome || "",
                clienteNome: data.clienteNome,
                dataInicio: data.dataInicio?.toDate(),
                dataFim: data.dataFim?.toDate(),
              });
            });
          } else {
            locacoesData.push({
              id: doc.id,
              maquinaNome: data.maquinaNome || "",
              clienteNome: data.clienteNome,
              dataInicio: data.dataInicio?.toDate(),
              dataFim: data.dataFim?.toDate(),
            });
          }
        });
        setLocacoes(locacoesData);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error("Erro ao carregar locações:", err);
        setError("Erro ao carregar locações");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getLocacoesDoDia = (date) => {
    return locacoes.filter((locacao) => {
      if (!locacao.dataInicio || !locacao.dataFim) return false;

      const dataInicio =
        locacao.dataInicio instanceof Date
          ? locacao.dataInicio
          : locacao.dataInicio.toDate();

      const dataFim =
        locacao.dataFim instanceof Date
          ? locacao.dataFim
          : locacao.dataFim.toDate();

      const dataAtual = new Date(date);

      dataInicio.setHours(0, 0, 0, 0);
      dataFim.setHours(23, 59, 59, 999);
      dataAtual.setHours(12, 0, 0, 0);

      return dataAtual >= dataInicio && dataAtual <= dataFim;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });

  const days = eachDayOfInterval({
    start,
    end,
  });

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <i className="bx bx-calendar text-2xl text-green-600" />
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <i className="bx bx-chevron-left text-2xl" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <i className="bx bx-chevron-right text-2xl" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {diasSemana.map((dia) => (
            <div
              key={dia}
              className="text-center text-sm font-semibold text-gray-600 py-2 bg-gray-50 rounded"
            >
              {dia}
            </div>
          ))}
          {days.map((day, index) => {
            const locacoesDoDia = getLocacoesDoDia(day);
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={`aspect-square p-1 ${
                  !isSameMonth(day, currentDate)
                    ? "text-gray-300"
                    : isToday(day)
                    ? "bg-green-50"
                    : ""
                }`}
              >
                <div
                  className={`h-full rounded-lg border p-2 transition-all duration-200 ${
                    locacoesDoDia.length > 0
                      ? "border-green-200 bg-green-50"
                      : "border-gray-100 hover:border-green-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-base font-medium ${
                        isToday(day) ? "text-green-600" : "text-gray-700"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {locacoesDoDia.length > 0 && (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {locacoesDoDia.length}
                      </span>
                    )}
                  </div>
                  {locacoesDoDia.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {locacoesDoDia.map((locacao, idx) => (
                        <div
                          key={idx}
                          className="relative text-xs bg-white text-green-800 px-2 py-1 rounded border border-green-100 truncate cursor-pointer"
                          data-tooltip-id="cliente-tooltip"
                          data-tooltip-content={
                            locacao.clienteNome || "Desconhecido"
                          }
                        >
                          {locacao.maquinaNome}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <Tooltip id="cliente-tooltip" place="top" />
    </div>
  );
}
