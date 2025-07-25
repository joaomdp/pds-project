import { useState } from "react";
import { useMaquinas } from "../../hooks/useMaquinas";
import ListaMaquinas from "./ListaMaquinas";
import AddMaquinaModal from "./AddMaquinaModal";
import EditMaquinaModal from "./EditMaquinaModal";
import FiltroCategorias from "./FiltroCategorias";
import { registrarAtividade } from "../../utils/atividades";

export default function MaquinasProvider() {
  const {
    maquinas,
    loading: isLoading,
    error,
    adicionarMaquina,
    editarMaquina,
    excluirMaquina,
  } = useMaquinas();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maquinaEditando, setMaquinaEditando] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");

  const handleAddMaquina = async (maquinaData) => {
    try {
      await adicionarMaquina(maquinaData);
      setIsAddModalOpen(false);

      await registrarAtividade("maquina_criada", {
        maquinaNome: maquinaData.nome,
      });
    } catch (err) {
      console.error("Erro ao adicionar máquina:", err);
    }
  };

  const handleEditarMaquina = async (id, maquinaData) => {
    try {
      await editarMaquina(id, maquinaData);
      setIsEditModalOpen(false);
      setMaquinaEditando(null);

      await registrarAtividade("maquina_editada", {
        maquinaNome: maquinaData.nome,
      });
    } catch (err) {
      console.error("Erro ao editar máquina:", err);
    }
  };

  const handleExcluirMaquina = async (id) => {
    try {
      const maquina = maquinas.find((m) => m.id === id);
      await excluirMaquina(id);

      await registrarAtividade("maquina_excluida", {
        maquinaNome: maquina.nome,
      });
    } catch (err) {
      console.error("Erro ao excluir máquina:", err);
    }
  };

  const handleAbrirEdicao = (maquina) => {
    setMaquinaEditando(maquina);
    setIsEditModalOpen(true);
  };

  const maquinasFiltradas =
    categoriaFiltro === "Todas"
      ? maquinas
      : maquinas.filter((maquina) => maquina.categoria === categoriaFiltro);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Máquinas</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
            >
              <i className="bx bx-plus text-xl"></i>
              Nova Máquina
            </button>
          </div>
        </div>

        <FiltroCategorias
          categoriaAtual={categoriaFiltro}
          onCategoriaChange={setCategoriaFiltro}
        />

        <ListaMaquinas
          maquinas={maquinasFiltradas}
          onEditar={handleAbrirEdicao}
          onExcluir={handleExcluirMaquina}
        />
      </div>

      <AddMaquinaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMaquina}
      />

      {maquinaEditando && (
        <EditMaquinaModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setMaquinaEditando(null);
          }}
          onSubmit={handleEditarMaquina}
          maquina={maquinaEditando}
        />
      )}
    </div>
  );
}
