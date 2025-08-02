import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HamburgerMenu.css';
import { useRaffle } from '../context/RaffleContext';

interface HamburgerMenuProps {
  // Puedes agregar props adicionales según sea necesario
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { raffles, clearAllData } = useRaffle();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (menuOpen) {
      setSettingsOpen(false);
    }
  };

  const toggleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingsOpen(!settingsOpen);
  };

  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar TODAS las rifas, vendedores, compradores y resultados? Esta acción no se puede deshacer.'
    );
    
    if (confirmed) {
      try {
        // Limpiar datos
        clearAllData();
        setMenuOpen(false);
        setSettingsOpen(false);
        
        // Mostrar mensaje de éxito
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            type: 'success',
            title: 'Datos eliminados',
            message: 'Todos los datos han sido eliminados exitosamente'
          }
        }));
        
        // Forzar recarga de la página para asegurar que se reflejen los cambios
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 500);
        
      } catch (error) {
        console.error('Error al limpiar datos:', error);
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            type: 'error',
            title: 'Error',
            message: 'Hubo un problema al eliminar los datos. Por favor, inténtalo de nuevo.'
          }
        }));
      }
    }
  };

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="hamburger-menu" ref={menuRef}>
      <button 
        className={`hamburger-icon ${menuOpen ? 'active' : ''}`} 
        onClick={toggleMenu}
        aria-label="Menú"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`menu-container ${menuOpen ? 'visible' : 'hidden'}`}>
        <div className="menu-item" onClick={() => {
          navigate('/dashboard');
          setMenuOpen(false);
          setSettingsOpen(false);
        }}>
          <i className="bi bi-speedometer2"></i>
          Dashboard
        </div>
        <div className="menu-divider"></div>
        <div className="menu-item" onClick={toggleSettings}>
          <i className="bi bi-gear"></i>
          Ajustes
          <i className={`bi bi-chevron-${settingsOpen ? 'up' : 'down'} ms-auto`}></i>
        </div>

        <div className={`submenu-container ${settingsOpen ? 'open' : ''}`}>
          <div className="submenu-item" onClick={() => {
            // Buscar rifa activa
            const activeRaffle = raffles.find(raffle => raffle.status === 'active');
            
            if (activeRaffle) {
              // Navegar a la página de creación en modo edición
              navigate(`/create?edit=true&raffleId=${activeRaffle.id}`);
            } else {
              // Si no hay rifa activa, ir a crear nueva
              navigate('/create');
            }
            setMenuOpen(false);
            setSettingsOpen(false);
          }}>
            <i className="bi bi-sliders"></i>
            General
          </div>
          <div className="menu-divider"></div>
          <div className="submenu-item">
            <i className="bi bi-person"></i>
            Mi Perfil
          </div>
          <div className="menu-divider"></div>
          <div className="submenu-item">
            <i className="bi bi-people"></i>
            Vendedores
          </div>
          <div className="menu-divider"></div>
          <div className="submenu-item" onClick={handleClearAllData} style={{ color: '#dc3545' }}>
            <i className="bi bi-trash3"></i>
            Limpiar Datos
          </div>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;