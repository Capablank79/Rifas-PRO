import React from 'react';
import { SafeHtml } from './SafeHtml';

const SafeHtmlExample: React.FC = () => {
  // Ejemplo de HTML con un script potencialmente malicioso
  const rawHtml = `<h2>Hola mundo</h2><script>alert('XSS')</script>`;

  // Ejemplo de HTML con estilos y formato
  const formattedHtml = `
    <div style="padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
      <h3 style="color: var(--easyreef-primary);">Contenido HTML Seguro</h3>
      <p>Este contenido HTML ha sido <strong>sanitizado</strong> con DOMPurify.</p>
      <ul>
        <li>Los scripts son eliminados</li>
        <li>Los atributos peligrosos son eliminados</li>
        <li>El contenido HTML seguro se mantiene intacto</li>
      </ul>
    </div>
  `;

  return (
    <div className="container my-4">
      <h1>Demostración de HTML Seguro</h1>
      
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Ejemplo 1: HTML con script malicioso</h5>
        </div>
        <div className="card-body">
          <h6>Código original:</h6>
          <pre className="bg-light p-2">{rawHtml}</pre>
          
          <h6 className="mt-3">Resultado renderizado (sanitizado):</h6>
          <div className="border p-3">
            <SafeHtml html={rawHtml} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Ejemplo 2: HTML con estilos</h5>
        </div>
        <div className="card-body">
          <h6>Resultado renderizado (sanitizado):</h6>
          <SafeHtml html={formattedHtml} />
        </div>
      </div>

      <div className="alert alert-info mt-4">
        <h5>¿Cómo usar SafeHtml?</h5>
        <p>
          Importa el componente y pásale el HTML como prop:
        </p>
        <pre className="bg-light p-2">{`import { SafeHtml } from './components/SafeHtml';

// En tu componente:
<SafeHtml html={tuContenidoHTML} />`}</pre>
      </div>
    </div>
  );
};

export default SafeHtmlExample;