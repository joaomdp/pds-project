import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/logo.png";
import NavLink from "../layout/NavLink";
import NotificationIcon from "../ui/NotificationIcon";
import LogoutButton from "../auth/LogoutButton";
import LoginButton from "../auth/LoginButton";

export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      document.body.classList.add("mobile-sidebar-active");
    } else {
      document.body.classList.remove("mobile-sidebar-active");
    }
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {!isCollapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-gray-900 to-gray-800 z-30 flex items-center justify-between px-4 shadow-lg">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <button
            onClick={toggleSidebar}
            className="text-white focus:outline-none p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <i className={`bx ${isCollapsed ? "bx-menu" : "bx-x"} text-2xl`} />
          </button>
        </div>
      )}

      {!isMobile && (
        <aside
          className={`fixed top-0 left-0 z-30 h-full transition-all duration-300 ${
            isCollapsed ? "w-20" : "w-64"
          } bg-gradient-to-b from-gray-900 to-gray-800 shadow-lg`}
        >
          <div className="flex items-center justify-between p-4">
            {!isCollapsed && (
              <img src={logo} alt="Logo" className="w-28 h-auto" />
            )}
            <button
              onClick={toggleSidebar}
              className="text-white focus:outline-none p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <i
                className={`bx ${isCollapsed ? "bx-menu" : "bx-x"} text-2xl`}
              />
            </button>
          </div>

          {!isCollapsed && (
            <div className="px-6 text-gray-400 text-xs uppercase tracking-wider mb-2">
              Páginas
            </div>
          )}

          <nav className="px-2">
            <ul className="space-y-2">
              <NavLink
                href="/home"
                text="Dashboard"
                iconClass="bx-home"
                isLocked={!usuario}
                isActive={location.pathname === "/home"}
                collapsed={isCollapsed}
              />
              <NavLink
                href="/maquinas"
                text="Máquinas"
                iconClass="bx-desktop"
                isLocked={!usuario}
                isActive={location.pathname === "/maquinas"}
                collapsed={isCollapsed}
              />
              <NavLink
                href="/clientes"
                text="Clientes"
                iconClass="bx-group"
                isLocked={!usuario}
                isActive={location.pathname === "/clientes"}
                collapsed={isCollapsed}
              />
              <NavLink
                href="/locacoes"
                text="Locações"
                iconClass="bx-cart"
                isLocked={!usuario}
                isActive={location.pathname === "/locacoes"}
                collapsed={isCollapsed}
              />
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 w-full p-4 flex justify-center">
            {!usuario ? (
              <LoginButton collapsed={isCollapsed} />
            ) : (
              <div
                className={`flex items-center ${
                  isCollapsed ? "flex-col space-y-4" : "space-x-4"
                }`}
              >
                <NotificationIcon collapsed={isCollapsed} />
                <LogoutButton onLogout={handleLogout} collapsed={isCollapsed} />
              </div>
            )}
          </div>
        </aside>
      )}

      {isMobile && !isCollapsed && (
        <div className="fixed top-16 left-0 right-0 bg-gray-900 shadow-lg z-30 animate-slideDown">
          <nav className="px-4 py-2">
            <ul className="space-y-1">
              <NavLink
                href="/home"
                text="Dashboard"
                iconClass="bx-home"
                isLocked={!usuario}
                isActive={location.pathname === "/home"}
                collapsed={false}
              />
              <NavLink
                href="/maquinas"
                text="Máquinas"
                iconClass="bx-desktop"
                isLocked={!usuario}
                isActive={location.pathname === "/maquinas"}
                collapsed={false}
              />
              <NavLink
                href="/clientes"
                text="Clientes"
                iconClass="bx-group"
                isLocked={!usuario}
                isActive={location.pathname === "/clientes"}
                collapsed={false}
              />
              <NavLink
                href="/locacoes"
                text="Locações"
                iconClass="bx-cart"
                isLocked={!usuario}
                isActive={location.pathname === "/locacoes"}
                collapsed={false}
              />
            </ul>
          </nav>
          <div className="px-4 py-3 border-t border-gray-800">
            {!usuario ? (
              <LoginButton collapsed={false} />
            ) : (
              <div className="flex items-center justify-between">
                <NotificationIcon collapsed={false} />
                <LogoutButton onLogout={handleLogout} collapsed={false} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
