import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listener em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categorias"),
      (snapshot) => {
        const categoriasData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategorias(categoriasData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const carregarCategorias = async () => {
    // Mantém para compatibilidade, mas não faz nada pois o listener já atualiza
    return;
  };

  const adicionarCategoria = async (novaCategoria) => {
    try {
      if (!categorias.some((cat) => cat.nome === novaCategoria)) {
        const docRef = await addDoc(collection(db, "categorias"), {
          nome: novaCategoria,
          createdAt: new Date(),
        });
        // Não precisa atualizar manualmente, o listener faz isso
        return { id: docRef.id, nome: novaCategoria };
      }
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      throw error;
    }
  };

  const removerCategoria = async (id) => {
    try {
      const categoriaRef = doc(db, "categorias", id);
      await deleteDoc(categoriaRef);
      // Não precisa atualizar manualmente, o listener faz isso
    } catch (error) {
      console.error("Erro ao remover categoria:", error);
      throw error;
    }
  };

  return {
    categorias,
    loading,
    error,
    adicionarCategoria,
    removerCategoria,
    carregarCategorias,
  };
}
