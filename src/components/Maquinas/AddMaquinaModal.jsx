import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCategorias } from "../../hooks/useCategorias";
import AddCategoriaModal from "./AddCategoriaModal";

export default function AddMaquinaModal({ isOpen, onClose, onSubmit }) {
  const { categorias, adicionarCategoria, carregarCategorias } =
    useCategorias();
  const [showAddCategoria, setShowAddCategoria] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: categorias.length > 0 ? categorias[0].nome : "",
    valorDiaria: "",
    imagemUrl: "",
    quantidade: "1",
  });

  useEffect(() => {
    if (categorias.length > 0 && !formData.categoria) {
      setFormData((prev) => ({
        ...prev,
        categoria: categorias[0].nome,
      }));
    }
  }, [categorias, formData.categoria]);

  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    const errors = {};

    if (!formData.nome.trim()) {
      errors.nome = "Nome é obrigatório";
    } else if (formData.nome.length < 3) {
      errors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!formData.categoria.trim()) {
      errors.categoria = "Categoria é obrigatória";
    }

    if (!formData.valorDiaria.trim()) {
      errors.valorDiaria = "Preço é obrigatório";
    } else {
      const preco = parseFloat(
        formData.valorDiaria.replace(/[^\d,]/g, "").replace(",", ".")
      );
      if (isNaN(preco) || preco <= 0) {
        errors.valorDiaria = "Preço inválido";
      }
    }

    if (!formData.quantidade.trim()) {
      errors.quantidade = "Quantidade é obrigatória";
    } else {
      const quantidade = parseInt(formData.quantidade);
      if (isNaN(quantidade) || quantidade <= 0) {
        errors.quantidade = "Quantidade deve ser maior que zero";
      }
    }

    if (!formData.imagemUrl.trim()) {
      errors.imagemUrl = "URL da imagem é obrigatória";
    } else if (!isValidImageUrl(formData.imagemUrl)) {
      errors.imagemUrl = "URL da imagem inválida";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidImageUrl = (url) => {
    try {
      new URL(url);
      return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);
    setValidationErrors((prev) => ({ ...prev, [name]: null }));

    let formattedValue = value;

    if (name === "valorDiaria") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d)(\d{2})$/, "$1,$2")
        .replace(/(?=(\d{3})+(\D))\B/g, ".");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        valorDiaria: parseFloat(
          formData.valorDiaria.replace(/\./g, "").replace(",", ".")
        ),
        quantidade: parseInt(formData.quantidade),
      };

      await onSubmit(dataToSubmit);
      setFormData({
        nome: "",
        categoria: "",
        valorDiaria: "",
        imagemUrl: "",
        quantidade: "1",
      });
      onClose();
    } catch (err) {
      console.error("Erro ao adicionar máquina:", err);
      setError(err.message || "Erro ao adicionar máquina");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategoria = async (categoria) => {
    try {
      const novaCategoria = await adicionarCategoria(categoria);
      await carregarCategorias();
      setFormData((prev) => ({ ...prev, categoria: novaCategoria.nome }));
      setShowAddCategoria(false);
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Adicionar Máquina
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-600">
                  <i className="bx bx-error-circle text-xl"></i>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nome da Máquina
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={handleChange}
                  name="nome"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                />
                {validationErrors.nome && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.nome}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Categoria
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoria(true)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    <i className="bx bx-plus mr-1"></i>
                    Nova Categoria
                  </button>
                </div>
                <select
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.nome}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
                {validationErrors.categoria && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.categoria}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Valor Diária (R$)
                  </label>
                  <input
                    type="text"
                    value={formData.valorDiaria}
                    onChange={handleChange}
                    name="valorDiaria"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                  {validationErrors.valorDiaria && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.valorDiaria}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    value={formData.quantidade}
                    onChange={handleChange}
                    name="quantidade"
                    min="1"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                  {validationErrors.quantidade && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.quantidade}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={formData.imagemUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imagemUrl: e.target.value })
                  }
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
                {validationErrors.imagemUrl && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.imagemUrl}
                  </p>
                )}
                {formData.imagemUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imagemUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=Imagem+Inválida";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 font-medium transition-colors"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <i className="bx bx-plus text-xl"></i>
                      Adicionar Máquina
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      <AddCategoriaModal
        isOpen={showAddCategoria}
        onClose={() => setShowAddCategoria(false)}
        onSubmit={handleAddCategoria}
      />
    </AnimatePresence>
  );
}
