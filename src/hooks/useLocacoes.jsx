import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export function useLocacoes() {
  const [locacoes, setLocacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "locacoes"),
      (snapshot) => {
        setLocacoes(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
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
    if (!id) {
      console.error("ID da locação não fornecido para remoção!");
      return;
    }
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
