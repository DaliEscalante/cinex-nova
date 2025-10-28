# 🎬 CineX - Plataforma de Cine Moderna

Plataforma completa de gestión de cine con cartelera, venta de boletos, dulcería y sistema de punto de venta.

## 🚀 Características

### 🔐 Autenticación Simulada
- Login con roles: **Admin**, **Vendedor** y **Cliente**
- Funciona con cualquier correo y contraseña
- Datos guardados en `localStorage`

### 🎭 Cartelera
- 8 películas de 2025 (Deadpool & Wolverine, Dune 2, Inside Out 2, etc.)
- Vista de cartelera con imágenes y detalles
- Sistema de funciones con horarios y salas

### 🎟️ Sistema de Boletos
- Selección visual de asientos (mapa 10x16)
- Estados: disponible, reservado, vendido, VIP
- Funciones por fecha, hora y sala

### 🍿 Dulcería
- 200 productos mock organizados en 5 categorías
- Combos, snacks, bebidas, palomitas y dulces
- Sistema de inventario y stock

### 💰 Punto de Venta (Vendedor)
- Búsqueda rápida de productos
- Carrito de compra con IVA (16%)
- Registro de ventas

### 👑 Panel de Administrador
- Dashboard con estadísticas
- CRUD de películas
- CRUD de productos
- Reportes en PDF y Excel

### 📊 Reportes
- Exportación a PDF con logo
- Exportación a Excel
- Incluye: SKU, nombre, categoría, precio y stock

## 🎨 Diseño

- **Tema**: Oscuro cinematográfico
- **Colores**: Rojo (#DC143C) y dorado (#FFD700)
- **Estilo**: Moderno, tipo Netflix/Cinépolis
- **Responsive**: Adaptado a todos los dispositivos

## 📦 Tecnologías

- ⚛️ React 18
- ⚡ Vite
- 🎨 Tailwind CSS
- 📘 TypeScript
- 🧩 shadcn/ui
- 📄 jsPDF + autoTable
- 📊 xlsx (SheetJS)

## 🚦 Roles y Accesos

### Cliente (`customer`)
- Ver cartelera
- Seleccionar asientos
- Comprar boletos y productos
- Carrito de compra

### Vendedor (`seller`)
- Acceso a punto de venta (POS)
- Búsqueda y venta de productos
- Registro de ventas con IVA

### Administrador (`admin`)
- Dashboard con estadísticas
- Gestión de películas
- Gestión de productos
- Generación de reportes

## 🔧 Instalación

```bash
# Clonar el repositorio
git clone <YOUR_GIT_URL>

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev
```

## 🌐 Rutas Principales

- `/` - Cartelera (público)
- `/login` - Inicio de sesión
- `/showtimes/:id` - Funciones de película
- `/seatmap/:id` - Selección de asientos
- `/products` - Dulcería
- `/customer/cart` - Carrito (cliente)
- `/seller/pos` - Punto de venta (vendedor)
- `/admin/dashboard` - Panel admin
- `/admin/movies` - Gestión de películas
- `/admin/products` - Gestión de productos
- `/admin/reports` - Reportes

## 💾 Datos Mock

Todos los datos se persisten en `localStorage`:
- ✅ Usuarios y sesiones
- ✅ 8 películas
- ✅ 200 productos en 5 categorías
- ✅ Funciones y horarios
- ✅ Mapas de asientos
- ✅ Ventas y transacciones

## 🔌 Conexión a Backend (Futuro)

El proyecto está preparado para conectarse a un backend real:

1. Edita `src/config.ts`:
```typescript
export const USE_REMOTE = true;
export const API_LARAVEL = "https://tu-api-laravel.com/api";
export const API_NODE = "https://tu-api-node.com/api";
```

2. Los componentes ya están estructurados para migrar de `localStorage` a APIs REST.

## 📝 Credenciales Demo

Usa **cualquier correo y contraseña**, elige tu rol:
- `admin@cinex.com` / `cualquier_password` → **Admin**
- `vendedor@cinex.com` / `cualquier_password` → **Vendedor**  
- `cliente@cinex.com` / `cualquier_password` → **Cliente**

## 🎯 Próximos Pasos

- [ ] Conectar backend Laravel/Node
- [ ] Integración con pasarela de pagos
- [ ] Sistema de notificaciones en tiempo real
- [ ] App móvil con React Native
- [ ] Sistema de puntos y membresías

## 📄 Licencia

Este proyecto es privado y confidencial.

---

Desarrollado con ❤️ usando [Lovable](https://lovable.dev)
