import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TableHeader from "./ListaClientes/TableHeader";
import TableRow from "./ListaClientes/TableRow";

export default function ListaClientes({
  clientes,
  onEditar,
  onExcluir,
  dadosVisiveis,
}) {
  const [clienteEditando, setClienteEditando] = useState(null);
  const [dadosEditados, setDadosEditados] = useState({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const clientesPorPagina = 10;

  const handleEditar = (cliente) => {
    setClienteEditando(cliente.id);
    setDadosEditados({ ...cliente });
  };

  const handleCancelarEdicao = () => {
    setClienteEditando(null);
    setDadosEditados({});
  };

  const handleSalvarEdicao = () => {
    if (!clienteEditando || !dadosEditados) return;
    onEditar(clienteEditando, dadosEditados);
    setClienteEditando(null);
    setDadosEditados({});
  };

  const handleExcluir = (id) => {
    if (!id) return;
    onExcluir(id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDadosEditados((prev) => ({ ...prev, [name]: value }));
  };

  // Calcular paginação
  const totalPaginas = Math.ceil(clientes.length / clientesPorPagina);
  const indiceInicio = (paginaAtual - 1) * clientesPorPagina;
  const indiceFim = indiceInicio + clientesPorPagina;
  const clientesPaginados = clientes
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    .slice(indiceInicio, indiceFim);

  const irParaPagina = (pagina) => {
    setPaginaAtual(pagina);
  };

  const irParaProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const irParaPaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  if (clientes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-500 mt-10"
      >
        Nenhum cliente encontrado.
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Tabela de clientes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={paginaAtual}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-x-auto bg-white rounded-lg border border-gray-100"
        >
          <table className="min-w-full table-fixed w-full">
            <TableHeader dadosVisiveis={dadosVisiveis} />
            <tbody>
              {clientesPaginados.map((cliente) => (
                <TableRow
                  key={`${cliente.id}-${dadosVisiveis}-${paginaAtual}`}
                  cliente={cliente}
                  isEditing={clienteEditando === cliente.id}
                  dadosEditados={dadosEditados}
                  dadosVisiveis={dadosVisiveis}
                  onInputChange={handleInputChange}
                  onEditar={() => handleEditar(cliente)}
                  onExcluir={() => handleExcluir(cliente.id)}
                  onSalvar={handleSalvarEdicao}
                  onCancelar={handleCancelarEdicao}
                />
              ))}
            </tbody>
          </table>
        </motion.div>
      </AnimatePresence>

      {/* Controles de paginação */}
      {totalPaginas > 1 && (
        <div className="py-4">
          <div className="text-sm text-gray-600 text-left mb-2">
            {indiceInicio + 1}-{Math.min(indiceFim, clientes.length)} de{" "}
            {clientes.length}
          </div>
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={irParaPaginaAnterior}
              disabled={paginaAtual === 1}
              className={`p-2 rounded ${
                paginaAtual === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <i className="bx bx-chevron-left"></i>
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPaginas }, (_, index) => {
                const numeroPagina = index + 1;
                const isAtual = numeroPagina === paginaAtual;
                if (
                  numeroPagina === 1 ||
                  numeroPagina === totalPaginas ||
                  (numeroPagina >= paginaAtual - 1 &&
                    numeroPagina <= paginaAtual + 1)
                ) {
                  return (
                    <button
                      key={numeroPagina}
                      onClick={() => irParaPagina(numeroPagina)}
                      className={`px-2 py-1 rounded text-xs ${
                        isAtual
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {numeroPagina}
                    </button>
                  );
                } else if (
                  numeroPagina === paginaAtual - 2 ||
                  numeroPagina === paginaAtual + 2
                ) {
                  return (
                    <span key={numeroPagina} className="px-1">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={irParaProximaPagina}
              disabled={paginaAtual === totalPaginas}
              className={`p-2 rounded ${
                paginaAtual === totalPaginas
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <i className="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
