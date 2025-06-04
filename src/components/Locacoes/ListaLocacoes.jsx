import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ListaLocacoes({
  locacoes,
  clientes,
  maquinas,
  onConcluir,
  onRenovar,
  onEditar,
}) {
  if (locacoes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center text-gray-500 mt-10"
      >
        Nenhuma locação ativa encontrada.
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {locacoes.map((locacao, index) => {
        const cliente = clientes.find((c) => c.id === locacao.clienteId);
        const maquina = maquinas.find((m) => m.id === locacao.maquinaId);

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
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              {/* Cabeçalho */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6 pb-6 border-b border-gray-100">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-800">
                    {maquina?.nome || "Máquina não encontrada"}
                  </h3>
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
                    {locacao.quantidade} unidade(s)
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

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onRenovar({ ...locacao, maquina: maquina })}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                >
                  <i className="bx bx-refresh text-lg"></i>
                  Renovar
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onConcluir(locacao)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                >
                  <i className="bx bx-check text-lg"></i>
                  Concluir
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
