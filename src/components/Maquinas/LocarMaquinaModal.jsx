import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isBefore } from "date-fns";
import AddClienteModal from "../Clientes/AddClienteModal";
import { useClientes } from "../../hooks/useClientes";
import { useLocacoes } from "../../hooks/useLocacoes";
import { useMaquinas } from "../../hooks/useMaquinas";
import { Timestamp } from "firebase/firestore";
import ConfirmacaoModal from "../Clientes/ConfirmacaoModal";

export default function LocarMaquinaModal({
  isOpen,
  onClose,
  maquina: maquinaInicial,
  locacaoAtual,
  modoEdicao = false,
  maquinasEdicao,
  modoRenovacao = false,
  onSubmit,
}) {
  const { clientes, addCliente } = useClientes();
  const { adicionarLocacao, editarLocacao } = useLocacoes();
  const { maquinas } = useMaquinas();
  const [maquinasSelecionadas, setMaquinasSelecionadas] = useState(
    modoEdicao && Array.isArray(maquinasEdicao) && maquinasEdicao.length > 0
      ? maquinasEdicao.map((m) => ({
          maquina: maquinas.find((maq) => maq.id === m.maquinaId) || {},
          quantidade: m.quantidade?.toString() || "1",
          valorDiaria: m.valorDiaria || 0,
        }))
      : maquinaInicial && maquinaInicial.valorDiaria !== undefined
      ? [
          {
            maquina: maquinaInicial,
            quantidade: "1",
            valorDiaria: maquinaInicial.valorDiaria,
          },
        ]
      : []
  );
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [endereco, setEndereco] = useState("");
  const [frete, setFrete] = useState("");
  const [valorTotal, setValorTotal] = useState(0);
  const [valorTotalEditado, setValorTotalEditado] = useState(0);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [errorTimeout, setErrorTimeout] = useState(null);
  const [showAddCliente, setShowAddCliente] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pago, setPago] = useState("nao");
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [showConfirmacaoAdmin, setShowConfirmacaoAdmin] = useState(false);
  const [pendingEditData, setPendingEditData] = useState(null);
  // Adicionar state para renovação
  const [pendingRenewData, setPendingRenewData] = useState(null);
  // Adicionar state para tipo de locação (imediata ou reserva)
  const [tipoLocacao, setTipoLocacao] = useState("imediata");

  useEffect(() => {
    try {
      console.log("[RENOVACAO] useEffect - locacaoAtual:", locacaoAtual);
      console.log("[RENOVACAO] useEffect - maquinas:", maquinas);
      if (maquinas.length === 0) return;

      if (modoRenovacao && locacaoAtual) {
        setEndereco(locacaoAtual.endereco || "");
        setFrete(locacaoAtual.valorFrete?.toString() || "");
        setPago(locacaoAtual.pago || "nao");
        setValorTotalEditado(locacaoAtual.valorTotal || 0);
        setClienteSelecionadoId(locacaoAtual.clienteId || "");
        setMaquinasSelecionadas(
          (locacaoAtual.maquinas || [])
            .map((m) => ({
              maquina: maquinas.find((maq) => maq.id === m.maquinaId) || {},
              quantidade: m.quantidade?.toString() || "1",
              valorDiaria: m.valorDiaria || 0,
            }))
            .filter(
              (item) =>
                item.maquina && item.maquina.id && item.maquina.id.trim() !== ""
            )
        );
        setDataInicio("");
        setDataFim("");
      } else if (
        modoEdicao &&
        Array.isArray(maquinasEdicao) &&
        maquinasEdicao.length > 0
      ) {
        setMaquinasSelecionadas(
          maquinasEdicao
            .map((m) => ({
              maquina: maquinas.find((maq) => maq.id === m.maquinaId) || {},
              quantidade: m.quantidade?.toString() || "1",
              valorDiaria: m.valorDiaria || 0,
            }))
            .filter(
              (item) =>
                item.maquina && item.maquina.id && item.maquina.id.trim() !== ""
            )
        );
      } else if (maquinaInicial && maquinaInicial.valorDiaria !== undefined) {
        setMaquinasSelecionadas([
          {
            maquina: maquinaInicial,
            quantidade: "1",
            valorDiaria: maquinaInicial.valorDiaria || 0,
          },
        ]);
      }
    } catch (error) {
      console.error("Erro no useEffect de inicialização:", error);
      setError("Erro ao carregar dados da locação. Tente novamente.");
    }
  }, [
    maquinasEdicao,
    modoEdicao,
    maquinaInicial,
    maquinas,
    modoRenovacao,
    locacaoAtual,
  ]);

  // Verificar se alguma máquina selecionada está indisponível e ajustar tipo de locação
  useEffect(() => {
    if (!modoEdicao && !modoRenovacao && maquinasSelecionadas.length > 0) {
      const temMaquinaIndisponivel = maquinasSelecionadas.some((item) => {
        if (!item.maquina || !item.maquina.id) return false;
        const quantidadeDisponivel =
          item.maquina.quantidade - (item.maquina.quantidadeLocada || 0);
        return quantidadeDisponivel <= 0;
      });

      if (temMaquinaIndisponivel && tipoLocacao === "imediata") {
        setTipoLocacao("reserva");
      }
    }
  }, [maquinasSelecionadas, modoEdicao, modoRenovacao, tipoLocacao]);

  useEffect(() => {
    try {
      setMaquinasSelecionadas((prev) =>
        prev.map((item) => {
          if (!item || !item.maquina || !item.maquina.id) {
            return item; // Manter item original se inválido
          }

          const maquinaAtualizada = maquinas.find(
            (m) => m.id === item.maquina.id
          );
          return maquinaAtualizada
            ? { ...item, maquina: maquinaAtualizada }
            : item;
        })
      );
    } catch (error) {
      console.error("Erro ao atualizar máquinas selecionadas:", error);
    }
  }, [maquinas]);

  useEffect(() => {
    try {
      if (!dataInicio || !dataFim || maquinasSelecionadas.length === 0) {
        setValorTotal(0);
        setValorTotalEditado(0);
        return;
      }

      // Validar datas
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);

      if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
        setValorTotal(0);
        setValorTotalEditado(0);
        return;
      }

      const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
      const valorFrete = Number(frete) || 0;

      const novoValorTotal =
        maquinasSelecionadas.reduce((acc, item) => {
          const valorDiaria = Number(item.valorDiaria) || 0;
          const quantidade = parseInt(item.quantidade || "1") || 1;
          return acc + dias * valorDiaria * quantidade;
        }, 0) + valorFrete;

      setValorTotal(novoValorTotal);
      setValorTotalEditado(novoValorTotal);
    } catch (error) {
      console.error("Erro ao calcular valor total:", error);
      setValorTotal(0);
      setValorTotalEditado(0);
    }
  }, [
    dataInicio,
    dataFim,
    frete,
    maquinasSelecionadas,
    modoEdicao,
    locacaoAtual,
  ]);

  useEffect(() => {
    try {
      if (locacaoAtual) {
        setEndereco(locacaoAtual.endereco || "");
        setFrete(locacaoAtual.valorFrete?.toString() || "");
        setPago(locacaoAtual.pago || "nao");
        setValorTotalEditado(locacaoAtual.valorTotal || 0);
        setClienteSelecionadoId(locacaoAtual.clienteId || "");

        // Definir o tipo de locação baseado no status original
        if (modoEdicao) {
          setTipoLocacao(
            locacaoAtual.status === "reservada" ? "reserva" : "imediata"
          );
        }

        if (locacaoAtual.dataInicio) {
          try {
            const dataInicio = locacaoAtual.dataInicio.toDate();
            setDataInicio(dataInicio.toISOString().split("T")[0]);
          } catch (dateError) {
            console.error("Erro ao processar data de início:", dateError);
            setDataInicio("");
          }
        }

        if (locacaoAtual.dataFim) {
          try {
            const dataFim = locacaoAtual.dataFim.toDate();
            setDataFim(
              dataFim.getFullYear() +
                "-" +
                String(dataFim.getMonth() + 1).padStart(2, "0") +
                "-" +
                String(dataFim.getDate()).padStart(2, "0")
            );
          } catch (dateError) {
            console.error("Erro ao processar data de fim:", dateError);
            setDataFim("");
          }
        }
      } else {
        setClienteSelecionadoId("");
      }
    } catch (error) {
      console.error("Erro ao configurar dados da locação atual:", error);
      setError("Erro ao carregar dados da locação. Tente novamente.");
    }
  }, [locacaoAtual, modoEdicao]);

  const validateForm = () => {
    const errors = {};

    if (!pago) {
      errors.pago = "Status de pagamento é obrigatório";
    }

    const dataInicioObj = new Date(dataInicio + "T00:00:00-03:00");
    const dataFimObj = new Date(dataFim + "T23:59:59-03:00");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (!dataInicio) {
      errors.dataInicio = "Data de início é obrigatória";
    } else if (
      tipoLocacao === "imediata" &&
      !modoEdicao &&
      isBefore(dataInicioObj, hoje)
    ) {
      errors.dataInicio = "Data de início não pode ser anterior a hoje";
    } else if (tipoLocacao === "reserva" && isBefore(dataInicioObj, hoje)) {
      errors.dataInicio = "Para reservas, a data de início deve ser futura";
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

    if (!clienteSelecionadoId) {
      errors.cliente = "Cliente é obrigatório";
    }

    // Validações específicas para máquinas
    if (maquinasSelecionadas.length === 0) {
      errors.maquinas = "Pelo menos uma máquina deve ser selecionada";
    } else {
      // Verificar máquinas duplicadas apenas se não for modo edição ou renovação
      if (!modoEdicao && !modoRenovacao) {
        const idsMaquinas = maquinasSelecionadas
          .filter((item) => item.maquina && item.maquina.id)
          .map((item) => item.maquina.id);
        const idsUnicos = [...new Set(idsMaquinas)];
        if (idsMaquinas.length !== idsUnicos.length) {
          errors.maquinas =
            "Não é possível selecionar a mesma máquina mais de uma vez";
        }
      }

      // Verificar quantidades válidas
      maquinasSelecionadas.forEach((item, index) => {
        if (!item.maquina || !item.maquina.id) {
          errors[`maquina_${index}`] = "Máquina inválida";
          return;
        }

        const quantidadeSolicitada = parseInt(item.quantidade) || 0;
        let quantidadeDisponivel =
          item.maquina.quantidade - (item.maquina.quantidadeLocada || 0);
        if (modoEdicao || modoRenovacao) {
          quantidadeDisponivel += quantidadeSolicitada;
        }
        if (quantidadeSolicitada <= 0) {
          errors[`maquina_${index}`] = "Quantidade deve ser maior que zero";
        } else if (
          tipoLocacao === "imediata" &&
          quantidadeSolicitada > quantidadeDisponivel
        ) {
          errors[
            `maquina_${index}`
          ] = `Quantidade solicitada (${quantidadeSolicitada}) excede a disponível (${quantidadeDisponivel})`;
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      mostrarErroValidacaoTemporizado(errors);
    }
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const erros = validateForm();
      if (Object.keys(erros).length > 0) {
        setValidationErrors(erros);
        setIsLoading(false);
        mostrarErroValidacaoTemporizado(erros);
        return;
      }

      const clienteSelecionado = clientes.find(
        (c) => c.id === clienteSelecionadoId
      );
      if (!clienteSelecionado) {
        throw new Error(
          "Cliente não encontrado. Por favor, selecione um cliente válido."
        );
      }

      const maquinasParaLocar = maquinasSelecionadas
        .filter(
          (item) =>
            item.maquina && item.maquina.id && item.maquina.id.trim() !== ""
        )
        .map((item) => ({
          maquinaId: item.maquina.id,
          maquinaNome: item.maquina.nome,
          quantidade: parseInt(item.quantidade),
          valorDiaria: parseFloat(item.valorDiaria),
        }));

      if (maquinasParaLocar.length === 0) {
        throw new Error(
          "Nenhuma máquina válida para locar. Por favor, selecione pelo menos uma máquina."
        );
      }

      // Validar se as máquinas ainda estão disponíveis
      for (const maquinaLocacao of maquinasParaLocar) {
        const maquina = maquinas.find((m) => m.id === maquinaLocacao.maquinaId);
        if (!maquina) {
          throw new Error(
            `Máquina "${maquinaLocacao.maquinaNome}" não foi encontrada no sistema.`
          );
        }

        if (tipoLocacao === "imediata") {
          let quantidadeDisponivel =
            maquina.quantidade - (maquina.quantidadeLocada || 0);

          // Se estiver editando ou renovando, some a quantidade da própria locação antiga
          if (
            (modoEdicao || modoRenovacao) &&
            locacaoAtual &&
            Array.isArray(locacaoAtual.maquinas)
          ) {
            const maquinaAntiga = locacaoAtual.maquinas.find(
              (m) => m.maquinaId === maquinaLocacao.maquinaId
            );
            if (maquinaAntiga) {
              quantidadeDisponivel += maquinaAntiga.quantidade;
            }
          }

          if (maquinaLocacao.quantidade > quantidadeDisponivel) {
            throw new Error(
              `Máquina "${maquina.nome}" não possui unidades suficientes. Disponível: ${quantidadeDisponivel}, Solicitado: ${maquinaLocacao.quantidade}`
            );
          }
        }
      }

      const dataInicioAjustada = new Date(dataInicio + "T00:00:00-03:00");
      const dataFimAjustada = new Date(dataFim + "T23:59:59-03:00");

      // Validar datas
      if (
        isNaN(dataInicioAjustada.getTime()) ||
        isNaN(dataFimAjustada.getTime())
      ) {
        throw new Error(
          "Datas inválidas. Por favor, verifique as datas de início e fim."
        );
      }

      const dataCriacao =
        locacaoAtual && locacaoAtual.dataCriacao
          ? locacaoAtual.dataCriacao
          : Timestamp.now();

      const locacaoData = {
        maquinas: maquinasParaLocar,
        clienteId: clienteSelecionadoId,
        clienteNome: clienteSelecionado.nome,
        dataInicio: Timestamp.fromDate(dataInicioAjustada),
        dataFim: Timestamp.fromDate(dataFimAjustada),
        valorTotal: parseFloat(valorTotalEditado),
        valorFrete: parseFloat(frete) || 0,
        endereco: endereco,
        status: modoEdicao
          ? locacaoAtual.status
          : tipoLocacao === "reserva"
          ? "reservada"
          : "ativa",
        tipoLocacao: modoEdicao ? locacaoAtual.tipoLocacao : tipoLocacao,
        dataCriacao,
        pago: pago,
      };

      if (modoRenovacao && locacaoAtual?.id) {
        // Salva os dados para renovar após confirmação da senha
        setPendingRenewData({
          id: locacaoAtual.id,
          locacaoAntiga: locacaoAtual,
          novaLocacao: locacaoData,
        });
        setShowConfirmacaoAdmin(true);
        setIsLoading(false);
        return;
      } else if (modoEdicao && locacaoAtual?.id) {
        // Salva os dados para editar após confirmação da senha
        setPendingEditData({ id: locacaoAtual.id, data: locacaoData });
        setShowConfirmacaoAdmin(true);
        setIsLoading(false);
        return;
      } else {
        await adicionarLocacao(locacaoData);
        // Chama onSubmit para atualizar o estado da máquina apenas se for locação imediata
        if (onSubmit && tipoLocacao === "imediata") {
          const quantidadeTotal = maquinasParaLocar.reduce(
            (acc, m) => acc + m.quantidade,
            0
          );
          onSubmit({ quantidade: quantidadeTotal });
        }
        // Recarregar a página para atualizar os dados
        window.location.reload();
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar locação:", error);
      const mensagemErro =
        error.message || "Erro inesperado ao salvar locação. Tente novamente.";
      mostrarErroTemporizado(mensagemErro);
    } finally {
      setIsLoading(false);
    }
  };

  // Função chamada após confirmação da senha de admin
  const handleConfirmAdminEdit = async () => {
    if (pendingEditData) {
      try {
        setIsLoading(true);
        await editarLocacao(pendingEditData.id, pendingEditData.data);
        setShowConfirmacaoAdmin(false);
        setPendingEditData(null);
        if (onSubmit) {
          onSubmit({
            quantidade: pendingEditData.data.maquinas?.reduce(
              (acc, m) => acc + (m.quantidade || 0),
              0
            ),
          });
        }
        window.location.reload();
        onClose();
      } catch (error) {
        console.error("Erro ao editar locação:", error);
        const mensagemErro =
          error.message || "Erro ao editar locação. Tente novamente.";
        mostrarErroTemporizado(mensagemErro);
        setShowConfirmacaoAdmin(false);
        setPendingEditData(null);
        setIsLoading(false);
      }
    } else if (pendingRenewData) {
      await handleConfirmAdminRenew();
    }
  };

  // Adicionar função para confirmação de renovação
  const handleConfirmAdminRenew = async () => {
    if (pendingRenewData) {
      try {
        setIsLoading(true);
        const locacaoAntigaLimpa = { ...pendingRenewData.locacaoAntiga };
        if (Array.isArray(locacaoAntigaLimpa.maquinas)) {
          locacaoAntigaLimpa.maquinas = locacaoAntigaLimpa.maquinas.filter(
            (m) =>
              m &&
              m.maquinaId &&
              typeof m.maquinaId === "string" &&
              m.maquinaId.trim() !== ""
          );
        }
        Object.keys(locacaoAntigaLimpa).forEach((k) => {
          if (locacaoAntigaLimpa[k] === undefined) delete locacaoAntigaLimpa[k];
        });

        // Validar dados antes de salvar
        if (
          !pendingRenewData.novaLocacao.maquinas ||
          pendingRenewData.novaLocacao.maquinas.length === 0
        ) {
          throw new Error(
            "Dados da nova locação inválidos. Por favor, tente novamente."
          );
        }

        await editarLocacao(pendingRenewData.id, {
          ...locacaoAntigaLimpa,
          status: "concluida",
          dataConclusao: Timestamp.now(),
        });
        await adicionarLocacao(pendingRenewData.novaLocacao);
        setShowConfirmacaoAdmin(false);
        setPendingRenewData(null);
        if (onSubmit) {
          onSubmit({
            quantidade: pendingRenewData.novaLocacao.maquinas?.reduce(
              (acc, m) => acc + (m.quantidade || 0),
              0
            ),
          });
        }
        window.location.reload();
        onClose();
      } catch (error) {
        console.error("Erro ao renovar locação:", error);
        const mensagemErro =
          error.message || "Erro ao renovar locação. Tente novamente.";
        mostrarErroTemporizado(mensagemErro);
        setShowConfirmacaoAdmin(false);
        setPendingRenewData(null);
        setIsLoading(false);
      }
    }
  };

  const handleAddCliente = async (novoCliente) => {
    try {
      setIsLoading(true);

      // Validar dados do cliente
      if (!novoCliente.nome || novoCliente.nome.trim().length < 2) {
        throw new Error("Nome do cliente deve ter pelo menos 2 caracteres.");
      }

      if (!novoCliente.telefone || novoCliente.telefone.trim().length < 10) {
        throw new Error("Telefone do cliente deve ter pelo menos 10 dígitos.");
      }

      if (!novoCliente.cpf || novoCliente.cpf.trim().length < 11) {
        throw new Error("CPF do cliente deve ter pelo menos 11 dígitos.");
      }

      const clienteAdicionado = await addCliente({
        nome: novoCliente.nome.trim(),
        telefone: novoCliente.telefone.trim(),
        cpf: novoCliente.cpf.trim(),
        endereco: "",
      });

      if (clienteAdicionado) {
        setEndereco("");
        setShowAddCliente(false);
        setClienteSelecionadoId(clienteAdicionado.id);
        mostrarErroTemporizado("Cliente adicionado com sucesso!", 3000);
      } else {
        throw new Error("Falha ao adicionar cliente. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      const mensagemErro =
        error.message ||
        "Erro ao adicionar cliente. Por favor, tente novamente.";
      mostrarErroTemporizado(mensagemErro);
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarMaquina = () => {
    try {
      console.log("Adicionar máquina - Debug:", {
        maquinas: maquinas.length,
        maquinasSelecionadas: maquinasSelecionadas.length,
        modoEdicao,
        modoRenovacao,
        tipoLocacao,
      });

      if (maquinas.length === 0) {
        throw new Error("Nenhuma máquina disponível no sistema.");
      }

      // Verificar máquinas já selecionadas
      const idsSelecionados = maquinasSelecionadas
        .filter((item) => item.maquina && item.maquina.id)
        .map((item) => item.maquina.id);

      console.log("IDs já selecionados:", idsSelecionados);

      // Encontrar máquinas disponíveis que não estão selecionadas
      const maquinasDisponiveis = maquinas.filter((m) => {
        // Verificar se a máquina não está já selecionada
        if (idsSelecionados.includes(m.id)) {
          console.log(`Máquina ${m.nome} já selecionada`);
          return false;
        }

        // Verificar se há unidades disponíveis (para locação imediata)
        if (tipoLocacao === "imediata") {
          const quantidadeDisponivel = m.quantidade - (m.quantidadeLocada || 0);
          console.log(
            `Máquina ${m.nome} - Disponível: ${quantidadeDisponivel}`
          );
          return quantidadeDisponivel > 0;
        }

        // Para reservas, permitir adicionar qualquer máquina
        console.log(`Máquina ${m.nome} disponível para reserva`);
        return true;
      });

      console.log("Máquinas disponíveis:", maquinasDisponiveis.length);

      if (maquinasDisponiveis.length === 0) {
        throw new Error(
          "Não há máquinas disponíveis para adicionar. Todas as máquinas já estão selecionadas ou não há unidades disponíveis."
        );
      }

      // Pegar a primeira máquina disponível
      const maquinaDisponivel = maquinasDisponiveis[0];

      if (!maquinaDisponivel || !maquinaDisponivel.id) {
        throw new Error("Máquina selecionada é inválida. Tente novamente.");
      }

      console.log("Adicionando máquina:", maquinaDisponivel.nome);

      setMaquinasSelecionadas((prev) => {
        const novaLista = [
          ...prev,
          {
            maquina: maquinaDisponivel,
            quantidade: "1",
            valorDiaria: maquinaDisponivel.valorDiaria || 0,
          },
        ];
        console.log("Nova lista de máquinas:", novaLista.length);
        return novaLista;
      });

      // Limpar erro se existir
      setError(null);
    } catch (error) {
      console.error("Erro ao adicionar máquina:", error);
      const mensagemErro =
        error.message || "Erro ao adicionar máquina. Tente novamente.";
      mostrarErroTemporizado(mensagemErro);
    }
  };

  const atualizarMaquinaSelecionada = (index, campo, valor) => {
    try {
      if (index < 0 || index >= maquinasSelecionadas.length) {
        throw new Error("Índice de máquina inválido.");
      }

      if (!campo || typeof campo !== "string") {
        throw new Error("Campo inválido para atualização.");
      }

      // Validações específicas por campo
      if (campo === "quantidade") {
        const quantidade = parseInt(valor) || 0;
        if (quantidade < 1) {
          throw new Error("Quantidade deve ser maior que zero.");
        }
      }

      if (campo === "valorDiaria") {
        const valorDiaria = parseFloat(valor) || 0;
        if (valorDiaria < 0) {
          throw new Error("Valor da diária não pode ser negativo.");
        }
      }

      setMaquinasSelecionadas((prev) =>
        prev.map((item, i) => {
          if (i === index) {
            if (campo === "maquina") {
              // Tratamento especial para atualizar a máquina
              return {
                ...item,
                maquina: valor,
                valorDiaria: valor.valorDiaria || item.valorDiaria,
              };
            } else {
              return { ...item, [campo]: valor };
            }
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Erro ao atualizar máquina selecionada:", error);
      const mensagemErro =
        error.message || "Erro ao atualizar máquina. Tente novamente.";
      mostrarErroTemporizado(mensagemErro);
    }
  };

  const removerMaquina = (index) => {
    try {
      if (index < 0 || index >= maquinasSelecionadas.length) {
        throw new Error("Índice de máquina inválido.");
      }

      const maquina = maquinasSelecionadas[index];
      if (!maquina || !maquina.maquina) {
        throw new Error("Máquina não encontrada.");
      }

      if (
        window.confirm(
          `Tem certeza que deseja remover a máquina "${maquina.maquina.nome}" da locação?`
        )
      ) {
        setMaquinasSelecionadas((prev) => prev.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error("Erro ao remover máquina:", error);
      const mensagemErro =
        error.message || "Erro ao remover máquina. Tente novamente.";
      mostrarErroTemporizado(mensagemErro);
    }
  };

  const limparFormulario = useCallback(() => {
    try {
      console.log("Limpar formulário chamado");
      // Limpar timeouts existentes
      if (errorTimeout) {
        clearTimeout(errorTimeout);
        setErrorTimeout(null);
      }

      // Só limpar máquinas se não estiver em modo edição ou renovação
      if (!modoEdicao && !modoRenovacao) {
        setMaquinasSelecionadas(
          maquinaInicial && maquinaInicial.valorDiaria !== undefined
            ? [
                {
                  maquina: maquinaInicial,
                  quantidade: "1",
                  valorDiaria: maquinaInicial.valorDiaria || 0,
                },
              ]
            : []
        );
      }

      setDataInicio("");
      setDataFim("");
      setEndereco("");
      setFrete("");
      setValorTotal(0);
      setValorTotalEditado(0);
      setError(null);
      setValidationErrors({});
      setPago("nao");
      setClienteSelecionadoId("");
      setBuscaCliente("");
      setClienteSelecionado(null);
    } catch (error) {
      console.error("Erro ao limpar formulário:", error);
      // Não mostrar erro para o usuário neste caso, apenas log
    }
  }, [maquinaInicial, errorTimeout, modoEdicao, modoRenovacao]);

  const mostrarErroTemporizado = useCallback(
    (mensagem, duracao = 10000) => {
      try {
        if (!mensagem || typeof mensagem !== "string") {
          console.warn("Mensagem de erro inválida:", mensagem);
          return;
        }

        // Limpar timeout anterior se existir
        if (errorTimeout) {
          clearTimeout(errorTimeout);
        }

        setError(mensagem);

        // Configurar timeout para limpar o erro
        const timeout = setTimeout(() => {
          setError(null);
          setErrorTimeout(null);
        }, duracao);

        setErrorTimeout(timeout);
      } catch (error) {
        console.error("Erro ao mostrar mensagem temporizada:", error);
      }
    },
    [errorTimeout]
  );

  const mostrarErroValidacaoTemporizado = (erros, duracao = 10000) => {
    try {
      if (!erros || typeof erros !== "object") {
        console.warn("Erros de validação inválidos:", erros);
        return;
      }

      // Limpar timeout anterior se existir
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }

      setValidationErrors(erros);

      // Configurar timeout para limpar os erros
      const timeout = setTimeout(() => {
        setValidationErrors({});
        setErrorTimeout(null);
      }, duracao);

      setErrorTimeout(timeout);
    } catch (error) {
      console.error("Erro ao mostrar validações temporizadas:", error);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      console.log("Modal fechado - limpando formulário");
      limparFormulario();
    }
  }, [isOpen, limparFormulario]);

  // Limpar timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
    };
  }, [errorTimeout]);

  console.log("Clientes carregados:", clientes);
  console.log(
    "Clientes com id vazio:",
    clientes.filter((c) => !c.id || c.id.trim() === "")
  );
  console.log("Máquinas selecionadas:", maquinasSelecionadas);
  console.log(
    "Máquinas com id vazio:",
    maquinasSelecionadas.filter(
      (item) =>
        !item.maquina || !item.maquina.id || item.maquina.id.trim() === ""
    )
  );

  if (modoRenovacao && (!locacaoAtual || maquinas.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-4 text-gray-600 text-lg">
          Preparando renovação...
        </span>
      </div>
    );
  }

  if (maquinas.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-4 text-gray-600 text-lg">
          Carregando máquinas...
        </span>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {modoRenovacao
                    ? "Renovar Locação"
                    : modoEdicao
                    ? "Editar Locação"
                    : "Nova Locação"}
                </h2>
                <button
                  onClick={() => {
                    limparFormulario();
                    onClose();
                  }}
                  className="text-gray-500 hover:text-gray-700"
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
                <div className="mb-4 relative">
                  <label className="text-sm font-medium text-gray-700">
                    Cliente
                  </label>
                  <div className="flex gap-2 items-center">
                    {modoEdicao || modoRenovacao ? (
                      <input
                        type="text"
                        value={
                          clientes.find((c) => c.id === clienteSelecionadoId)
                            ?.nome || ""
                        }
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-100 text-gray-700 outline-none"
                        disabled
                      />
                    ) : (
                      <>
                        <input
                          type="text"
                          value={
                            clienteSelecionado
                              ? clienteSelecionado.nome
                              : buscaCliente
                          }
                          onChange={(e) => {
                            setBuscaCliente(e.target.value);
                            setClienteSelecionado(null);
                            setClienteSelecionadoId("");
                          }}
                          placeholder="Digite o nome ou CPF do cliente"
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                        {buscaCliente &&
                          clientes.filter(
                            (c) =>
                              c.nome
                                .toLowerCase()
                                .includes(buscaCliente.toLowerCase()) ||
                              c.cpf
                                .toLowerCase()
                                .includes(buscaCliente.toLowerCase())
                          ).length === 0 && (
                            <span className="text-red-500 text-sm ml-2">
                              Cliente não encontrado
                            </span>
                          )}
                        {buscaCliente &&
                          clientes.filter(
                            (c) =>
                              c.nome
                                .toLowerCase()
                                .includes(buscaCliente.toLowerCase()) ||
                              c.cpf
                                .toLowerCase()
                                .includes(buscaCliente.toLowerCase())
                          ).length > 0 &&
                          !clienteSelecionado && (
                            <ul
                              className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg mt-2 max-h-48 overflow-y-auto shadow-lg z-20"
                              style={{ top: "100%", position: "absolute" }}
                            >
                              {clientes
                                .filter(
                                  (c) =>
                                    c.nome
                                      .toLowerCase()
                                      .includes(buscaCliente.toLowerCase()) ||
                                    c.cpf
                                      .toLowerCase()
                                      .includes(buscaCliente.toLowerCase())
                                )
                                .map((cliente) => (
                                  <li
                                    key={cliente.id}
                                    className="px-4 py-2 cursor-pointer hover:bg-emerald-100"
                                    onClick={() => {
                                      setClienteSelecionado(cliente);
                                      setClienteSelecionadoId(cliente.id);
                                      setBuscaCliente("");
                                    }}
                                  >
                                    {cliente.nome}{" "}
                                    {cliente.cpf && (
                                      <span className="text-xs text-gray-400 ml-2">
                                        ({cliente.cpf})
                                      </span>
                                    )}
                                  </li>
                                ))}
                            </ul>
                          )}
                        <button
                          type="button"
                          onClick={() => setShowAddCliente(true)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm ml-2"
                        >
                          + Novo Cliente
                        </button>
                      </>
                    )}
                  </div>
                  {validationErrors.cliente && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.cliente}
                    </p>
                  )}
                </div>

                {/* Toggle de Tipo de Locação */}
                {!modoEdicao && !modoRenovacao && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-800 mb-1">
                          Tipo de Locação
                        </h3>
                        <p className="text-xs text-gray-600">
                          {tipoLocacao === "imediata"
                            ? "A máquina será locada imediatamente e ficará indisponível"
                            : "A máquina será reservada para a data selecionada e permanecerá disponível até então"}
                        </p>
                        <p className="text-xs text-green-600 font-medium mt-1">
                          Tipo selecionado:{" "}
                          {tipoLocacao === "imediata"
                            ? "Locação Imediata"
                            : "Reserva"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-sm font-medium ${
                            tipoLocacao === "imediata"
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          Imediata
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const novoTipo =
                              tipoLocacao === "imediata"
                                ? "reserva"
                                : "imediata";
                            setTipoLocacao(novoTipo);
                          }}
                          disabled={maquinasSelecionadas.some((item) => {
                            if (!item.maquina || !item.maquina.id) return false;
                            const quantidadeDisponivel =
                              item.maquina.quantidade -
                              (item.maquina.quantidadeLocada || 0);
                            return quantidadeDisponivel <= 0;
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                            tipoLocacao === "reserva"
                              ? "bg-green-600"
                              : "bg-gray-200"
                          } ${
                            maquinasSelecionadas.some((item) => {
                              if (!item.maquina || !item.maquina.id)
                                return false;
                              const quantidadeDisponivel =
                                item.maquina.quantidade -
                                (item.maquina.quantidadeLocada || 0);
                              return quantidadeDisponivel <= 0;
                            })
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              tipoLocacao === "reserva"
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-sm font-medium ${
                            tipoLocacao === "reserva"
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          Reserva
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensagem informativa para máquinas indisponíveis */}
                {!modoEdicao &&
                  !modoRenovacao &&
                  maquinasSelecionadas.some((item) => {
                    if (!item.maquina || !item.maquina.id) return false;
                    const quantidadeDisponivel =
                      item.maquina.quantidade -
                      (item.maquina.quantidadeLocada || 0);
                    return quantidadeDisponivel <= 0;
                  }) && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <i className="bx bx-info-circle text-blue-600 text-lg mt-0.5"></i>
                        <div>
                          <h4 className="text-sm font-medium text-blue-800 mb-1">
                            Máquina Indisponível
                          </h4>
                          <p className="text-xs text-blue-700">
                            Uma ou mais máquinas selecionadas estão atualmente
                            indisponíveis. O tipo de locação foi automaticamente
                            alterado para "Reserva" para permitir que você
                            agende a locação para uma data futura.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {maquinasSelecionadas.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        Nenhuma máquina para exibir nesta locação.
                      </div>
                    ) : (
                      maquinasSelecionadas
                        .filter(
                          (item) =>
                            item.maquina &&
                            item.maquina.id &&
                            item.maquina.id.trim() !== ""
                        )
                        .map((item, index) => (
                          <div
                            key={item.maquina.id}
                            className="bg-gray-50 p-4 rounded-xl mb-2 relative group"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-semibold text-gray-800">
                                Máquina
                              </h3>
                              {!(
                                modoRenovacao &&
                                maquinasSelecionadas.length === 1
                              ) &&
                                maquinasSelecionadas.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removerMaquina(index)}
                                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 group-hover:bg-red-50"
                                    title="Remover máquina"
                                  >
                                    <i className="bx bx-trash text-lg"></i>
                                  </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm text-gray-600">
                                  Selecione
                                </label>
                                <select
                                  value={item.maquina.id}
                                  onChange={(e) => {
                                    const novaMaquina = maquinas.find(
                                      (m) => m.id === e.target.value
                                    );
                                    if (novaMaquina) {
                                      atualizarMaquinaSelecionada(
                                        index,
                                        "maquina",
                                        novaMaquina
                                      );
                                    }
                                  }}
                                  className="w-full px-2 py-1 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                >
                                  {/* Agrupar por categoria e ordenar */}
                                  {Object.entries(
                                    maquinas
                                      .filter(
                                        (m) =>
                                          typeof m.id === "string" &&
                                          m.id.trim() !== ""
                                      )
                                      .reduce((acc, m) => {
                                        const cat =
                                          m.categoria || "Sem categoria";
                                        if (!acc[cat]) acc[cat] = [];
                                        acc[cat].push(m);
                                        return acc;
                                      }, {})
                                  )
                                    .sort(([catA], [catB]) =>
                                      catA.localeCompare(catB)
                                    )
                                    .map(([categoria, maquinasCat]) => (
                                      <optgroup
                                        key={categoria}
                                        label={categoria}
                                      >
                                        {maquinasCat
                                          .filter((m) => {
                                            // Verificar se a máquina não está já selecionada em outras posições
                                            const idsSelecionados =
                                              maquinasSelecionadas
                                                .filter(
                                                  (item, i) =>
                                                    i !== index &&
                                                    item.maquina &&
                                                    item.maquina.id
                                                )
                                                .map((item) => item.maquina.id);
                                            return !idsSelecionados.includes(
                                              m.id
                                            );
                                          })
                                          .sort((a, b) =>
                                            a.nome.localeCompare(b.nome)
                                          )
                                          .map((m, idx) => (
                                            <option
                                              key={m.id || `sem-id-${idx}`}
                                              value={m.id}
                                            >
                                              {m.nome}
                                            </option>
                                          ))}
                                      </optgroup>
                                    ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-sm text-gray-600">
                                  Valor Diária
                                </label>
                                <input
                                  type="number"
                                  value={item.valorDiaria}
                                  onChange={(e) =>
                                    atualizarMaquinaSelecionada(
                                      index,
                                      "valorDiaria",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full px-2 py-1 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-600">
                                  Quantidade
                                </label>
                                {(() => {
                                  const quantidadeLocadaNaLocacao =
                                    parseInt(item.quantidade) || 0;
                                  let maxDisponivel =
                                    item.maquina.quantidade -
                                    (item.maquina.quantidadeLocada || 0);
                                  if (modoEdicao) {
                                    maxDisponivel += quantidadeLocadaNaLocacao;
                                  }
                                  return (
                                    <>
                                      <input
                                        type="number"
                                        value={item.quantidade}
                                        onChange={(e) => {
                                          const valor = e.target.value;
                                          const valorNumerico =
                                            parseInt(valor) || 0;
                                          if (valorNumerico > maxDisponivel) {
                                            atualizarMaquinaSelecionada(
                                              index,
                                              "quantidade",
                                              maxDisponivel.toString()
                                            );
                                          } else if (valorNumerico < 1) {
                                            atualizarMaquinaSelecionada(
                                              index,
                                              "quantidade",
                                              "1"
                                            );
                                          } else {
                                            atualizarMaquinaSelecionada(
                                              index,
                                              "quantidade",
                                              valor
                                            );
                                          }
                                        }}
                                        min="1"
                                        max={maxDisponivel}
                                        className="w-full px-2 py-1 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        disabled={maxDisponivel <= 0}
                                      />
                                      {maxDisponivel <= 0 && !modoRenovacao && (
                                        <p className="text-xs text-red-500 mt-1">
                                          Sem unidades disponíveis
                                        </p>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Disponíveis:{" "}
                              {item.maquina.quantidade -
                                (item.maquina.quantidadeLocada || 0)}{" "}
                              unidade(s)
                            </div>
                          </div>
                        ))
                    )}
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          console.log("Botão Adicionar Máquina clicado");
                          adicionarMaquina();
                        }}
                        className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center"
                      >
                        <i className="bx bx-plus mr-1"></i> Adicionar Máquina
                      </button>
                    </div>

                    {/* Exibir erros de validação das máquinas */}
                    {validationErrors.maquinas && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">
                          <i className="bx bx-error-circle mr-1"></i>
                          {validationErrors.maquinas}
                        </p>
                      </div>
                    )}

                    {/* Exibir erros específicos de cada máquina */}
                    {maquinasSelecionadas.map((item, index) => {
                      const errorKey = `maquina_${index}`;
                      return validationErrors[errorKey] ? (
                        <div
                          key={errorKey}
                          className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <p className="text-sm text-red-600">
                            <i className="bx bx-error-circle mr-1"></i>
                            <strong>{item.maquina.nome}:</strong>{" "}
                            {validationErrors[errorKey]}
                          </p>
                        </div>
                      ) : null;
                    })}
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
                      onClick={() => {
                        limparFormulario();
                        onClose();
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 font-medium transition-colors"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={
                        isLoading ||
                        maquinasSelecionadas.length === 0 ||
                        maquinas.length === 0
                      }
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
                          {modoEdicao
                            ? "Salvar Alterações"
                            : modoRenovacao
                            ? "Renovar Locação"
                            : "Confirmar Locação"}
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}

      <AddClienteModal
        isOpen={showAddCliente}
        onClose={() => setShowAddCliente(false)}
        onSubmit={handleAddCliente}
      />

      {/* Modal de confirmação de admin para edição de locação ativa */}
      <ConfirmacaoModal
        isOpen={showConfirmacaoAdmin}
        onClose={() => {
          setShowConfirmacaoAdmin(false);
          setPendingEditData(null);
          setPendingRenewData(null);
        }}
        onConfirm={handleConfirmAdminEdit}
        titulo="Confirmação de Administrador"
        mensagem="Para editar esta locação, por favor insira sua senha de administrador."
      />
    </AnimatePresence>
  );
}
