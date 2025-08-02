import { useEffect, RefObject, useCallback } from 'react';

/**
 * Hook personalizado que detecta clics fuera del elemento referenciado
 * @param ref - Referencia al elemento DOM que se quiere monitorear
 * @param callback - Función a ejecutar cuando se detecta un clic fuera del elemento
 */
const useOutsideClick = (ref: RefObject<HTMLElement>, callback: () => void) => {
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        memoizedCallback();
      }
    };

    // Agregar el event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Limpiar el event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, memoizedCallback]);
};

export default useOutsideClick;