import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarCategorias = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categorias"));
      const categoriasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategorias(categoriasData);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const adicionarCategoria = async (novaCategoria) => {
    try {
      if (!categorias.some((cat) => cat.nome === novaCategoria)) {
        const docRef = await addDoc(collection(db, "categorias"), {
          nome: novaCategoria,
          createdAt: new Date(),
        });
        const categoria = { id: docRef.id, nome: novaCategoria };
        setCategorias((prev) => [...prev, categoria]);
        return categoria;
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
      setCategorias((prev) => prev.filter((cat) => cat.id !== id));
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
