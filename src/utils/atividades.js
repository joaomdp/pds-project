import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const registrarAtividade = async (tipo, dados) => {
  try {
    await addDoc(collection(db, "atividades"), {
      tipo,
      ...dados,
      data: serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao registrar atividade:", error);
  }
};
