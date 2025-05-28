import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export const inicializarFirebase = async () => {
  try {
    await getDocs(collection(db, "categorias"));
    await getDocs(collection(db, "maquinas"));
    await getDocs(collection(db, "clientes"));
    await getDocs(collection(db, "locacoes"));

    return true;
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
    throw error;
  }
};
