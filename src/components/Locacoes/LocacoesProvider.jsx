import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocacoes } from "../../hooks/useLocacoes";
import { useMaquinas } from "../../hooks/useMaquinas";
import { useClientes } from "../../hooks/useClientes";
import ListaLocacoes from "./ListaLocacoes";
import ConfirmacaoModal from "../Clientes/ConfirmacaoModal";
import { registrarAtividade } from "../../utils/atividades";
import LocarMaquinaModal from "../Maquinas/LocarMaquinaModal";
import { useAuth } from "../../hooks/useAuth";

export default function LocacoesProvider({
  termoBusca,
  filtroStatus = "todas",
  onRenovar,
  onDeletar,
  scrollToLocacao,
  scrollToRef,
}) {
  const { locacoes, loading, error, editarLocacao } = useLocacoes();
  const { maquinas, editarMaquina } = useMaquinas();
  const { clientes } = useClientes();
  const [locacoesFiltradas, setLocacoesFiltradas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [locacaoSelecionada, setLocacaoSelecionada] = useState(null);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showConfirmacaoDelete, setShowConfirmacaoDelete] = useState(false);
  const [locacaoParaDeletar, setLocacaoParaDeletar] = useState(null);
  const { usuario } = useAuth();

  useEffect(() => {
    // Filtrar locações baseado no status selecionado
    let locacoesAtivas = [];
    let locacoesReservadas = [];

    if (filtroStatus === "todas" || filtroStatus === "ativas") {
      locacoesAtivas = locacoes.filter((locacao) => locacao.status === "ativa");
    }

    if (filtroStatus === "todas" || filtroStatus === "reservadas") {
      locacoesReservadas = locacoes.filter(
        (locacao) => locacao.status === "reservada"
      );
    }

    // Função para filtrar por termo de busca
    const filtrarPorTermo = (locacao) => {
      const maquina = maquinas.find((m) => m.id === locacao.maquinaId);
      const cliente = clientes.find((c) => c.id === locacao.clienteId);
      const termo = termoBusca.toLowerCase();

      return (
        maquina?.nome.toLowerCase().includes(termo) ||
        cliente?.nome.toLowerCase().includes(termo)
      );
    };

    const filtradas = locacoesAtivas.filter(filtrarPorTermo);
    const reservasFiltradas = locacoesReservadas.filter(filtrarPorTermo);

    // Ordenar por data de fim em ordem crescente (mais próxima primeiro)
    const ordenadas = filtradas.sort((a, b) => {
      // Converter Timestamp do Firestore para Date
      const dataFimA = a.dataFim?.toDate ? a.dataFim.toDate() : new Date(0);
      const dataFimB = b.dataFim?.toDate ? b.dataFim.toDate() : new Date(0);

      return dataFimA.getTime() - dataFimB.getTime();
    });

    const reservasOrdenadas = reservasFiltradas.sort((a, b) => {
      // Converter Timestamp do Firestore para Date
      const dataInicioA = a.dataInicio?.toDate
        ? a.dataInicio.toDate()
        : new Date(0);
      const dataInicioB = b.dataInicio?.toDate
        ? b.dataInicio.toDate()
        : new Date(0);

      return dataInicioA.getTime() - dataInicioB.getTime();
    });

    setLocacoesFiltradas(ordenadas);
    setReservasFiltradas(reservasOrdenadas);

    // Log para debug - mostrar as primeiras 3 locações ordenadas
    if (ordenadas.length > 0) {
      console.log(
        "Locações ordenadas por data de fim (primeiras 3):",
        ordenadas.slice(0, 3).map((loc) => ({
          id: loc.id,
          cliente: loc.clienteNome,
          dataFim: loc.dataFim?.toDate
            ? loc.dataFim.toDate().toLocaleDateString()
            : "Sem data",
        }))
      );
    }
  }, [locacoes, maquinas, termoBusca, clientes, filtroStatus]);

  const atualizarStatusMaquina = async (maquinaId) => {
    try {
      // Buscar todas as locações ativas que contêm esta máquina
      const locacoesAtivasDaMaquina = locacoes.filter((locacao) => {
        if (locacao.status !== "ativa") return false;

        // Verificar se a máquina está no array de máquinas (novo formato)
        if (Array.isArray(locacao.maquinas)) {
          return locacao.maquinas.some((m) => m.maquinaId === maquinaId);
        }

        // Verificar se é a máquina única (formato antigo)
        return locacao.maquinaId === maquinaId;
      });

      // Calcular quantidade total locada
      const quantidadeTotalLocada = locacoesAtivasDaMaquina.reduce(
        (total, locacao) => {
          if (Array.isArray(locacao.maquinas)) {
            // Novo formato: somar quantidade da máquina específica
            const maquinaLocacao = locacao.maquinas.find(
              (m) => m.maquinaId === maquinaId
            );
            return total + (maquinaLocacao?.quantidade || 0);
          } else {
            // Formato antigo: somar quantidade da locação
            return total + (locacao.quantidade || 0);
          }
        },
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

      // Atualizar status das máquinas
      if (Array.isArray(locacaoSelecionada.maquinas)) {
        for (const maquinaLocacao of locacaoSelecionada.maquinas) {
          await atualizarStatusMaquina(maquinaLocacao.maquinaId);
        }
      } else if (locacaoSelecionada.maquinaId) {
        await atualizarStatusMaquina(locacaoSelecionada.maquinaId);
      }

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

  const handleEditarLocacao = (locacao) => {
    setLocacaoSelecionada(locacao);
    setShowEditarModal(true);
  };

  const handleIniciarReserva = async (locacao) => {
    try {
      // Verificar se as máquinas estão disponíveis antes de iniciar a reserva
      const maquinasIndisponiveis = [];

      if (Array.isArray(locacao.maquinas)) {
        for (const maquinaLocacao of locacao.maquinas) {
          const maquina = maquinas.find(
            (m) => m.id === maquinaLocacao.maquinaId
          );
          if (maquina) {
            const quantidadeDisponivel =
              maquina.quantidade - (maquina.quantidadeLocada || 0);
            if (quantidadeDisponivel < maquinaLocacao.quantidade) {
              maquinasIndisponiveis.push({
                nome: maquina.nome,
                solicitada: maquinaLocacao.quantidade,
                disponivel: quantidadeDisponivel,
              });
            }
          }
        }
      } else if (locacao.maquinaId) {
        const maquina = maquinas.find((m) => m.id === locacao.maquinaId);
        if (maquina) {
          const quantidadeDisponivel =
            maquina.quantidade - (maquina.quantidadeLocada || 0);
          if (quantidadeDisponivel < (locacao.quantidade || 1)) {
            maquinasIndisponiveis.push({
              nome: maquina.nome,
              solicitada: locacao.quantidade || 1,
              disponivel: quantidadeDisponivel,
            });
          }
        }
      }

      // Se há máquinas indisponíveis, mostrar erro e não permitir iniciar
      if (maquinasIndisponiveis.length > 0) {
        const mensagemErro =
          maquinasIndisponiveis.length === 1
            ? `A máquina "${maquinasIndisponiveis[0].nome}" não possui unidades suficientes. Solicitado: ${maquinasIndisponiveis[0].solicitada}, Disponível: ${maquinasIndisponiveis[0].disponivel}`
            : `As seguintes máquinas não possuem unidades suficientes:\n${maquinasIndisponiveis
                .map(
                  (m) =>
                    `- ${m.nome}: Solicitado ${m.solicitada}, Disponível ${m.disponivel}`
                )
                .join("\n")}`;

        alert(
          `Não é possível iniciar esta reserva.\n\n${mensagemErro}\n\nVerifique se as máquinas estão disponíveis antes de tentar novamente.`
        );
        return;
      }

      // Se todas as máquinas estão disponíveis, prosseguir com a ativação
      const locacaoAtualizada = {
        ...locacao,
        status: "ativa",
        tipoLocacao: "imediata",
      };
      await editarLocacao(locacao.id, locacaoAtualizada);

      // Atualizar status das máquinas
      if (Array.isArray(locacao.maquinas)) {
        for (const maquinaLocacao of locacao.maquinas) {
          await atualizarStatusMaquina(maquinaLocacao.maquinaId);
        }
      } else if (locacao.maquinaId) {
        await atualizarStatusMaquina(locacao.maquinaId);
      }

      // Mostrar mensagem de sucesso
      alert("Reserva iniciada com sucesso! A locação agora está ativa.");
    } catch (error) {
      console.error("Erro ao iniciar reserva:", error);
      alert("Erro ao iniciar reserva. Tente novamente.");
    }
  };

  const handleDeletarLocacao = (locacao) => {
    console.log("handleDeletarLocacao recebeu:", locacao);
    if (locacao && locacao.id) {
      setLocacaoParaDeletar(locacao.id);
      setShowConfirmacaoDelete(true);
    } else {
      console.error("handleDeletarLocacao: locacao inválida!", locacao);
    }
  };

  // Função para restaurar máquinas órfãs
  const restaurarMaquinasOrfas = async () => {
    const maquinasOrfas = [];
    locacoes.forEach((locacao) => {
      if (Array.isArray(locacao.maquinas)) {
        locacao.maquinas.forEach((m) => {
          const existe = maquinas.some((maq) => maq.id === m.maquinaId);
          if (!existe) {
            maquinasOrfas.push({
              id: m.maquinaId,
              nome: m.maquinaNome || "Máquina restaurada",
              valorDiaria: m.valorDiaria || 0,
              quantidade: m.quantidade || 1,
              quantidadeLocada: 0,
              disponivel: true,
              createdAt: new Date(),
            });
          }
        });
      }
    });
    if (maquinasOrfas.length === 0) {
      alert("Nenhuma máquina órfã encontrada!");
      return;
    }
    // Remover duplicatas pelo id
    const unicas = maquinasOrfas.filter(
      (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
    );
    for (const m of unicas) {
      try {
        await editarMaquina(m.id, m); // Tenta atualizar, se não existir, cria
      } catch {
        // Se não existir, cria
        await fetch("/api/criarMaquina", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(m),
        });
      }
    }
    alert("Máquinas órfãs restauradas!");
    window.location.reload();
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
      {usuario?.admin && (
        <button
          onClick={restaurarMaquinasOrfas}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold mb-4"
        >
          Restaurar máquinas órfãs
        </button>
      )}
      {/* Seção de Locações Ativas */}
      {(filtroStatus === "todas" || filtroStatus === "ativas") && (
        <>
          {filtroStatus === "todas" && (
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <i className="bx bx-check-circle text-2xl text-green-600"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Locações Ativas
                </h2>
                <p className="text-sm text-gray-600">Locações em andamento</p>
              </div>
            </div>
          )}
          <ListaLocacoes
            locacoes={locacoesFiltradas}
            clientes={clientes}
            maquinas={maquinas}
            onConcluir={(locacao) => {
              setLocacaoSelecionada(locacao);
              setShowConfirmacao(true);
            }}
            onRenovar={onRenovar}
            onEditar={handleEditarLocacao}
            onDeletar={handleDeletarLocacao}
            onIniciarReserva={handleIniciarReserva}
            scrollToLocacao={scrollToLocacao}
            scrollToRef={scrollToRef}
          />
        </>
      )}

      {/* Seção de Reservas */}
      {(filtroStatus === "todas" || filtroStatus === "reservadas") &&
        reservasFiltradas.length > 0 && (
          <div className={filtroStatus === "todas" ? "mt-8" : ""}>
            {filtroStatus === "todas" && (
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <i className="bx bx-calendar-check text-2xl text-blue-600"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Reservas Futuras
                  </h2>
                  <p className="text-sm text-gray-600">
                    Máquinas reservadas para datas futuras
                  </p>
                </div>
              </div>
            )}
            <ListaLocacoes
              locacoes={reservasFiltradas}
              clientes={clientes}
              maquinas={maquinas}
              onConcluir={(locacao) => {
                setLocacaoSelecionada(locacao);
                setShowConfirmacao(true);
              }}
              onRenovar={onRenovar}
              onEditar={handleEditarLocacao}
              onDeletar={handleDeletarLocacao}
              onIniciarReserva={handleIniciarReserva}
              scrollToLocacao={scrollToLocacao}
              scrollToRef={scrollToRef}
              isReservas={true}
            />
          </div>
        )}

      <ConfirmacaoModal
        isOpen={showConfirmacao}
        onClose={() => {
          setShowConfirmacao(false);
          setLocacaoSelecionada(null);
        }}
        onConfirm={handleConcluirLocacao}
        titulo="Concluir Locação"
        mensagem="Tem certeza que deseja concluir esta locação? Esta ação não pode ser desfeita."
      />

      <ConfirmacaoModal
        isOpen={showConfirmacaoDelete}
        onClose={() => {
          setShowConfirmacaoDelete(false);
          setLocacaoParaDeletar(null);
        }}
        onConfirm={async () => {
          const id = locacaoParaDeletar;
          console.log("Tentando deletar locação, id:", id);
          if (id) {
            await onDeletar(id);
            setShowConfirmacaoDelete(false);
            setLocacaoParaDeletar(null);
            window.location.reload();
          }
        }}
        titulo="Excluir Locação"
        mensagem="Para excluir esta locação, por favor insira sua senha de administrador."
      />

      {locacaoSelecionada && (
        <LocarMaquinaModal
          isOpen={showEditarModal}
          onClose={() => {
            setShowEditarModal(false);
            setLocacaoSelecionada(null);
          }}
          maquina={undefined}
          maquinasEdicao={locacaoSelecionada.maquinas}
          locacaoAtual={locacaoSelecionada}
          modoEdicao={true}
        />
      )}
    </div>
  );
}
