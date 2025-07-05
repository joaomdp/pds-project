import { useState } from "react";
import { motion } from "framer-motion";
import { useClientes } from "../../hooks/useClientes";

export default function AddClienteModal({ isOpen, onClose, onSubmit, erro }) {
  const { clientes } = useClientes();
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    cpf: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const formatarTelefone = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limitedNumbers = numbers.slice(0, 11);
    return limitedNumbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const formatarCPF = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limitedNumbers = numbers.slice(0, 11);
    return limitedNumbers.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4"
    );
  };

  const validarFormulario = () => {
    const errors = {};

    if (!formData.nome.trim()) {
      errors.nome = "Nome é obrigatório";
    } else if (formData.nome.length < 3) {
      errors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    const telefoneNumeros = formData.telefone.replace(/\D/g, "");
    if (!telefoneNumeros) {
      errors.telefone = "Telefone é obrigatório";
    } else if (telefoneNumeros.length !== 11) {
      errors.telefone = "Telefone deve ter 11 dígitos";
    }

    const cpfNumeros = formData.cpf.replace(/\D/g, "");
    if (!cpfNumeros) {
      errors.cpf = "CPF é obrigatório";
    } else if (cpfNumeros.length !== 11) {
      errors.cpf = "CPF deve ter 11 dígitos";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "telefone") {
      formattedValue = formatarTelefone(value);
    } else if (name === "cpf") {
      formattedValue = formatarCPF(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    // Verificar duplicidade de CPF
    const cpfNumeros = formData.cpf.replace(/\D/g, "");
    const cpfDuplicado = clientes.some(
      (c) => c.cpf && c.cpf.replace(/\D/g, "") === cpfNumeros
    );
    if (cpfDuplicado) {
      setValidationErrors((prev) => ({
        ...prev,
        cpf: "Já existe um cliente com este CPF.",
      }));
      return;
    }

    setIsLoading(true);

    try {
      const dadosCliente = {
        nome: formData.nome,
        telefone: formData.telefone.replace(/\D/g, ""),
        cpf: cpfNumeros,
        endereco: "",
      };

      await onSubmit(dadosCliente);
      setFormData({
        nome: "",
        telefone: "",
        cpf: "",
      });
      onClose();
    } catch (err) {
      console.error("Erro ao adicionar cliente:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-gray-100"
      >
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-green-100 p-3 rounded-full mb-3">
              <i className="bx bx-user-plus text-3xl text-green-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              Novo Cliente
            </h2>
          </div>
          {erro && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {erro}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <i className="bx bx-rename text-lg text-gray-400"></i>
                Nome
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: José da Silva"
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
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <i className="bx bx-phone text-lg text-gray-400"></i>
                Telefone
              </label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  validationErrors.telefone
                    ? "border-red-300"
                    : "border-gray-200"
                } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                required
              />
              {validationErrors.telefone && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.telefone}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <i className="bx bx-id-card text-lg text-gray-400"></i>
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  validationErrors.cpf ? "border-red-300" : "border-gray-200"
                } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                required
              />
              {validationErrors.cpf && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.cpf}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-6">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 font-medium transition-colors shadow"
                disabled={isLoading}
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-check text-xl"></i>
                    Adicionar Cliente
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
