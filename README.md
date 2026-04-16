# Imprenta Stock Web

Web de consulta de stock y eventos para imprenta.

## Enfoque de datos (flujo privado)

- El Excel **no se consume en el navegador**.
- La web solo lee JSON finales en `public/stock.json` y `public/events.json`.
- El Excel privado se procesa localmente con un script Node.

## 1) Configurar la ruta del Excel privado

El script está en `scripts/generate-data.js`.

Opciones simples para indicar el archivo Excel:

1. Editar la constante dentro del script:
   ```js
   const EXCEL_FILE_PATH = './private/stock.xlsx';
   ```
2. O usar variable de entorno:
   ```bash
   PRIVATE_EXCEL_PATH="/ruta/privada/mi-archivo.xlsx" npm run generate:data
   ```
3. O pasar ruta por argumento (prioridad más alta):
   ```bash
   npm run generate:data -- /ruta/privada/mi-archivo.xlsx
   ```

## 2) Generar `stock.json` y `events.json`

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Ejecutar el generador:
   ```bash
   npm run generate:data
   ```

El script intenta leer:

- Hoja `EXISTENCIAS_EEA` para stock.
- Hoja `REGISTRO` para eventos.

Campos de salida para stock:

- `codigo`
- `descripcion`
- `existencia`
- `precio`
- `medida`
- `textura`
- `gramaje`

Campos de salida para eventos:

- `tipo`
- `fecha`
- `texto`

Si faltan columnas, el script muestra advertencias en consola. También intenta extraer `medida`, `textura` y `gramaje` desde `descripcion` cuando no vengan separados.

## 3) Levantar la web

```bash
npm run dev
```

Luego abre la URL que muestra Vite (normalmente `http://localhost:5173`).

## Comportamiento de fallback

Si `/stock.json` o `/events.json` no existen o fallan, la app muestra datos de respaldo y un mensaje amigable indicando que debes ejecutar el script de generación.

## Estructura clave

- `src/App.jsx`: carga JSON, aplica filtros/búsqueda/orden y contador.
- `scripts/generate-data.js`: transforma Excel privado a JSON público.
- `public/stock.json`: dataset final consumido por la web.
- `public/events.json`: eventos finales consumidos por la web.
