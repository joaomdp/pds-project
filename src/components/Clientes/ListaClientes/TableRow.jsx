import React from "react";
import { motion } from "framer-motion";
import ActionButton from "./ActionButton";

const TableRow = ({
  cliente,
  isEditing,
  dadosEditados,
  onInputChange,
  onEditar,
  onExcluir,
  onSalvar,
  onCancelar,
}) => {
  const formatarTelefone = (value) => {
    const numbers = value.toString().replace(/\D/g, "");
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const formatarCPF = (value) => {
    const numbers = value.toString().replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const renderCell = (field, type = "text") => {
    if (isEditing) {
      return (
        <input
          type={type}
          name={field}
          value={dadosEditados[field] || ""}
          onChange={onInputChange}
          className="border border-gray-300 rounded-md px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      );
    }

    if (field === "telefone") {
      return formatarTelefone(cliente[field]);
    }

    if (field === "cpf") {
      return formatarCPF(cliente[field]);
    }

    return cliente[field];
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="hover:bg-gray-50 transition-colors"
    >
      <td className="px-6 py-4 text-sm font-mono text-gray-700">
        {cliente.id}
      </td>
      <td className="px-6 py-4 text-sm text-gray-800">{renderCell("nome")}</td>
      <td className="px-6 py-4 text-sm text-gray-800">
        {renderCell("email", "email")}
      </td>
      <td className="px-6 py-4 text-sm text-gray-800">
        {renderCell("telefone")}
      </td>
      <td className="px-6 py-4 text-sm text-gray-800">{renderCell("cpf")}</td>
      <td className="px-6 py-4 flex flex-wrap gap-2">
        {isEditing ? (
          <>
            <ActionButton onClick={onSalvar} variant="primary">
              Salvar
            </ActionButton>
            <ActionButton onClick={onCancelar} variant="secondary">
              Cancelar
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton onClick={() => onEditar(cliente)} variant="success">
              Editar
            </ActionButton>
            <ActionButton
              onClick={() => onExcluir(cliente.id)}
              variant="danger"
            >
              Excluir
            </ActionButton>
          </>
        )}
      </td>
    </motion.tr>
  );
};

export default TableRow;
