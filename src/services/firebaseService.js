import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export const createCliente = async (clienteData) => {
  try {
    const docRef = await addDoc(collection(db, "clientes"), clienteData);
    return { id: docRef.id, ...clienteData };
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    throw error;
  }
};

export const getClientes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "clientes"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    throw error;
  }
};

export const updateCliente = async (id, clienteData) => {
  try {
    const clienteRef = doc(db, "clientes", id);
    await updateDoc(clienteRef, clienteData);
    return { id, ...clienteData };
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    throw error;
  }
};

export const deleteCliente = async (id) => {
  try {
    await deleteDoc(doc(db, "clientes", id));
    return id;
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    throw error;
  }
};

export const createMaquina = async (maquinaData) => {
  try {
    const docRef = await addDoc(collection(db, "maquinas"), maquinaData);
    return { id: docRef.id, ...maquinaData };
  } catch (error) {
    console.error("Erro ao criar máquina:", error);
    throw error;
  }
};

export const getMaquinas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "maquinas"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erro ao buscar máquinas:", error);
    throw error;
  }
};

export const updateMaquina = async (id, maquinaData) => {
  try {
    const maquinaRef = doc(db, "maquinas", id);
    await updateDoc(maquinaRef, maquinaData);
    return { id, ...maquinaData };
  } catch (error) {
    console.error("Erro ao atualizar máquina:", error);
    throw error;
  }
};

export const deleteMaquina = async (id) => {
  try {
    await deleteDoc(doc(db, "maquinas", id));
    return id;
  } catch (error) {
    console.error("Erro ao deletar máquina:", error);
    throw error;
  }
};
