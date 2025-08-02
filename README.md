# 🎯 EasyRif - Sistema de Gestión de Rifas

Una aplicación web moderna y completa para la gestión de rifas, desarrollada con React, TypeScript y Vite. Permite crear, administrar y realizar sorteos de manera eficiente con una interfaz intuitiva y profesional.

## ✨ Características Principales

### 🎪 Gestión de Rifas
- **Creación de rifas** con configuración personalizable
- **Gestión de premios** con imágenes y descripciones
- **Configuración flexible** de vendedores y números
- **Fechas de sorteo** programables

### 👥 Sistema de Vendedores
- **Registro de vendedores** con información completa
- **Asignación automática** de números por vendedor
- **Seguimiento de ventas** en tiempo real
- **Gestión de comisiones** y estadísticas

### 🛒 Proceso de Compra
- **Selección de números** intuitiva
- **Información del comprador** completa
- **Generación de códigos QR** para verificación
- **Confirmación de compra** automática

### 🎲 Sistema de Sorteos
- **Sorteos simples** con un ganador
- **Sorteos múltiples** con varios premios
- **Algoritmo aleatorio** confiable
- **Resultados verificables** y transparentes

### 💰 Gestión Financiera (Demo)
- **Integración con Mercado Pago** (simulada)
- **Datos bancarios** para recaudación
- **Seguimiento de ingresos** por vendedor
- **Reportes financieros** detallados

## 🚀 Tecnologías Utilizadas

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Bootstrap 5 + CSS personalizado
- **Routing:** React Router DOM
- **State Management:** React Context + useReducer
- **Animations:** Framer Motion
- **QR Codes:** qrcode.react
- **Storage:** LocalStorage para persistencia

## 📦 Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Capablank79/EasyRif.git
cd EasyRif
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
yarn dev
```

4. **Abrir en el navegador**
```
http://localhost:5173
```

## 🏗️ Scripts Disponibles

- `npm run dev` - Ejecuta la aplicación en modo desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## 📱 Uso de la Aplicación

### 1. Crear una Rifa
1. Navega a "Crear Rifa"
2. Completa la información básica (nombre, precio, vendedores)
3. Configura los datos bancarios (demo)
4. Agrega los premios con imágenes
5. Confirma la creación

### 2. Gestionar Vendedores
1. Accede a la rifa creada
2. Agrega vendedores con su información
3. Los números se asignan automáticamente
4. Monitorea las ventas en tiempo real

### 3. Proceso de Venta
1. Los vendedores acceden a su página de ventas
2. Registran compradores y números seleccionados
3. Se genera un código QR de confirmación
4. El sistema actualiza automáticamente las estadísticas

### 4. Realizar Sorteo
1. Cuando llegue la fecha, accede al sorteo
2. Elige entre sorteo simple o múltiple
3. Ejecuta el sorteo con algoritmo aleatorio
4. Los resultados se muestran y almacenan

## 🎨 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── BuyersModal.tsx
│   ├── DrawModal.tsx
│   └── VendorModal.tsx
├── context/            # Gestión de estado global
│   └── RaffleContext.tsx
├── pages/              # Páginas principales
│   ├── HomePage.tsx
│   ├── CreateRafflePage.tsx
│   ├── RaffleManagementPage.tsx
│   ├── SellPage.tsx
│   └── ConfirmationPage.tsx
├── types/              # Definiciones de TypeScript
│   └── index.ts
├── utils/              # Utilidades y helpers
│   └── helpers.ts
└── services/           # Servicios externos
    └── webpay.ts
```

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Configuración de la aplicación
VITE_APP_NAME=EasyRif
VITE_APP_VERSION=1.0.0

# URLs de servicios (para producción)
VITE_MERCADOPAGO_PUBLIC_KEY=tu_clave_publica
VITE_API_BASE_URL=https://tu-api.com
```

## 🚀 Despliegue

### Build para Producción
```bash
npm run build
```

### Despliegue en Vercel
1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Despliegue en Netlify
1. Conecta tu repositorio con Netlify
2. Comando de build: `npm run build`
3. Directorio de publicación: `dist`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Capablank79**
- GitHub: [@Capablank79](https://github.com/Capablank79)
- Repositorio: [EasyRif](https://github.com/Capablank79/EasyRif)

## 🙏 Agradecimientos

- Bootstrap por el sistema de diseño
- React team por el excelente framework
- Vite por la herramienta de build ultrarrápida
- Framer Motion por las animaciones fluidas

---

⭐ **¡Si te gusta este proyecto, dale una estrella en GitHub!** ⭐
