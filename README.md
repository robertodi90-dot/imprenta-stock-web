# Imprenta Stock Web (Demo v1)

Primera versión web simple para consultar stock y eventos recientes de una imprenta.

## Qué incluye

- Búsqueda por código o descripción
- Filtros por medida, textura y gramaje
- Orden por descripción, existencia y precio
- Tarjetas de producto con indicador visual de bajo stock
- Panel de eventos recientes
- Datos locales/mock en `src/data/` (listos para reemplazar luego por una fuente como Excel)

## Ejecutar en local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar entorno de desarrollo:
   ```bash
   npm run dev
   ```
3. Abrir en navegador la URL que muestra Vite (normalmente `http://localhost:5173`).

## Estructura base

- `src/App.jsx`: pantalla principal y lógica de filtros/orden
- `src/components/`: componentes UI separados
- `src/data/products.js`: productos mock
- `src/data/events.js`: eventos mock
