import { useState } from "react";
import { motion } from "framer-motion";
import ConfirmacaoModal from "../Clientes/ConfirmacaoModal";
import { useCategorias } from "../../hooks/useCategorias";

export default function FiltroCategorias({
  categoriaAtual,
  onCategoriaChange,
}) {
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);
  const { categorias, removerCategoria, carregarCategorias } = useCategorias();

  const handleExcluirCategoria = (categoria) => {
    setCategoriaParaExcluir(categoria);
    setShowConfirmacao(true);
  };

  const confirmarExclusao = async () => {
    if (categoriaParaExcluir) {
      await removerCategoria(categoriaParaExcluir.id);
      await carregarCategorias();
      if (categoriaAtual === categoriaParaExcluir.nome) {
        onCategoriaChange("Todas");
      }
      setCategoriaParaExcluir(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          onClick={() => onCategoriaChange("Todas")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            categoriaAtual === "Todas"
              ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Todas
        </motion.button>
        {categorias.map((categoria) => (
          <div key={categoria.id} className="relative group">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              onClick={() => onCategoriaChange(categoria.nome)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                categoriaAtual === categoria.nome
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {categoria.nome}
            </motion.button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleExcluirCategoria(categoria);
              }}
              className="absolute -right-2 -top-2 text-gray-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <i className="bx bx-x"></i>
            </button>
          </div>
        ))}
      </div>

      <ConfirmacaoModal
        isOpen={showConfirmacao}
        onClose={() => {
          setShowConfirmacao(false);
          setCategoriaParaExcluir(null);
        }}
        onConfirm={confirmarExclusao}
        tipo="excluir"
      />
    </div>
  );
}
