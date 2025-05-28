import { motion } from "framer-motion";

const NavLink = ({ href, text, iconClass, isLocked, isActive, collapsed }) => (
  <li>
    {isLocked ? (
      <span className="flex items-center px-2 py-2 text-gray-400 cursor-not-allowed relative group">
        <i className={`bx ${iconClass} text-xl`} />
        {!collapsed && <span className="ml-4 text-responsive">{text}</span>}
        <i className="bx bx-lock absolute right-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </span>
    ) : (
      <a
        href={href}
        className={`flex items-center px-2 py-2 rounded-md relative transition-all duration-300 group hover-scale
          ${
            isActive
              ? "text-green-500 font-semibold"
              : "text-gray-300 hover:text-green-400"
          }
        `}
      >
        {isActive && (
          <motion.span
            layoutId="active-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-green-500 rounded-r"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        )}

        <i className={`bx ${iconClass} text-xl`} />
        {!collapsed && <span className="ml-4 text-responsive">{text}</span>}
      </a>
    )}
  </li>
);

export default NavLink;
