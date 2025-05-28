import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function RecentActivities() {
  const [atividades, setAtividades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);

    const atividadesQuery = query(
      collection(db, "atividades"),
      orderBy("data", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(
      atividadesQuery,
      (snapshot) => {
        const atividadesData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .slice(0, 5);

        setAtividades(atividadesData);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error("Erro ao carregar atividades:", err);
        setError("Erro ao carregar atividades");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getAtividadeIcon = (tipo) => {
    switch (tipo) {
      case "locacao":
        return "bx bx-cart-add";
      case "devolucao":
        return "bx bx-undo";
      case "cliente_criado":
        return "bx bx-user-plus";
      case "cliente_editado":
        return "bx bx-user";
      case "cliente_excluido":
        return "bx bx-user-x";
      case "maquina_criada":
        return "bx bx-plus-circle";
      case "maquina_editada":
        return "bx bx-edit";
      case "maquina_excluida":
        return "bx bx-trash";
      default:
        return "bx bx-info-circle";
    }
  };

  const getAtividadeCor = (tipo) => {
    switch (tipo) {
      case "locacao":
        return "bg-green-500";
      case "devolucao":
        return "bg-blue-500";
      case "cliente_criado":
      case "maquina_criada":
        return "bg-green-500";
      case "cliente_editado":
      case "maquina_editada":
        return "bg-yellow-500";
      case "cliente_excluido":
      case "maquina_excluida":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAtividadeTexto = (atividade) => {
    switch (atividade.tipo) {
      case "locacao":
        return `${atividade.clienteNome} locou ${atividade.maquinaNome}`;
      case "devolucao":
        return `${atividade.clienteNome} devolveu ${atividade.maquinaNome}`;
      case "cliente_criado":
        return `Novo cliente cadastrado: ${atividade.clienteNome}`;
      case "cliente_editado":
        return `Cliente atualizado: ${atividade.clienteNome}`;
      case "cliente_excluido":
        return `Cliente removido: ${atividade.clienteNome}`;
      case "maquina_criada":
        return `Nova máquina cadastrada: ${atividade.maquinaNome}`;
      case "maquina_editada":
        return `Máquina atualizada: ${atividade.maquinaNome}`;
      case "maquina_excluida":
        return `Máquina removida: ${atividade.maquinaNome}`;
      default:
        return atividade.descricao || "Atividade realizada";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <i className="bx bx-history text-xl text-green-600" />
            Atividades Recentes
          </h2>
        </div>
        <div className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <i className="bx bx-history text-xl text-green-600" />
            Atividades Recentes
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-red-500 flex items-center gap-2">
            <i className="bx bx-error-circle" />
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!atividades || atividades.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <i className="bx bx-history text-xl text-green-600" />
            Atividades Recentes
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <i className="bx bx-info-circle" />
            Nenhuma atividade recente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <i className="bx bx-history text-xl text-green-600" />
          Atividades Recentes
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-5">
          {atividades.map((atividade) => (
            <div
              key={atividade.id}
              className="flex items-start gap-4 group hover:bg-slate-50 p-3 rounded-lg transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${getAtividadeCor(
                  atividade.tipo
                )} bg-opacity-10`}
              >
                <i
                  className={`bx ${getAtividadeIcon(
                    atividade.tipo
                  )} text-lg ${getAtividadeCor(atividade.tipo)}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                  {getAtividadeTexto(atividade)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {format(atividade.data.toDate(), "dd 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
