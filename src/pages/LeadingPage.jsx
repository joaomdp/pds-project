import Header from "../components/layout/Sidebar";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function LeadingPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const sidebar = document.querySelector("aside");
    if (sidebar) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          setIsSidebarOpen(width > 80);
        }
      });
      observer.observe(sidebar);
      return () => observer.disconnect();
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent" />
      </motion.div>

      <Header />

      <div className="relative z-10 min-h-[calc(100vh-64px)] flex items-center pt-16 lg:pt-0">
        <div
          className={`w-full max-w-4xl px-6 md:px-8 lg:px-12 transition-all duration-200 ease-in-out ${
            isSidebarOpen ? "lg:ml-[calc(10%+16rem)]" : "lg:ml-[10%]"
          } mx-auto`}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-white py-12 md:py-16 lg:py-20"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-10 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent"
            >
              Gerencie suas Máquinas com Eficiência
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg lg:text-xl text-slate-300 mb-10 md:mb-12 max-w-2xl leading-relaxed"
            >
              Transforme sua gestão de máquinas com nossa plataforma
              inteligente.
              <span className="block mt-4">
                Controle locações, mantenha o histórico completo e otimize seus
                recursos com ferramentas avançadas de gerenciamento.
              </span>
            </motion.p>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-4 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transition-all duration-300 cursor-pointer text-base"
            >
              Entrar no Sistema
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
