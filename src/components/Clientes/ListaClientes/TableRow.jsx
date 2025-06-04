import React from "react";

export default function TableRow({
  cliente,
  isEditing,
  dadosEditados,
  onInputChange,
  onEditar,
  onExcluir,
  onSalvar,
  onCancelar,
}) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="text"
            name="nome"
            value={dadosEditados.nome || ""}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        ) : (
          <div className="text-sm font-medium text-gray-900">
            {cliente.nome}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="tel"
            name="telefone"
            value={dadosEditados.telefone || ""}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        ) : (
          <div className="text-sm text-gray-500">{cliente.telefone}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="text"
            name="cpf"
            value={dadosEditados.cpf || ""}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        ) : (
          <div className="text-sm text-gray-500">{cliente.cpf}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {isEditing ? (
          <div className="flex justify-end space-x-2">
            <button
              onClick={onSalvar}
              className="text-green-600 hover:text-green-900"
            >
              <i className="bx bx-check text-xl"></i>
            </button>
            <button
              onClick={onCancelar}
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="bx bx-x text-xl"></i>
            </button>
          </div>
        ) : (
          <div className="flex justify-end space-x-2">
            <button
              onClick={onEditar}
              className="text-blue-600 hover:text-blue-900"
            >
              <i className="bx bx-edit text-xl"></i>
            </button>
            <button
              onClick={onExcluir}
              className="text-red-600 hover:text-red-900"
            >
              <i className="bx bx-trash text-xl"></i>
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
