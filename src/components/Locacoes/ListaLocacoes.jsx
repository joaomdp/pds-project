import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";

export default function ListaLocacoes({
  locacoes,
  clientes,
  maquinas,
  onConcluir,
  onRenovar,
  onEditar,
  onDeletar,
  onIniciarReserva,
  scrollToLocacao,
  scrollToRef,
  isReservas = false,
}) {
  const [locacaoDestacada, setLocacaoDestacada] = useState(null);

  useEffect(() => {
    if (scrollToLocacao) {
      setLocacaoDestacada(scrollToLocacao);
      // Remover o destaque após 3 segundos
      setTimeout(() => {
        setLocacaoDestacada(null);
      }, 3000);
    }
  }, [scrollToLocacao]);

  if (locacoes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center text-gray-500 mt-10"
      >
        {isReservas
          ? "Nenhuma reserva encontrada."
          : "Nenhuma locação ativa encontrada."}
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {locacoes.map((locacao, index) => {
        const cliente = clientes.find((c) => c.id === locacao.clienteId);
        const maquina = maquinas.find((m) => m.id === locacao.maquinaId);
        const isDestacada = locacaoDestacada === locacao.id;
        const isReserva = locacao.status === "reservada" || isReservas;

        return (
          <motion.div
            key={locacao.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: "easeOut",
            }}
            ref={isDestacada ? scrollToRef : null}
            className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
              isDestacada ? "ring-4 ring-green-400 shadow-2xl scale-[1.02]" : ""
            } ${isReserva ? "border-l-4 border-l-blue-500" : ""}`}
          >
            <div className="p-6">
              {/* Cabeçalho */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6 pb-6 border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      {Array.isArray(locacao.maquinas) &&
                      locacao.maquinas.length > 0
                        ? locacao.maquinas.map((m, idx) => {
                            const maquinaObj = maquinas.find(
                              (maq) => maq.id === m.maquinaId
                            );
                            return (
                              <span key={m.maquinaId || idx}>
                                {maquinaObj
                                  ? maquinaObj.nome
                                  : "Máquina não encontrada"}
                                {idx < locacao.maquinas.length - 1 ? ", " : ""}
                              </span>
                            );
                          })
                        : // fallback para locações antigas
                          (() => {
                            const maquina = maquinas.find(
                              (m) => m.id === locacao.maquinaId
                            );
                            return maquina?.nome || "Máquina não encontrada";
                          })()}
                    </h3>
                    {isReserva && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        <i className="bx bx-calendar-check"></i>
                        Reserva
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <i className="bx bx-user text-lg"></i>
                    <p>{cliente?.nome || "Cliente não encontrado"}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <i className="bx bx-map text-lg"></i>
                    <p className="text-sm">
                      {locacao.endereco || "Endereço não informado"}
                    </p>
                  </div>
                  {isReserva && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                      <i className="bx bx-info-circle"></i>
                      <p>
                        Máquina permanece disponível até a data de início da
                        reserva
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      locacao.pago === "sim"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {locacao.pago === "sim" ? "Pago" : "Não Pago"}
                  </span>
                  {isReserva && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      Reservada
                    </span>
                  )}
                </div>
              </div>

              {/* Informações da Locação */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Data Início</p>
                  <p className="font-semibold text-gray-800">
                    {format(
                      locacao.dataInicio instanceof Date
                        ? locacao.dataInicio
                        : locacao.dataInicio.toDate(),
                      "dd/MM/yyyy",
                      { locale: ptBR }
                    )}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Data Fim</p>
                  <p className="font-semibold text-gray-800">
                    {format(
                      locacao.dataFim instanceof Date
                        ? locacao.dataFim
                        : locacao.dataFim.toDate(),
                      "dd/MM/yyyy",
                      { locale: ptBR }
                    )}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Quantidade</p>
                  <p className="font-semibold text-gray-800">
                    {Array.isArray(locacao.maquinas) &&
                    locacao.maquinas.length > 0
                      ? locacao.maquinas
                          .map(
                            (m, idx) =>
                              `${m.quantidade || 1} unidade(s)${
                                locacao.maquinas.length > 1
                                  ? ` (${
                                      maquinas.find(
                                        (maq) => maq.id === m.maquinaId
                                      )?.nome || "Máquina não encontrada"
                                    })`
                                  : ""
                              }${idx < locacao.maquinas.length - 1 ? ", " : ""}`
                          )
                          .join("")
                      : `${locacao.quantidade || 1} unidade(s)`}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Valor Total</p>
                  <p className="font-semibold text-gray-800">
                    R$ {locacao.valorTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onEditar(locacao)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                >
                  <i className="bx bx-edit text-lg"></i>
                  Editar
                </motion.button>

                {!isReserva && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onRenovar({ ...locacao, maquina: maquina })}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    <i className="bx bx-refresh text-lg"></i>
                    Renovar
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDeletar(locacao)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                >
                  <i className="bx bx-trash text-lg"></i>
                  Excluir
                </motion.button>

                {!isReserva && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onConcluir(locacao)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <i className="bx bx-check text-lg"></i>
                      Concluir
                    </motion.button>
                  </>
                )}

                {isReserva &&
                  (() => {
                    // Verificar se as máquinas estão disponíveis
                    let maquinasIndisponiveis = [];

                    if (Array.isArray(locacao.maquinas)) {
                      for (const maquinaLocacao of locacao.maquinas) {
                        const maquina = maquinas.find(
                          (m) => m.id === maquinaLocacao.maquinaId
                        );
                        if (maquina) {
                          const quantidadeDisponivel =
                            maquina.quantidade -
                            (maquina.quantidadeLocada || 0);
                          if (
                            quantidadeDisponivel < maquinaLocacao.quantidade
                          ) {
                            maquinasIndisponiveis.push({
                              nome: maquina.nome,
                              solicitada: maquinaLocacao.quantidade,
                              disponivel: quantidadeDisponivel,
                            });
                          }
                        }
                      }
                    } else if (locacao.maquinaId) {
                      const maquina = maquinas.find(
                        (m) => m.id === locacao.maquinaId
                      );
                      if (maquina) {
                        const quantidadeDisponivel =
                          maquina.quantidade - (maquina.quantidadeLocada || 0);
                        if (quantidadeDisponivel < (locacao.quantidade || 1)) {
                          maquinasIndisponiveis.push({
                            nome: maquina.nome,
                            solicitada: locacao.quantidade || 1,
                            disponivel: quantidadeDisponivel,
                          });
                        }
                      }
                    }

                    const isDisabled = maquinasIndisponiveis.length > 0;
                    const tooltipText = isDisabled
                      ? `Máquinas indisponíveis:\n${maquinasIndisponiveis
                          .map(
                            (m) =>
                              `${m.nome}: ${m.solicitada} solicitadas, ${m.disponivel} disponíveis`
                          )
                          .join("\n")}`
                      : "";

                    return (
                      <motion.button
                        whileHover={!isDisabled ? { scale: 1.02 } : {}}
                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                        onClick={
                          !isDisabled
                            ? () => onIniciarReserva(locacao)
                            : undefined
                        }
                        disabled={isDisabled}
                        title={tooltipText}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-sm ${
                          isDisabled
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-md"
                        }`}
                      >
                        <i
                          className={`bx ${
                            isDisabled ? "bx-x" : "bx-play"
                          } text-lg`}
                        ></i>
                        {isDisabled ? "Indisponível" : "Iniciar Locação"}
                      </motion.button>
                    );
                  })()}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
