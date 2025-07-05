import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLocacoes } from "../../hooks/useLocacoes";
import { useMaquinas } from "../../hooks/useMaquinas";

const NotificationIcon = ({ collapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { locacoes } = useLocacoes();
  const { maquinas } = useMaquinas();
  const [notificacoes, setNotificacoes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Filtrar apenas locações ativas
    const locacoesAtivas = locacoes.filter(
      (locacao) => locacao.status === "ativa"
    );

    const locacoesDoDia = locacoesAtivas.filter((locacao) => {
      if (!locacao.dataFim) return false;

      try {
        const dataFim = locacao.dataFim.toDate
          ? locacao.dataFim.toDate()
          : new Date(locacao.dataFim);

        if (isNaN(dataFim.getTime())) return false;

        dataFim.setHours(0, 0, 0, 0);
        return dataFim.getTime() === hoje.getTime();
      } catch (error) {
        console.error("Erro ao processar data:", error);
        return false;
      }
    });

    setNotificacoes(
      locacoesDoDia.map((locacao) => {
        // Buscar nome correto da(s) máquina(s)
        let nomeMaquina = "N/A";
        if (Array.isArray(locacao.maquinas) && locacao.maquinas.length > 0) {
          nomeMaquina = locacao.maquinas
            .map((m) => {
              const maq = maquinas.find((mq) => mq.id === m.maquinaId);
              return maq ? maq.nome : m.maquinaNome || "N/A";
            })
            .join(", ");
        } else if (locacao.maquinaId) {
          const maq = maquinas.find((mq) => mq.id === locacao.maquinaId);
          nomeMaquina = maq ? maq.nome : locacao.maquinaNome || "N/A";
        } else if (locacao.maquinaNome) {
          nomeMaquina = locacao.maquinaNome;
        }
        return {
          id: locacao.id,
          mensagem: `Hoje é o dia da devolução da máquina ${nomeMaquina}`,
          data: locacao.dataFim,
          cliente: locacao.clienteNome || "N/A",
        };
      })
    );
  }, [locacoes, maquinas]);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificacaoClick = (locacaoId) => {
    setIsOpen(false);
    navigate("/locacoes", { state: { scrollToLocacao: locacaoId } });
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="text-white hover:text-green-400 cursor-pointer focus:outline-none p-2 rounded-lg hover:bg-gray-700 transition-colors"
        onClick={handleClick}
      >
        <i className="bx bx-bell text-2xl" />
        {notificacoes.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
          >
            {notificacoes.length}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed bottom-4 ${
              collapsed ? "left-20" : "left-64"
            } w-80 bg-white rounded-lg shadow-xl z-[9999] border border-gray-200`}
            style={{
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">
                Devoluções Hoje ({notificacoes.length})
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma devolução para hoje
                </div>
              ) : (
                notificacoes.map((notificacao) => (
                  <motion.div
                    key={notificacao.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleNotificacaoClick(notificacao.id)}
                  >
                    <p className="text-sm text-gray-800">
                      {notificacao.mensagem}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Cliente: {notificacao.cliente}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationIcon;
