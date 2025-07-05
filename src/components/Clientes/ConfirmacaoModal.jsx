import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default function ConfirmacaoModal({
  isOpen,
  onClose,
  onConfirm,
  titulo = "Confirmação Necessária",
  mensagem = "Por favor insira sua senha atual para confirmar.",
}) {
  const { usuario } = useAuth();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const credential = EmailAuthProvider.credential(usuario.email, senha);

      await reauthenticateWithCredential(usuario, credential);

      onConfirm();
      setSenha("");
      onClose();
    } catch (error) {
      console.error("Erro na autenticação:", error);
      switch (error.code) {
        case "auth/wrong-password":
          setErro("Senha incorreta");
          break;
        case "auth/too-many-requests":
          setErro("Muitas tentativas. Tente novamente mais tarde");
          break;
        default:
          setErro("Erro ao autenticar. Tente novamente");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{titulo}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <p className="text-gray-600 mb-6">{mensagem}</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <i className="bx bxs-lock-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-green-500 transition-colors"></i>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha atual"
                  className="pl-12 pr-12 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm text-sm transition-all duration-200"
                  required
                  disabled={carregando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i
                    className={`bx ${
                      mostrarSenha ? "bx-show" : "bx-hide"
                    } text-lg`}
                  ></i>
                </button>
              </div>

              {erro && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm"
                >
                  {erro}
                </motion.p>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 font-medium transition-colors"
                  disabled={carregando}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={carregando}
                >
                  {carregando ? (
                    <>
                      <i className="bx bx-loader-alt animate-spin"></i>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-check"></i>
                      Confirmar
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
