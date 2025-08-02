# 🤝 Guía de Contribución - EasyRif

¡Gracias por tu interés en contribuir a EasyRif! Esta guía te ayudará a empezar.

## 📋 Antes de Empezar

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Git
- Editor de código (recomendamos VS Code)

### Configuración del Entorno
1. Fork el repositorio
2. Clona tu fork localmente:
   ```bash
   git clone https://github.com/tu-usuario/EasyRif.git
   cd EasyRif
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Copia el archivo de variables de entorno:
   ```bash
   cp .env.example .env.local
   ```
5. Ejecuta el proyecto en modo desarrollo:
   ```bash
   npm run dev
   ```

## 🔄 Flujo de Trabajo

### 1. Crear una Rama
```bash
git checkout -b feature/nombre-de-tu-feature
# o
git checkout -b fix/descripcion-del-bug
```

### 2. Realizar Cambios
- Mantén los commits pequeños y enfocados
- Usa mensajes de commit descriptivos
- Sigue las convenciones de código existentes

### 3. Probar los Cambios
```bash
# Ejecutar en modo desarrollo
npm run dev

# Verificar que el build funciona
npm run build
```

### 4. Enviar Pull Request
1. Push a tu rama:
   ```bash
   git push origin feature/nombre-de-tu-feature
   ```
2. Crea un Pull Request desde GitHub
3. Describe claramente los cambios realizados

## 📝 Estándares de Código

### Convenciones de Nomenclatura
- **Componentes**: PascalCase (`VendorModal.tsx`)
- **Funciones**: camelCase (`handleSubmit`)
- **Variables**: camelCase (`raffleData`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_VENDORS`)
- **Archivos**: kebab-case para utilidades, PascalCase para componentes

### Estructura de Componentes
```typescript
import React from 'react';
import { ComponentProps } from '../types';

interface Props {
  // Props del componente
}

const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Hooks
  // Estados locales
  // Funciones auxiliares
  // Efectos
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### TypeScript
- Usa tipos explícitos siempre que sea posible
- Define interfaces para props y datos complejos
- Evita `any`, usa `unknown` si es necesario

## 🎯 Tipos de Contribuciones

### 🐛 Reportar Bugs
- Usa el template de issue para bugs
- Incluye pasos para reproducir
- Especifica el navegador y versión
- Adjunta capturas de pantalla si es relevante

### ✨ Nuevas Características
- Abre un issue primero para discutir la idea
- Asegúrate de que se alinee con los objetivos del proyecto
- Incluye tests si es aplicable

### 📚 Documentación
- Mejoras en README.md
- Comentarios en código complejo
- Documentación de APIs

### 🎨 Mejoras de UI/UX
- Mantén consistencia con el diseño actual
- Considera la accesibilidad
- Prueba en diferentes tamaños de pantalla

## 🧪 Testing

Actualmente el proyecto no tiene tests automatizados, pero puedes contribuir:

### Testing Manual
1. Prueba todas las funcionalidades principales:
   - Crear rifas
   - Agregar vendedores
   - Realizar ventas
   - Ejecutar sorteos

2. Verifica en diferentes navegadores:
   - Chrome
   - Firefox
   - Safari
   - Edge

3. Prueba responsividad:
   - Desktop
   - Tablet
   - Mobile

### Agregar Tests Automatizados
Si quieres contribuir con testing:
- Considera usar Jest + React Testing Library
- Enfócate en componentes críticos primero
- Incluye tests de integración para flujos principales

## 📁 Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── context/       # Context API para estado global
├── pages/         # Páginas/rutas principales
├── types/         # Definiciones de TypeScript
├── utils/         # Funciones auxiliares
├── services/      # Servicios externos
└── assets/        # Recursos estáticos
```

## 🚀 Despliegue

El proyecto está configurado para:
- **Desarrollo**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## 📞 Contacto

Si tienes preguntas:
- Abre un issue en GitHub
- Contacta a los mantenedores

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones se licencien bajo la misma licencia MIT del proyecto.

---

¡Gracias por contribuir a EasyRif! 🎉