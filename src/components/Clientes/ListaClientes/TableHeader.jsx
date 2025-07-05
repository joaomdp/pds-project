import React from "react";

export default function TableHeader({ dadosVisiveis = true }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Nome
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Telefone
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          CPF
        </th>
        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Ações
        </th>
      </tr>
      {!dadosVisiveis && (
        <tr>
          <td
            colSpan="4"
            className="px-6 py-2 bg-yellow-50 border-t border-yellow-200"
          >
            <div className="flex items-center justify-center space-x-2 text-yellow-700 text-xs">
              <i className="bx bx-shield-check text-sm"></i>
              <span>Dados sensíveis estão ocultos por segurança</span>
            </div>
          </td>
        </tr>
      )}
    </thead>
  );
}
