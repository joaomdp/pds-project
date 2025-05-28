import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ConfirmacaoModal from "../Clientes/ConfirmacaoModal";
import LocarMaquinaModal from "./LocarMaquinaModal";
import { useMaquinas } from "../../hooks/useMaquinas";

export default function MaquinaCard({
  maquina: maquinaInicial,
  onEdit,
  onDelete,
}) {
  const [showDeleteConfirmacao, setShowDeleteConfirmacao] = useState(false);
  const [showEditConfirmacao, setShowEditConfirmacao] = useState(false);
  const [showLocarModal, setShowLocarModal] = useState(false);
  const { editarMaquina, maquinas } = useMaquinas();
  const [maquina, setMaquina] = useState(maquinaInicial);
  const [maquinaEditada, setMaquinaEditada] = useState(null);

  useEffect(() => {
    setMaquina(maquinaInicial);
  }, [maquinaInicial]);

  useEffect(() => {
    const maquinaAtualizada = maquinas.find((m) => m.id === maquina.id);
    if (maquinaAtualizada) {
      setMaquina(maquinaAtualizada);
    }
  }, [maquinas, maquina.id]);

  const handleLocar = async (dados) => {
    try {
      const novaQuantidadeLocada =
        (maquina.quantidadeLocada || 0) + dados.quantidade;
      const maquinaAtualizada = {
        ...maquina,
        quantidadeLocada: novaQuantidadeLocada,
        disponivel: novaQuantidadeLocada < maquina.quantidade,
      };

      setMaquina(maquinaAtualizada);

      await editarMaquina(maquina.id, maquinaAtualizada);

      console.log("Dados da locação:", dados);
      setShowLocarModal(false);
    } catch (error) {
      console.error("Erro ao atualizar máquina:", error);
    }
  };

  const handleEditClick = (maquina) => {
    onEdit(maquina);
  };

  const handleConfirmacaoEdit = async () => {
    if (maquinaEditada) {
      try {
        await editarMaquina(maquinaEditada.id, maquinaEditada);
        setMaquina(maquinaEditada);
        setShowEditConfirmacao(false);
        setMaquinaEditada(null);
      } catch (error) {
        console.error("Erro ao atualizar máquina:", error);
      }
    }
  };

  const quantidadeDisponivel =
    maquina.quantidade - (maquina.quantidadeLocada || 0);

  const maquinaDisponivel = quantidadeDisponivel > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        <div className="relative h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 group">
          {maquina.imagemUrl ? (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={maquina.imagemUrl}
                alt={maquina.nome}
                className="w-full h-full object-contain bg-zinc-50"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=Sem+Imagem";
                  e.target.classList.add("opacity-50");
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <i className="bx bx-image text-5xl text-zinc-300 mb-2"></i>
                <p className="text-sm text-zinc-400">Sem imagem</p>
              </div>
            </div>
          )}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setShowDeleteConfirmacao(true)}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full text-zinc-600 hover:text-red-500 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm"
          >
            <i className="bx bx-trash text-xl"></i>
          </motion.button>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="text-white font-bold text-xl truncate drop-shadow-md">
              {maquina.nome}
            </h3>
          </div>
        </div>

        <div className="p-6 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
            className="space-y-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="bx bx-money text-zinc-600 text-xl"></i>
                <span className="text-zinc-800 font-semibold">
                  R$ {maquina.valorDiaria}/dia
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="bx bx-package text-zinc-600 text-xl"></i>
                <span className="text-zinc-600">
                  {quantidadeDisponivel} disponível(is)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="bx bx-check-circle text-zinc-600 text-xl"></i>
                <span
                  className={`${
                    maquinaDisponivel ? "text-emerald-600" : "text-red-600"
                  } font-medium`}
                >
                  {maquinaDisponivel ? "Disponível" : "Indisponível"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="bx bx-category text-zinc-600 text-xl"></i>
                <span className="text-zinc-600">{maquina.categoria}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
            className="flex justify-between space-x-3"
          >
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#f4f4f5" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => handleEditClick(maquina)}
              className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md btn text-responsive"
            >
              <i className="bx bx-edit-alt mr-2"></i>
              Editar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#059669" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setShowLocarModal(true)}
              disabled={!maquinaDisponivel}
              className={`flex-1 px-4 py-2 ${
                maquinaDisponivel
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
              } rounded-lg transition-all duration-300 shadow-sm hover:shadow-md btn text-responsive`}
            >
              <i className="bx bx-cart-add mr-2"></i>
              {maquinaDisponivel ? "Locar" : "Indisponível"}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <ConfirmacaoModal
        isOpen={showDeleteConfirmacao}
        onClose={() => setShowDeleteConfirmacao(false)}
        onConfirm={onDelete}
        tipo="excluir"
      />

      <ConfirmacaoModal
        isOpen={showEditConfirmacao}
        onClose={() => {
          setShowEditConfirmacao(false);
          setMaquinaEditada(null);
        }}
        onConfirm={handleConfirmacaoEdit}
        tipo="editar"
      />

      <LocarMaquinaModal
        isOpen={showLocarModal}
        onClose={() => setShowLocarModal(false)}
        onSubmit={handleLocar}
        maquina={maquina}
      />
    </>
  );
}
