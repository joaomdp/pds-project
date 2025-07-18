import { useState } from "react";
import { useClientes } from "../../hooks/useClientes";
import ListaClientes from "./ListaClientes";
import AddClienteModal from "./AddClienteModal";
import EditClienteModal from "./EditClienteModal";
import ConfirmacaoModal from "./ConfirmacaoModal";
import { registrarAtividade } from "../../utils/atividades";

export default function ClientesProvider({ termoBusca }) {
  const {
    clientes,
    loading,
    error,
    addCliente,
    updateCliente,
    excluirCliente,
  } = useClientes();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);
  const [erroAdicao, setErroAdicao] = useState(null);
  const [acaoPendente, setAcaoPendente] = useState(null);
  const [dadosVisiveis, setDadosVisiveis] = useState(false);
  const toggleDadosVisiveis = () => setDadosVisiveis((v) => !v);

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const handleAddCliente = async (clienteData) => {
    try {
      setErroAdicao(null);
      await addCliente(clienteData);
      setIsAddModalOpen(false);

      await registrarAtividade("cliente_criado", {
        clienteNome: clienteData.nome,
      });
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      setErroAdicao(error.message || "Erro ao adicionar cliente");
      throw error;
    }
  };

  const handleEditarCliente = async (id, clienteData) => {
    try {
      setClienteEditando({ id, ...clienteData });
      setAcaoPendente(() => async () => {
        await updateCliente(id, clienteData);
        setIsEditModalOpen(false);
        setClienteEditando(null);

        await registrarAtividade("cliente_editado", {
          clienteNome: clienteData.nome,
        });
      });
      setShowConfirmacao(true);
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
      throw error;
    }
  };

  const handleExcluirCliente = async (id) => {
    try {
      const cliente = clientes.find((c) => c.id === id);
      if (!cliente) {
        throw new Error("Cliente não encontrado");
      }

      setClienteParaExcluir(id);
      setAcaoPendente(() => async () => {
        await excluirCliente(id);
        await registrarAtividade("cliente_excluido", {
          clienteNome: cliente.nome,
        });
        setClienteParaExcluir(null);
      });
      setShowConfirmacao(true);
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      throw error;
    }
  };

  const handleConfirmacao = async () => {
    if (acaoPendente) {
      await acaoPendente();
      setShowConfirmacao(false);
      setAcaoPendente(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">
          Clientes
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20"
          >
            <i className="bx bx-plus text-xl"></i>
            Novo Cliente
          </button>
          <button
            onClick={toggleDadosVisiveis}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border ${
              dadosVisiveis
                ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                : "bg-white text-green-700 border-green-500 hover:bg-green-50"
            }`}
          >
            <i
              className={`bx ${dadosVisiveis ? "bx-hide" : "bx-show"} text-xl`}
            ></i>
            {dadosVisiveis ? "Ocultar Todos" : "Mostrar Todos"}
          </button>
        </div>
      </div>

      <ListaClientes
        clientes={clientesFiltrados}
        onEditar={handleEditarCliente}
        onExcluir={handleExcluirCliente}
        dadosVisiveis={dadosVisiveis}
        toggleDadosVisiveis={toggleDadosVisiveis}
      />

      <AddClienteModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setErroAdicao(null);
        }}
        onSubmit={handleAddCliente}
        erro={erroAdicao}
      />

      {clienteEditando && (
        <EditClienteModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setClienteEditando(null);
          }}
          onSubmit={handleEditarCliente}
          cliente={clienteEditando}
        />
      )}

      <ConfirmacaoModal
        isOpen={showConfirmacao}
        onClose={() => {
          setShowConfirmacao(false);
          setClienteParaExcluir(null);
          setAcaoPendente(null);
        }}
        onConfirm={handleConfirmacao}
        titulo={clienteParaExcluir ? "Excluir Cliente" : "Editar Cliente"}
        mensagem={
          clienteParaExcluir
            ? "Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
            : "Tem certeza que deseja salvar as alterações?"
        }
      />
    </div>
  );
}
