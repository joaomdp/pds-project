import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LoginButton = ({ collapsed }) => {
  const navigate = useNavigate();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={() => navigate("/login")}
      className={`flex items-center justify-center ${
        collapsed ? "p-2" : "py-2 px-4"
      } bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-all duration-300 hover:shadow-lg cursor-pointer btn`}
    >
      <i className="bx bx-user text-xl" />
      {!collapsed && <span className="ml-2 text-responsive">Login</span>}
    </motion.button>
  );
};

export default LoginButton;
