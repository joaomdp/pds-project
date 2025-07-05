import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const gerarProximoId = async () => {
  try {
    const clientesRef = collection(db, "clientes");
    const q = query(clientesRef, orderBy("id", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return "C001";
    }

    const ultimoCliente = querySnapshot.docs[0].data();
    const ultimoId = ultimoCliente.id;

    if (!ultimoId.match(/^C\d{3}$/)) {
      const todosClientes = await getDocs(clientesRef);
      let maiorNumero = 0;

      todosClientes.forEach((doc) => {
        const id = doc.data().id;
        const match = id.match(/^C(\d{3})$/);
        if (match) {
          const numero = parseInt(match[1]);
          if (numero > maiorNumero) {
            maiorNumero = numero;
          }
        }
      });

      const novoNumero = maiorNumero + 1;
      return `C${novoNumero.toString().padStart(3, "0")}`;
    }

    const numero = parseInt(ultimoId.substring(1)) + 1;
    return `C${numero.toString().padStart(3, "0")}`;
  } catch (error) {
    console.error("Erro ao gerar ID:", error);
    throw error;
  }
};

const formatarDadosCliente = (clienteData) => {
  const dadosFormatados = {
    ...clienteData,
    nome: String(clienteData.nome || "").trim(),
    email: String(clienteData.email || "")
      .trim()
      .toLowerCase(),
    cpf: String(clienteData.cpf || "").replace(/\D/g, ""),
    telefone: String(clienteData.telefone || "").replace(/\D/g, ""),
  };

  if (!dadosFormatados.nome) throw new Error("Nome é obrigatório");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (dadosFormatados.email && !emailRegex.test(dadosFormatados.email)) {
    throw new Error("E-mail inválido");
  }

  if (!dadosFormatados.cpf) throw new Error("CPF é obrigatório");
  if (!dadosFormatados.telefone) throw new Error("Telefone é obrigatório");

  if (dadosFormatados.cpf.length !== 11) {
    throw new Error("CPF deve ter 11 dígitos");
  }
  if (dadosFormatados.telefone.length !== 11) {
    throw new Error("Telefone deve ter 11 dígitos");
  }

  return dadosFormatados;
};

export const adicionarCliente = async (clienteData) => {
  try {
    const novoId = await gerarProximoId();
    const dadosFormatados = formatarDadosCliente(clienteData);
    const clienteComId = {
      ...dadosFormatados,
      id: novoId,
      dataCadastro: new Date(),
    };

    const clienteRef = doc(db, "clientes", novoId);
    await setDoc(clienteRef, clienteComId);
    return clienteComId;
  } catch (error) {
    console.error("Erro ao adicionar cliente:", error);
    throw error;
  }
};

export const getClientes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "clientes"));
    const clientes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      };
    });
    return clientes;
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    throw error;
  }
};

export const atualizarCliente = async (id, clienteData) => {
  try {
    const dadosFormatados = formatarDadosCliente(clienteData);
    const dadosAtualizados = {
      ...dadosFormatados,
      id: id,
    };

    const clienteRef = doc(db, "clientes", id);
    await updateDoc(clienteRef, dadosAtualizados);
    return dadosAtualizados;
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    throw error;
  }
};

export const excluirCliente = async (id) => {
  try {
    const clienteRef = doc(db, "clientes", id);
    await deleteDoc(clienteRef);
    return id;
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    throw error;
  }
};
