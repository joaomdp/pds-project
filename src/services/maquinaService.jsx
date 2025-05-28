import { collection, getDocs, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const maquinaService = {
  async getAll() {
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
  },

  async saveAll(maquinas) {
    try {
      const batch = db.batch();
      maquinas.forEach((maquina) => {
        const docRef = doc(db, "maquinas", maquina.id);
        batch.update(docRef, maquina);
      });
      await batch.commit();
    } catch (error) {
      console.error("Erro ao salvar máquinas:", error);
      throw error;
    }
  },
};
