import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import bgImage from "../assets/imagem-login1.jpg";

import LoginForm from "../components/auth/LoginForm";
import ForgotPassword from "../components/auth/ForgotPassword";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarAvisoSenha, setMostrarAvisoSenha] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      window.location.href = "/admin";
    } catch (err) {
      console.error("Erro ao logar:", err);
      setErro("E-mail ou senha inválidos.");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden p-6 md:p-8 lg:p-12">
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div
        className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-10000 ease-in-out hover:scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 bg-white/10 backdrop-blur-lg p-6 md:p-8 lg:p-12 rounded-xl shadow-2xl w-full max-w-md mx-auto border border-white/20"
      >
        {mostrarAvisoSenha ? (
          <ForgotPassword onVoltar={() => setMostrarAvisoSenha(false)} />
        ) : (
          <LoginForm
            email={email}
            setEmail={setEmail}
            senha={senha}
            setSenha={setSenha}
            mostrarSenha={mostrarSenha}
            setMostrarSenha={setMostrarSenha}
            erro={erro}
            handleLogin={handleLogin}
            setMostrarAvisoSenha={setMostrarAvisoSenha}
          />
        )}
      </motion.div>
    </div>
  );
}
