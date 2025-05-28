import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export function useLocacoes() {
  const [locacoes, setLocacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarLocacoes = async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "locacoes"), orderBy("dataInicio", "desc"))
        );
        const locacoesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLocacoes(locacoesData);
      } catch (err) {
        console.error("Erro ao carregar locações:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    carregarLocacoes();
  }, []);

  const adicionarLocacao = async (locacaoData) => {
    try {
      const docRef = await addDoc(collection(db, "locacoes"), {
        ...locacaoData,
        createdAt: new Date(),
      });
      const novaLocacao = { id: docRef.id, ...locacaoData };
      setLocacoes((prev) => [novaLocacao, ...prev]);
      return novaLocacao;
    } catch (err) {
      console.error("Erro ao adicionar locação:", err);
      throw err;
    }
  };

  const editarLocacao = async (id, locacaoData) => {
    try {
      const locacaoRef = doc(db, "locacoes", id);
      await updateDoc(locacaoRef, locacaoData);
      setLocacoes((prev) =>
        prev.map((locacao) =>
          locacao.id === id ? { ...locacao, ...locacaoData } : locacao
        )
      );
    } catch (err) {
      console.error("Erro ao editar locação:", err);
      throw err;
    }
  };

  const removerLocacao = async (id) => {
    try {
      const locacaoRef = doc(db, "locacoes", id);
      await deleteDoc(locacaoRef);
      setLocacoes((prev) => prev.filter((locacao) => locacao.id !== id));
    } catch (err) {
      console.error("Erro ao remover locação:", err);
      throw err;
    }
  };

  return {
    locacoes,
    loading,
    error,
    adicionarLocacao,
    editarLocacao,
    removerLocacao,
  };
}
