import React from "react";
import { motion } from "framer-motion";

const ActionButton = ({ onClick, children, variant = "primary" }) => {
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600",
    success: "bg-green-500 hover:bg-green-600",
    danger: "bg-red-500 hover:bg-red-600",
    secondary: "bg-gray-400 hover:bg-gray-500",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${variants[variant]} text-white px-3 py-1 rounded-md text-sm transition-colors btn text-responsive`}
    >
      {children}
    </motion.button>
  );
};

export default ActionButton;
