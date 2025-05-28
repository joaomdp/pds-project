import { motion } from "framer-motion";

const LogoutButton = ({ onLogout, collapsed }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
    onClick={onLogout}
    className={`flex items-center justify-center ${
      collapsed ? "p-2" : "py-2 px-4"
    } bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-all duration-300 hover:shadow-lg`}
  >
    <i className="bx bx-log-out text-xl" />
    {!collapsed && <span className="ml-2">Sair</span>}
  </motion.button>
);

export default LogoutButton;
