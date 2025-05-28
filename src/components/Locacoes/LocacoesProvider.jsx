import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocacoes } from "../../hooks/useLocacoes";
import { useMaquinas } from "../../hooks/useMaquinas";
import { useClientes } from "../../hooks/useClientes";
import ListaLocacoes from "./ListaLocacoes";
import ConfirmacaoModal from "../Clientes/ConfirmacaoModal";
import { registrarAtividade } from "../../utils/atividades";

export default function LocacoesProvider({ termoBusca }) {
  const { locacoes, loading, error, editarLocacao } = useLocacoes();
  const { maquinas, editarMaquina } = useMaquinas();
  const { clientes } = useClientes();
  const [locacoesFiltradas, setLocacoesFiltradas] = useState([]);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [locacaoSelecionada, setLocacaoSelecionada] = useState(null);

  useEffect(() => {
    const locacoesAtivas = locacoes.filter(
      (locacao) => locacao.status === "ativa"
    );
    const filtradas = locacoesAtivas.filter((locacao) => {
      const maquina = maquinas.find((m) => m.id === locacao.maquinaId);
      const cliente = clientes.find((c) => c.id === locacao.clienteId);
      const termo = termoBusca.toLowerCase();

      return (
        (maquina?.nome.toLowerCase().includes(termo) ||
          cliente?.nome.toLowerCase().includes(termo)) &&
        locacao.status === "ativa"
      );
    });

    setLocacoesFiltradas(filtradas);
  }, [locacoes, maquinas, termoBusca, clientes]);

  const atualizarStatusMaquina = async (maquinaId) => {
    try {
      const locacoesAtivasDaMaquina = locacoes.filter(
        (locacao) =>
          locacao.maquinaId === maquinaId && locacao.status === "ativa"
      );

      const quantidadeTotalLocada = locacoesAtivasDaMaquina.reduce(
        (total, locacao) => total + (locacao.quantidade || 0),
        0
      );

      const maquina = maquinas.find((m) => m.id === maquinaId);
      if (maquina) {
        const maquinaAtualizada = {
          ...maquina,
          quantidadeLocada: quantidadeTotalLocada,
          disponivel: quantidadeTotalLocada < maquina.quantidade,
        };

        await editarMaquina(maquinaId, maquinaAtualizada);
      }
    } catch (error) {
      console.error("Erro ao atualizar status da máquina:", error);
    }
  };

  const handleConcluirLocacao = async () => {
    if (!locacaoSelecionada) return;

    try {
      const locacaoAtualizada = {
        ...locacaoSelecionada,
        status: "concluida",
        dataConclusao: new Date(),
      };
      await editarLocacao(locacaoSelecionada.id, locacaoAtualizada);
      await atualizarStatusMaquina(locacaoSelecionada.maquinaId);

      await registrarAtividade("devolucao", {
        clienteNome: locacaoSelecionada.clienteNome,
        maquinaNome: locacaoSelecionada.maquinaNome,
      });

      setShowConfirmacao(false);
      setLocacaoSelecionada(null);
    } catch (error) {
      console.error("Erro ao concluir locação:", error);
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
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ListaLocacoes
        locacoes={locacoesFiltradas}
        clientes={clientes}
        maquinas={maquinas}
        onConcluir={(locacao) => {
          setLocacaoSelecionada(locacao);
          setShowConfirmacao(true);
        }}
      />

      <ConfirmacaoModal
        isOpen={showConfirmacao}
        onClose={() => {
          setShowConfirmacao(false);
          setLocacaoSelecionada(null);
        }}
        onConfirm={handleConcluirLocacao}
        tipo="concluir"
        titulo="Concluir Locação"
        mensagem="Tem certeza que deseja concluir esta locação? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
