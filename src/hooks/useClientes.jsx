import { useState, useEffect } from "react";
import {
  adicionarCliente,
  getClientes,
  atualizarCliente,
  excluirCliente,
} from "../services/clienteService";

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const clientesData = await getClientes();
        setClientes(clientesData);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    carregarClientes();
  }, []);

  const adicionarClienteHook = async (novoCliente) => {
    try {
      const clienteAdicionado = await adicionarCliente(novoCliente);
      setClientes((prev) => [...prev, clienteAdicionado]);
      return clienteAdicionado;
    } catch (err) {
      console.error("Erro ao adicionar cliente:", err);
      throw err;
    }
  };

  const editarCliente = async (id, dadosEditados) => {
    try {
      const clienteAtualizado = await atualizarCliente(id, dadosEditados);
      setClientes((prev) =>
        prev.map((cliente) => (cliente.id === id ? clienteAtualizado : cliente))
      );
      return clienteAtualizado;
    } catch (err) {
      console.error("Erro ao editar cliente:", err);
      throw err;
    }
  };

  const excluirClienteHook = async (id) => {
    try {
      await excluirCliente(id);
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      throw err;
    }
  };

  return {
    clientes,
    loading,
    error,
    addCliente: adicionarClienteHook,
    updateCliente: editarCliente,
    excluirCliente: excluirClienteHook,
  };
}
