import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCategorias } from "../../hooks/useCategorias";
import AddCategoriaModal from "./AddCategoriaModal";
import ConfirmacaoModal from "../Clientes/ConfirmacaoModal";

export default function EditMaquinaModal({
  isOpen,
  onClose,
  onSubmit,
  maquina,
}) {
  const { categorias, adicionarCategoria, carregarCategorias } =
    useCategorias();
  const [showAddCategoria, setShowAddCategoria] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    valorDiaria: "",
    imagemUrl: "",
    quantidade: "1",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dadosParaSalvar, setDadosParaSalvar] = useState(null);

  useEffect(() => {
    if (maquina) {
      setFormData({
        nome: maquina.nome || "",
        categoria: maquina.categoria || "",
        valorDiaria: maquina.valorDiaria
          ? maquina.valorDiaria.toString().replace(".", ",")
          : "",
        imagemUrl: maquina.imagemUrl || "",
        quantidade: maquina.quantidade?.toString() || "1",
      });
    }
  }, [maquina]);

  const validateForm = () => {
    const errors = {};

    // Validação do nome
    if (!formData.nome.trim()) {
      errors.nome = "Nome é obrigatório";
    } else if (formData.nome.length < 3) {
      errors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    // Validação da categoria
    if (!formData.categoria.trim()) {
      errors.categoria = "Categoria é obrigatória";
    }

    // Validação do preço
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

    // Validação da quantidade
    if (!formData.quantidade.trim()) {
      errors.quantidade = "Quantidade é obrigatória";
    } else {
      const quantidade = parseInt(formData.quantidade);
      if (isNaN(quantidade) || quantidade <= 0) {
        errors.quantidade = "Quantidade deve ser maior que zero";
      } else if (quantidade < maquina.quantidadeLocada) {
        errors.quantidade =
          "Quantidade não pode ser menor que a quantidade locada";
      }
    }

    // Validação da imagem
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

    const dataToSubmit = {
      ...formData,
      valorDiaria: parseFloat(
        formData.valorDiaria.replace(/\./g, "").replace(",", ".")
      ),
      quantidade: parseInt(formData.quantidade),
    };

    setDadosParaSalvar(dataToSubmit);
    setShowConfirmacao(true);
  };

  const handleConfirmacao = async () => {
    setIsLoading(true);
    try {
      await onSubmit(maquina.id, dadosParaSalvar);
      setShowConfirmacao(false);
      setFormData({
        ...dadosParaSalvar,
        valorDiaria: dadosParaSalvar.valorDiaria.toString().replace(".", ","),
      });
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      console.error("Erro ao editar máquina:", err);
      setError(err.message || "Erro ao editar máquina");
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
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 border border-gray-100"
            initial={{ scale: 0.95, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 24 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center mb-8">
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <i className="bx bx-cube text-3xl text-green-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 text-center">
                Editar Máquina
              </h2>
            </div>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                <div className="flex items-center gap-2 text-red-600">
                  <i className="bx bx-error-circle text-xl"></i>
                  <p>{error}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <i className="bx bx-rename text-lg text-gray-400"></i>
                  Nome da Máquina
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={handleChange}
                  name="nome"
                  placeholder="Ex: Betoneira 400L"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    validationErrors.nome ? "border-red-300" : "border-gray-200"
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                  required
                />
                {validationErrors.nome && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.nome}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <i className="bx bx-category text-lg text-gray-400"></i>
                    Categoria
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoria(true)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                  >
                    <i className="bx bx-plus"></i> Nova Categoria
                  </button>
                </div>
                <select
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    validationErrors.categoria
                      ? "border-red-300"
                      : "border-gray-200"
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                >
                  {categorias
                    .filter(
                      (categoria) =>
                        typeof categoria.id === "string" &&
                        categoria.id.trim() !== ""
                    )
                    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
                    .map((categoria) => (
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
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <i className="bx bx-money text-lg text-gray-400"></i>
                    Valor Diária (R$)
                  </label>
                  <input
                    type="text"
                    value={formData.valorDiaria}
                    onChange={handleChange}
                    name="valorDiaria"
                    placeholder="Ex: 120,00"
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      validationErrors.valorDiaria
                        ? "border-red-300"
                        : "border-gray-200"
                    } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                    required
                  />
                  {validationErrors.valorDiaria && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.valorDiaria}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <i className="bx bx-layer-plus text-lg text-gray-400"></i>
                    Quantidade
                  </label>
                  <input
                    type="number"
                    value={formData.quantidade}
                    onChange={handleChange}
                    name="quantidade"
                    min={maquina.quantidadeLocada || 1}
                    placeholder="Ex: 1"
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      validationErrors.quantidade
                        ? "border-red-300"
                        : "border-gray-200"
                    } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                    required
                  />
                  {validationErrors.quantidade && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.quantidade}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <i className="bx bx-image text-lg text-gray-400"></i>
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={formData.imagemUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imagemUrl: e.target.value })
                  }
                  placeholder="https://exemplo.com/imagem.jpg"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    validationErrors.imagemUrl
                      ? "border-red-300"
                      : "border-gray-200"
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                />
                {validationErrors.imagemUrl && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.imagemUrl}
                  </p>
                )}
                {formData.imagemUrl && (
                  <div className="mt-3 flex justify-center">
                    <img
                      src={formData.imagemUrl}
                      alt="Preview"
                      className="w-48 h-32 object-cover rounded-2xl shadow-lg border border-gray-200"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=Imagem+Inválida";
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 font-medium transition-colors shadow"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <i className="bx bx-save text-xl"></i>
                      Salvar Alterações
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

      <ConfirmacaoModal
        isOpen={showConfirmacao}
        onClose={() => {
          setShowConfirmacao(false);
          setDadosParaSalvar(null);
        }}
        onConfirm={handleConfirmacao}
        titulo="Editar Máquina"
        mensagem="Para editar esta máquina, por favor insira sua senha de administrador."
      />
    </AnimatePresence>
  );
}
