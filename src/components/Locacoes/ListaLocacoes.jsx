import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ListaLocacoes({
  locacoes,
  clientes,
  maquinas,
  onConcluir,
  onRenovar,
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
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {maquina?.nome || "Máquina não encontrada"}
                  </h3>
                  <p className="text-gray-600">
                    Cliente: {cliente?.nome || "Cliente não encontrado"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Endereço: {locacao.endereco || "Endereço não informado"}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <p>Data Início:</p>
                      <p className="font-medium text-gray-700">
                        {format(
                          locacao.dataInicio instanceof Date
                            ? locacao.dataInicio
                            : locacao.dataInicio.toDate(),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}
                      </p>
                    </div>
                    <div>
                      <p>Data Fim:</p>
                      <p className="font-medium text-gray-700">
                        {format(
                          locacao.dataFim instanceof Date
                            ? locacao.dataFim
                            : locacao.dataFim.toDate(),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}
                      </p>
                    </div>
                    <div>
                      <p>Quantidade:</p>
                      <p className="font-medium text-gray-700">
                        {locacao.quantidade} unidade(s)
                      </p>
                    </div>
                    <div>
                      <p>Valor Total:</p>
                      <p className="font-medium text-gray-700">
                        R$ {locacao.valorTotal.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p>Status de Pagamento:</p>
                      <p
                        className={`font-medium ${
                          locacao.pago === "sim"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {locacao.pago === "sim" ? "Pago" : "Não Pago"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      onRenovar({
                        ...locacao,
                        maquina: maquina,
                      })
                    }
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="bx bx-refresh text-xl"></i>
                    Renovar Locação
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onConcluir(locacao)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="bx bx-check text-xl"></i>
                    Concluir Locação
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
