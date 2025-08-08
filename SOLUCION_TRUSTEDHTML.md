# Solución al Error TrustedHTML en EasyReef

## Problema

La aplicación estaba experimentando errores relacionados con `TrustedHTML` al intentar renderizar contenido HTML dinámico sin sanitizarlo adecuadamente. Estos errores suelen aparecer cuando:

1. Se utiliza `innerHTML` directamente en el DOM
2. Se usa `dangerouslySetInnerHTML` en React sin sanitizar el contenido
3. Se viola la Política de Seguridad de Contenido (CSP) del navegador

El error típico se ve así:

```
Refused to execute inline script because it violates the following Content Security Policy directive: ... 
Refused to execute inline event handler because it violates the following Content Security Policy directive: ... 
Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list.
```

## Solución implementada

Hemos creado un componente reutilizable llamado `SafeHtml` que utiliza la biblioteca [DOMPurify](https://github.com/cure53/DOMPurify) para sanitizar el HTML antes de renderizarlo de manera segura.

### Componentes creados

1. **`SafeHtml.tsx`**: Componente principal que sanitiza y renderiza HTML de forma segura
2. **`SafeHtmlExample.tsx`**: Componente de ejemplo que muestra cómo usar SafeHtml
3. **`SafeHtmlDocPage.tsx`**: Página de documentación accesible en `/safe-html-doc`

### Cómo usar el componente SafeHtml

```tsx
// Importa el componente
import { SafeHtml } from './components/SafeHtml';

// Úsalo para renderizar HTML de forma segura
const MyComponent = () => {
  const htmlContent = '<p>Este es un <strong>contenido HTML</strong> que podría venir de una API o CMS</p>';
  
  return <SafeHtml html={htmlContent} />;
};
```

### Beneficios

1. **Seguridad**: Previene ataques XSS (Cross-Site Scripting)
2. **Compatibilidad con CSP**: Cumple con las políticas de seguridad de contenido
3. **Reutilizable**: Puede usarse en cualquier parte de la aplicación
4. **Mantenible**: Centraliza la lógica de sanitización

## Dónde aplicar esta solución

Debes usar el componente `SafeHtml` en cualquier lugar donde necesites renderizar HTML dinámico, especialmente:

- Contenido que viene de APIs externas
- Texto enriquecido de un CMS
- Contenido generado por editores WYSIWYG
- Emails o notificaciones con formato HTML
- Descripciones de productos o servicios con formato

## Documentación

Para ver ejemplos y más detalles sobre cómo usar este componente, visita la página de documentación en la aplicación:

```
/safe-html-doc
```

## Dependencias añadidas

```json
"dependencies": {
  "dompurify": "^3.0.6"
},
"devDependencies": {
  "@types/dompurify": "^3.0.5"
}
```