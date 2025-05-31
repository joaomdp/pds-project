import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isBefore } from "date-fns";
import AddClienteModal from "../Clientes/AddClienteModal";
import { useClientes } from "../../hooks/useClientes";
import { useLocacoes } from "../../hooks/useLocacoes";
import { useMaquinas } from "../../hooks/useMaquinas";
import { Timestamp } from "firebase/firestore";

export default function LocarMaquinaModal({
  isOpen,
  onClose,
  maquina: maquinaInicial,
  locacaoAtual,
}) {
  const { clientes, addCliente } = useClientes();
  const { adicionarLocacao } = useLocacoes();
  const { editarMaquina, maquinas } = useMaquinas();
  const [maquina, setMaquina] = useState(maquinaInicial);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [endereco, setEndereco] = useState("");
  const [frete, setFrete] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [valorDiaria, setValorDiaria] = useState(maquinaInicial.valorDiaria);
  const [clienteId, setClienteId] = useState("");
  const [valorTotal, setValorTotal] = useState(0);
  const [valorTotalEditado, setValorTotalEditado] = useState(0);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showAddCliente, setShowAddCliente] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pago, setPago] = useState("nao");

  useEffect(() => {
    setMaquina(maquinaInicial);
  }, [maquinaInicial]);

  useEffect(() => {
    const maquinaAtualizada = maquinas.find((m) => m.id === maquina.id);
    if (maquinaAtualizada) {
      setMaquina(maquinaAtualizada);
    }
  }, [maquinas, maquina.id]);

  useEffect(() => {
    if (!dataInicio || !dataFim || !maquina) {
      setValorTotal(0);
      setValorTotalEditado(0);
      return;
    }
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
    const valorFrete = Number(frete) || 0;
    const novoValorTotal = dias * maquina.valorDiaria * quantidade + valorFrete;
    setValorTotal(novoValorTotal);
    setValorTotalEditado(novoValorTotal);
  }, [dataInicio, dataFim, frete, maquina, quantidade]);

  useEffect(() => {
    const filtrados = clientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase())
    );
    setClientesFiltrados(filtrados);
  }, [buscaCliente, clientes]);

  useEffect(() => {
    if (locacaoAtual) {
      setClienteId(locacaoAtual.clienteId);
      setEndereco(locacaoAtual.endereco);
      setQuantidade(locacaoAtual.quantidade.toString());
      setValorDiaria(locacaoAtual.valorDiaria);
      setFrete(locacaoAtual.valorFrete?.toString() || "");
      setPago(locacaoAtual.pago);

      const cliente = clientes.find((c) => c.id === locacaoAtual.clienteId);
      if (cliente) {
        setBuscaCliente(cliente.nome);
      }
    }
  }, [locacaoAtual, clientes]);

  const validateForm = () => {
    const errors = {};

    if (!clienteId) {
      errors.clienteId = "Cliente é obrigatório";
    }

    if (!pago) {
      errors.pago = "Status de pagamento é obrigatório";
    }

    const dataInicioObj = new Date(dataInicio + "T00:00:00-03:00");
    const dataFimObj = new Date(dataFim + "T23:59:59-03:00");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (!dataInicio) {
      errors.dataInicio = "Data de início é obrigatória";
    } else if (isBefore(dataInicioObj, hoje)) {
      errors.dataInicio = "Data de início não pode ser anterior a hoje";
    }

    if (!dataFim) {
      errors.dataFim = "Data de fim é obrigatória";
    } else if (isBefore(dataFimObj, dataInicioObj)) {
      errors.dataFim = "Data de fim não pode ser anterior à data de início";
    }

    if (!endereco.trim()) {
      errors.endereco = "Endereço é obrigatório";
    } else if (endereco.length < 10) {
      errors.endereco = "Endereço deve ter pelo menos 10 caracteres";
    }

    if (frete && Number(frete) < 0) {
      errors.frete = "Frete inválido";
    }

    if (!quantidade || quantidade <= 0) {
      errors.quantidade = "Quantidade deve ser maior que zero";
    } else if (
      quantidade >
      maquina.quantidade - (maquina.quantidadeLocada || 0)
    ) {
      errors.quantidade = `Quantidade indisponível. Máximo disponível: ${
        maquina.quantidade - (maquina.quantidadeLocada || 0)
      }`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const clienteSelecionado = clientes.find((c) => c.id === clienteId);
      if (!clienteSelecionado) {
        throw new Error("Cliente não encontrado");
      }

      const dataInicioAjustada = new Date(dataInicio + "T00:00:00-03:00");
      const dataFimAjustada = new Date(dataFim + "T23:59:59-03:00");

      const locacaoData = {
        maquinaId: maquina.id,
        maquinaNome: maquina.nome,
        clienteId: clienteId,
        clienteNome: clienteSelecionado.nome,
        dataInicio: Timestamp.fromDate(dataInicioAjustada),
        dataFim: Timestamp.fromDate(dataFimAjustada),
        quantidade: parseInt(quantidade),
        valorTotal: parseFloat(valorTotalEditado),
        valorFrete: parseFloat(frete),
        valorDiaria: parseFloat(valorDiaria),
        endereco: endereco,
        status: "ativa",
        dataCriacao: Timestamp.now(),
        pago: pago,
      };

      const novaQuantidadeLocada =
        (maquina.quantidadeLocada || 0) + parseInt(quantidade);
      const maquinaAtualizada = {
        ...maquina,
        quantidadeLocada: novaQuantidadeLocada,
        disponivel: novaQuantidadeLocada < maquina.quantidade,
      };

      await Promise.all([
        adicionarLocacao(locacaoData),
        editarMaquina(maquina.id, maquinaAtualizada),
      ]);

      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar locação:", error);
      alert("Erro ao salvar locação. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClienteChange = (cliente) => {
    setClienteId(cliente.id);
    setEndereco(cliente.endereco || "");
    setBuscaCliente(cliente.nome);
    setShowDropdown(false);
  };

  const handleAddCliente = async (novoCliente) => {
    try {
      setIsLoading(true);
      const clienteAdicionado = await addCliente({
        nome: novoCliente.nome,
        email: novoCliente.email,
        telefone: novoCliente.telefone,
        cpf: novoCliente.cpf,
        endereco: "",
      });

      if (clienteAdicionado) {
        setClienteId(clienteAdicionado.id);
        setEndereco("");
        setBuscaCliente(clienteAdicionado.nome);
        setShowAddCliente(false);
      }
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      setError("Erro ao adicionar cliente. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setShowDropdown(false);
      setBuscaCliente("");
      setClienteId("");
      setEndereco("");
      setQuantidade("1");
      setDataInicio("");
      setDataFim("");
      setFrete("");
      setError(null);
      setValidationErrors({});
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-auto my-8"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {locacaoAtual ? "Renovar Locação" : "Locar Máquina"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <div className="flex items-center gap-2 text-red-600">
                  <i className="bx bx-error-circle text-xl"></i>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {maquina.nome}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Valor Diária</p>
                        <input
                          type="number"
                          value={valorDiaria}
                          onChange={(e) =>
                            setValorDiaria(Number(e.target.value))
                          }
                          className="w-full px-2 py-1 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Disponíveis</p>
                        <p className="font-medium text-gray-800">
                          {maquina.quantidade - (maquina.quantidadeLocada || 0)}{" "}
                          unidade(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      min="1"
                      max={maquina.quantidade - (maquina.quantidadeLocada || 0)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      required
                    />
                    {validationErrors.quantidade && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.quantidade}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Cliente
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddCliente(true)}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <i className="bx bx-plus mr-1"></i>
                        Novo Cliente
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={buscaCliente}
                        onChange={(e) => {
                          setBuscaCliente(e.target.value);
                          setShowDropdown(true);
                        }}
                        placeholder="Buscar cliente..."
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                      {showDropdown && buscaCliente && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {clientesFiltrados.map((cliente) => (
                            <button
                              key={`cliente-${cliente.id}`}
                              type="button"
                              onClick={() => handleClienteChange(cliente)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 outline-none"
                            >
                              {cliente.nome}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {validationErrors.clienteId && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.clienteId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Data Início
                      </label>
                      <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        required
                      />
                      {validationErrors.dataInicio && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.dataInicio}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Data Fim
                      </label>
                      <input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        required
                      />
                      {validationErrors.dataFim && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.dataFim}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Endereço de Entrega
                    </label>
                    <input
                      type="text"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      required
                    />
                    {validationErrors.endereco && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.endereco}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Frete (R$)
                    </label>
                    <input
                      type="number"
                      value={frete}
                      onChange={(e) => setFrete(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                    {validationErrors.frete && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.frete}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Status de Pagamento
                    </label>
                    <select
                      value={pago}
                      onChange={(e) => setPago(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      required
                    >
                      <option value="nao">Não Pago</option>
                      <option value="sim">Pago</option>
                    </select>
                    {validationErrors.pago && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.pago}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Valor Total:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={valorTotalEditado}
                      onChange={(e) =>
                        setValorTotalEditado(Number(e.target.value))
                      }
                      className="w-32 px-3 py-1 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-right"
                      min="0"
                      step="0.01"
                    />
                    <span className="text-sm text-gray-500">
                      (Calculado: R$ {valorTotal.toFixed(2)})
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
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
                        <i className="bx bx-check text-xl"></i>
                        Confirmar Locação
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      <AddClienteModal
        isOpen={showAddCliente}
        onClose={() => setShowAddCliente(false)}
        onSubmit={handleAddCliente}
      />
    </AnimatePresence>
  );
}
