import { useState } from "react";
import { motion } from "framer-motion";
import TableHeader from "./ListaClientes/TableHeader";
import TableRow from "./ListaClientes/TableRow";

export default function ListaClientes({ clientes, onEditar, onExcluir }) {
  const [clienteEditando, setClienteEditando] = useState(null);
  const [dadosEditados, setDadosEditados] = useState({});

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-x-auto bg-white rounded-xl shadow-lg"
    >
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader />
        <tbody className="bg-white divide-y divide-gray-100">
          {clientes.map((cliente) => (
            <TableRow
              key={cliente.id}
              cliente={cliente}
              isEditing={clienteEditando === cliente.id}
              dadosEditados={dadosEditados}
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
  );
}
