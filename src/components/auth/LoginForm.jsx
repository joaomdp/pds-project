import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function LoginForm({ setMostrarAvisoSenha }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      window.location.href = "/home";
    } catch (err) {
      console.error("Erro ao logar:", err);
      setErro("E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-3">
          Painel Administrativo
        </h2>
        <p className="text-white text-base">
          Acesso restrito para administradores
        </p>
      </div>

      {erro && (
        <div className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl text-base font-medium shadow-lg">
          <div className="flex items-center gap-2">
            <i className="bx bx-error-circle text-xl"></i>
            {erro}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative group">
          <i className="bx bxs-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xl group-focus-within:text-green-600 transition-colors"></i>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail"
            className="pl-12 pr-4 py-3.5 w-full rounded-xl border-2 border-gray-300 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-md text-gray-800 placeholder-gray-500 text-base transition-all duration-200"
            required
            disabled={carregando}
          />
        </div>

        <div className="relative group">
          <i className="bx bxs-lock-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xl group-focus-within:text-green-600 transition-colors"></i>
          <input
            type={mostrarSenha ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            className="pl-12 pr-12 py-3.5 w-full rounded-xl border-2 border-gray-300 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-md text-gray-800 placeholder-gray-500 text-base transition-all duration-200"
            required
            disabled={carregando}
          />
          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <i
              className={`bx ${mostrarSenha ? "bx-show" : "bx-hide"} text-xl`}
            ></i>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMostrarAvisoSenha(true)}
          className="text-base text-white hover:text-green-300 transition-colors font-medium"
        >
          Esqueceu a senha?
        </button>
      </div>

      <button
        type="submit"
        disabled={carregando}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-base"
      >
        {carregando ? (
          <>
            <i className="bx bx-loader-alt animate-spin text-xl"></i>
            Entrando...
          </>
        ) : (
          <>
            <i className="bx bx-log-in text-xl"></i>
            Entrar
          </>
        )}
      </button>

      <div className="text-center">
        <a
          href="/"
          className="inline-flex items-center text-white hover:text-green-300 transition-colors text-base font-medium"
        >
          <i className="bx bx-arrow-back mr-2 text-xl"></i>
          Voltar ao site
        </a>
      </div>
    </form>
  );
}
