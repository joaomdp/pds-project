import LoginButton from "./LoginButton";
import { motion } from "framer-motion";

export default function WelcomeSection() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="text-white xl:w-1/2 text-center xl:text-left"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-5xl font-extrabold mb-6 drop-shadow-lg"
      >
        Painel de Administração
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-base text-gray-200 mb-4 leading-relaxed"
      >
        Bem-vindo ao ambiente exclusivo de controle de clientes e máquinas. Aqui
        você pode gerenciar, editar e visualizar todos os dados de forma segura.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-base text-gray-300 mb-8 leading-relaxed"
      >
        Acesso restrito. Apenas administradores autorizados podem utilizar este
        sistema. Faça login para continuar.
      </motion.p>

      <div className="mt-6 flex justify-center xl:justify-start">
        <LoginButton />
      </div>
    </motion.div>
  );
}
