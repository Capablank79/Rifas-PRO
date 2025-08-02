import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';
import './Navbar.css';
import useOutsideClick from '../hooks/useOutsideClick';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { state, logout } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [navbarCollapsed, setNavbarCollapsed] = useState(true);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  // Memoizar callbacks para useOutsideClick
  const closeAccountMenu = useCallback(() => {
    if (showAccountMenu) setShowAccountMenu(false);
  }, [showAccountMenu]);

  const closeNavbar = useCallback(() => {
    if (!navbarCollapsed) setNavbarCollapsed(true);
  }, [navbarCollapsed]);

  // Usar el hook personalizado para cerrar el menú cuando se hace clic fuera
  useOutsideClick(dropdownRef, closeAccountMenu);

  // Cerrar el menú desplegable cuando se hace clic fuera del navbar
  useOutsideClick(navbarRef, closeNavbar);

  const toggleAccountMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAccountMenu(!showAccountMenu);
  }, [showAccountMenu]);

  const toggleNavbar = useCallback(() => {
    setNavbarCollapsed(!navbarCollapsed);
  }, [navbarCollapsed]);

  const handleLogout = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    setShowAccountMenu(false);
    setNavbarCollapsed(true);
  }, [logout]);

  // Función para manejar el redimensionamiento de la ventana
  const handleResize = useCallback(() => {
    if (window.innerWidth >= 992) {
      setNavbarCollapsed(true);
    }
  }, []);

  // Cerrar el menú desplegable cuando cambia el tamaño de la ventana
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container" ref={navbarRef}>
        <Link className="navbar-brand" to="/">
          <strong>EasyRif</strong>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={!navbarCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${!navbarCollapsed ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={() => setNavbarCollapsed(true)}>
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard" onClick={() => setNavbarCollapsed(true)}>
                <i className="bi bi-graph-up me-1"></i>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/create" onClick={() => setNavbarCollapsed(true)}>
                Crear Rifa
              </Link>
            </li>
            <li className="nav-item dropdown" ref={dropdownRef}>
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                aria-expanded={showAccountMenu}
                onClick={toggleAccountMenu}
              >
                <i className="bi bi-person-circle me-1"></i>
                {state.user?.username || 'Usuario'}
              </a>
              <ul 
                className={`dropdown-menu dropdown-menu-end ${showAccountMenu ? 'show' : ''}`} 
                aria-labelledby="navbarDropdown"
              >
                <li>
                  <div className="dropdown-item-text">
                    <small className="text-muted">Conectado como:</small><br />
                    <strong>{state.user?.username}</strong>
                    <br />
                    <small className="text-muted">{state.user?.email}</small>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link 
                    className="dropdown-item" 
                    to="/dashboard" 
                    onClick={() => {
                      setShowAccountMenu(false);
                      setNavbarCollapsed(true);
                    }}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    className="dropdown-item" 
                    to="/create" 
                    onClick={() => {
                      setShowAccountMenu(false);
                      setNavbarCollapsed(true);
                    }}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Rifa
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a 
                    className="dropdown-item text-danger" 
                    href="#"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar sesión
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;