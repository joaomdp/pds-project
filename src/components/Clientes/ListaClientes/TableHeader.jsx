import React from "react";

const TableHeader = () => (
  <thead className="bg-gray-100">
    <tr>
      {["Cliente ID", "Nome", "Email", "Telefone", "CPF", "Ações"].map(
        (col) => (
          <th
            key={col}
            className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            {col}
          </th>
        )
      )}
    </tr>
  </thead>
);

export default TableHeader;
