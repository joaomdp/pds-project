import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddCategoriaModal({ isOpen, onClose, onSubmit }) {
  const [novaCategoria, setNovaCategoria] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (novaCategoria.trim()) {
      onSubmit(novaCategoria.trim());
      setNovaCategoria("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 z-50 overflow-y-auto"
        >
          <div className="min-h-screen px-4 py-8 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md card-hover"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 text-responsive">
                    Nova Categoria
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors btn hover-scale"
                  >
                    <i className="bx bx-x text-2xl"></i>
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                  <label
                    htmlFor="categoria"
                    className="block text-sm font-medium text-gray-700 mb-2 text-responsive"
                  >
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    id="categoria"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent input-focus"
                    placeholder="Digite o nome da categoria"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors btn text-responsive"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors btn text-responsive"
                  >
                    Adicionar
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
