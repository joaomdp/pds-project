const NavLink = ({ href, text, isLocked }) => (
  <li>
    {isLocked ? (
      <span className="flex items-center px-4 py-2 text-gray-400 cursor-not-allowed relative group">
        <span className="flex-1">{text}</span>
        <i className="bx bx-lock text-gray-500 text-lg ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </span>
    ) : (
      <a
        href={href}
        className="flex items-center px-4 py-2 text-white hover:text-purple-300 relative group transition-colors duration-300"
      >
        <span className="flex-1">{text}</span>
        <span className="absolute left-0 top-0 h-full w-1 bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </a>
    )}
  </li>
);

export default NavLink;
