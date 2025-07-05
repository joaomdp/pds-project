import { motion } from "framer-motion";
import MaquinaCard from "./MaquinaCard";

export default function ListaMaquinas({ maquinas, onEditar, onExcluir }) {
  if (maquinas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center text-gray-500 mt-10"
      >
        Nenhuma máquina encontrada.
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {maquinas
        .filter(
          (maquina) =>
            typeof maquina.id === "string" && maquina.id.trim() !== ""
        )
        .map((maquina, index) => (
          <motion.div
            key={maquina.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: "easeOut",
            }}
          >
            <MaquinaCard
              maquina={maquina}
              onEdit={() => onEditar(maquina)}
              onDelete={() => onExcluir(maquina.id)}
            />
          </motion.div>
        ))}
    </div>
  );
}
