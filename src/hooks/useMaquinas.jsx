import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export function useMaquinas() {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarMaquinas = async () => {
      try {
        console.log("Iniciando carregamento das máquinas...");
        setLoading(true);
        const maquinasRef = collection(db, "maquinas");
        console.log("Referência da coleção criada:", maquinasRef);

        const querySnapshot = await getDocs(maquinasRef);
        console.log(
          "Dados recebidos do Firestore:",
          querySnapshot.docs.length,
          "documentos"
        );

        // Buscar locações ativas
        const locacoesRef = collection(db, "locacoes");
        const locacoesSnapshot = await getDocs(
          query(locacoesRef, where("status", "==", "ativa"))
        );

        // Contar quantas máquinas de cada tipo estão locadas
        const maquinasLocadas = {};
        locacoesSnapshot.forEach((doc) => {
          const locacao = doc.data();
          const maquinaId = locacao.maquinaId;
          maquinasLocadas[maquinaId] =
            (maquinasLocadas[maquinaId] || 0) + (locacao.quantidade || 1);
        });

        const maquinasData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const quantidadeLocada = maquinasLocadas[doc.id] || 0;
          const quantidadeTotal = data.quantidade || 1;
          const disponivel = quantidadeLocada < quantidadeTotal;

          console.log("Dados da máquina:", {
            id: doc.id,
            ...data,
            quantidadeLocada,
            quantidadeTotal,
            disponivel,
          });

          return {
            id: doc.id,
            ...data,
            quantidadeLocada,
            disponivel,
          };
        });

        console.log("Máquinas processadas:", maquinasData);
        setMaquinas(maquinasData);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar máquinas:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    carregarMaquinas();
  }, []);

  const adicionarMaquina = async (dados) => {
    try {
      const docRef = await addDoc(collection(db, "maquinas"), {
        ...dados,
        disponivel: true,
        quantidadeLocada: 0,
        createdAt: new Date(),
      });
      const novaMaquina = {
        id: docRef.id,
        ...dados,
        disponivel: true,
        quantidadeLocada: 0,
      };
      setMaquinas((prevMaquinas) => [...prevMaquinas, novaMaquina]);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar máquina:", error);
      throw error;
    }
  };

  const editarMaquina = async (id, dados) => {
    try {
      const maquinaRef = doc(db, "maquinas", id);
      await updateDoc(maquinaRef, {
        ...dados,
        updatedAt: new Date(),
      });
      setMaquinas((prevMaquinas) =>
        prevMaquinas.map((maquina) =>
          maquina.id === id
            ? { ...maquina, ...dados, updatedAt: new Date() }
            : maquina
        )
      );
    } catch (error) {
      console.error("Erro ao editar máquina:", error);
      throw error;
    }
  };

  const excluirMaquina = async (id) => {
    try {
      const maquinaRef = doc(db, "maquinas", id);
      await deleteDoc(maquinaRef);
      setMaquinas((prevMaquinas) =>
        prevMaquinas.filter((maquina) => maquina.id !== id)
      );
    } catch (error) {
      console.error("Erro ao excluir máquina:", error);
      throw error;
    }
  };

  const buscarMaquinaPorId = async (id) => {
    try {
      const maquinaRef = doc(db, "maquinas", id);
      const maquinaDoc = await getDoc(maquinaRef);
      if (maquinaDoc.exists()) {
        return { id: maquinaDoc.id, ...maquinaDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar máquina:", error);
      throw error;
    }
  };

  return {
    maquinas,
    loading,
    error,
    adicionarMaquina,
    editarMaquina,
    excluirMaquina,
    buscarMaquinaPorId,
  };
}
