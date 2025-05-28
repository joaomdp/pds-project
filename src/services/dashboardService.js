import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export const getEstatisticas = async () => {
  try {
    const [clientesSnapshot, maquinasSnapshot, locacoesSnapshot] =
      await Promise.all([
        getDocs(collection(db, "clientes")),
        getDocs(collection(db, "maquinas")),
        getDocs(collection(db, "locacoes")),
      ]);

    const totalClientes = clientesSnapshot.size;
    const totalMaquinas = maquinasSnapshot.size;
    const totalLocacoes = locacoesSnapshot.size;

    let receitaTotal = 0;
    locacoesSnapshot.forEach((doc) => {
      const locacao = doc.data();
      if (locacao.valorTotal) {
        receitaTotal += locacao.valorTotal;
      } else if (locacao.dataInicio && locacao.dataFim && locacao.valorDiaria) {
        const inicio = locacao.dataInicio.toDate();
        const fim = locacao.dataFim.toDate();
        const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
        const valorFrete = Number(locacao.frete) || 0;
        receitaTotal += dias * locacao.valorDiaria + valorFrete;
      }
    });

    return {
      totalClientes,
      totalMaquinas,
      totalLocacoes,
      receitaTotal,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    throw error;
  }
};

export const getMaquinasMaisLocadas = async (limite = 5) => {
  try {
    const locacoesSnapshot = await getDocs(collection(db, "locacoes"));
    const maquinasCount = {};

    locacoesSnapshot.forEach((doc) => {
      const locacao = doc.data();
      const maquinaId = locacao.maquinaId;
      if (maquinaId) {
        maquinasCount[maquinaId] = (maquinasCount[maquinaId] || 0) + 1;
      }
    });

    const maquinasPromises = Object.entries(maquinasCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limite)
      .map(async ([maquinaId, count]) => {
        const maquinaDoc = await getDocs(
          query(collection(db, "maquinas"), where("id", "==", maquinaId))
        );
        const maquina = maquinaDoc.docs[0]?.data();
        return {
          id: maquinaId,
          nome: maquina?.nome || "Máquina não encontrada",
          locacoes: count,
        };
      });

    return await Promise.all(maquinasPromises);
  } catch (error) {
    console.error("Erro ao buscar máquinas mais locadas:", error);
    throw error;
  }
};

export const getReceitaPorPeriodo = async (periodo = "mes") => {
  try {
    const agora = new Date();
    let dataInicio;

    switch (periodo) {
      case "semana":
        dataInicio = new Date(agora.setDate(agora.getDate() - 7));
        break;
      case "mes":
        dataInicio = new Date(agora.setMonth(agora.getMonth() - 1));
        break;
      case "ano":
        dataInicio = new Date(agora.setFullYear(agora.getFullYear() - 1));
        break;
      default:
        dataInicio = new Date(agora.setMonth(agora.getMonth() - 1));
    }

    const locacoesSnapshot = await getDocs(
      query(
        collection(db, "locacoes"),
        where("dataInicio", ">=", Timestamp.fromDate(dataInicio)),
        orderBy("dataInicio", "asc")
      )
    );

    const receitaPorDia = {};
    locacoesSnapshot.forEach((doc) => {
      const locacao = doc.data();
      const data = locacao.dataInicio.toDate().toISOString().split("T")[0];

      // Calcular valor da locação
      let valorLocacao = 0;
      if (locacao.valorTotal) {
        valorLocacao = locacao.valorTotal;
      } else if (locacao.dataInicio && locacao.dataFim && locacao.valorDiaria) {
        const inicio = locacao.dataInicio.toDate();
        const fim = locacao.dataFim.toDate();
        const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
        const valorFrete = Number(locacao.frete) || 0;
        valorLocacao = dias * locacao.valorDiaria + valorFrete;
      }

      receitaPorDia[data] = (receitaPorDia[data] || 0) + valorLocacao;
    });

    return Object.entries(receitaPorDia).map(([data, valor]) => ({
      data,
      valor,
    }));
  } catch (error) {
    console.error("Erro ao buscar receita por período:", error);
    throw error;
  }
};

export const getAtividadesRecentes = async (limite = 5) => {
  try {
    const locacoesSnapshot = await getDocs(
      query(
        collection(db, "locacoes"),
        orderBy("dataInicio", "desc"),
        limit(limite)
      )
    );

    const atividades = await Promise.all(
      locacoesSnapshot.docs.map(async (doc) => {
        const locacao = doc.data();
        const [maquinaDoc, clienteDoc] = await Promise.all([
          getDocs(
            query(
              collection(db, "maquinas"),
              where("id", "==", locacao.maquinaId)
            )
          ),
          getDocs(
            query(
              collection(db, "clientes"),
              where("id", "==", locacao.clienteId)
            )
          ),
        ]);

        return {
          id: doc.id,
          tipo: "locacao",
          data: locacao.dataInicio.toDate(),
          maquina: maquinaDoc.docs[0]?.data()?.nome || "Máquina não encontrada",
          cliente: clienteDoc.docs[0]?.data()?.nome || "Cliente não encontrado",
          valor: locacao.valorTotal || 0,
        };
      })
    );

    return atividades;
  } catch (error) {
    console.error("Erro ao buscar atividades recentes:", error);
    throw error;
  }
};
