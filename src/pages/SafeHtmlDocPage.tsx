import React from 'react';
import SafeHtmlExample from '../components/SafeHtmlExample';

const SafeHtmlDocPage: React.FC = () => {
  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Documentación: Renderizado Seguro de HTML</h1>
          
          <div className="alert alert-warning">
            <h4 className="alert-heading">Solución para el error TrustedHTML</h4>
            <p>
              Este componente resuelve el error <code>"Refused to execute inline script because it violates the following Content Security Policy directive: ... Refused to execute inline event handler because it violates the following Content Security Policy directive: ... Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list."</code>
            </p>
            <p className="mb-0">
              El error ocurre cuando se intenta insertar HTML directamente en el DOM sin sanitizarlo adecuadamente.
            </p>
          </div>

          <h2 className="mt-4">¿Por qué es necesario?</h2>
          <p>
            Cuando necesitas renderizar contenido HTML dinámico en React (por ejemplo, contenido que viene de una API, un CMS, o generado por un editor WYSIWYG), no puedes simplemente asignarlo a <code>innerHTML</code> o usar <code>dangerouslySetInnerHTML</code> sin sanitizarlo primero.
          </p>
          <p>
            Hacerlo puede exponer tu aplicación a ataques de Cross-Site Scripting (XSS) y generar errores relacionados con la Política de Seguridad de Contenido (CSP) como el error TrustedHTML.
          </p>

          <div className="card mb-4">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">❌ Forma incorrecta (insegura)</h5>
            </div>
            <div className="card-body">
              <pre className="bg-light p-3">{`// ¡NO HAGAS ESTO!
const MyComponent = ({ htmlContent }) => {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};
`}</pre>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">✅ Forma correcta (segura)</h5>
            </div>
            <div className="card-body">
              <pre className="bg-light p-3">{`// Importa el componente SafeHtml
import { SafeHtml } from '../components/SafeHtml';

// Úsalo para renderizar HTML de forma segura
const MyComponent = ({ htmlContent }) => {
  return <SafeHtml html={htmlContent} />;
};
`}</pre>
            </div>
          </div>

          <h2>Cómo funciona</h2>
          <p>
            El componente <code>SafeHtml</code> utiliza la biblioteca <a href="https://github.com/cure53/DOMPurify" target="_blank" rel="noopener noreferrer">DOMPurify</a> para sanitizar el HTML antes de renderizarlo. DOMPurify elimina cualquier script o atributo potencialmente peligroso, manteniendo solo el HTML seguro.
          </p>

          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Implementación del componente SafeHtml</h5>
            </div>
            <div className="card-body">
              <pre className="bg-light p-3">{`import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string;
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ html }) => {
  const sanitizedHtml = DOMPurify.sanitize(html);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};
`}</pre>
            </div>
          </div>

          <h2>Ejemplos de uso</h2>
          <SafeHtmlExample />
        </div>
      </div>
    </div>
  );
};

export default SafeHtmlDocPage;