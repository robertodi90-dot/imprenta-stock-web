import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import xlsx from 'xlsx';

/**
 * Uso:
 * 1) Deja tu Excel en: private/CONSUMO MARZO 2026.xlsm
 * 2) Ejecuta: node scripts/generate-data.js
 *
 * Opcional:
 * - Puedes pasar otra ruta por CLI:
 *   node scripts/generate-data.js "private/otro-archivo.xlsm"
 *
 * - O por variable de entorno:
 *   set PRIVATE_EXCEL_PATH=private/otro-archivo.xlsm
 *   node scripts/generate-data.js
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const DEFAULT_EXCEL_PATH =
  process.env.PRIVATE_EXCEL_PATH || path.join('private', 'CONSUMO MARZO 2026.xlsm');

const excelPathArg = process.argv[2];
const excelPath = path.resolve(repoRoot, excelPathArg || DEFAULT_EXCEL_PATH);
const publicDir = path.join(repoRoot, 'public');

const STOCK_SHEET_NAME = 'EXISTENCIAS_EEA';
const EVENTS_SHEET_NAME = 'REGISTRO';

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;

  const normalized = String(value)
    .trim()
    .replace(/\s+/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const excelDateToISO = (value) => {
  if (value === null || value === undefined || value === '') return '';

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 19).replace('T', ' ');
  }

  if (typeof value === 'number') {
    const parsed = xlsx.SSF.parse_date_code(value);
    if (parsed) {
      const yyyy = String(parsed.y).padStart(4, '0');
      const mm = String(parsed.m).padStart(2, '0');
      const dd = String(parsed.d).padStart(2, '0');
      const hh = String(parsed.H || 0).padStart(2, '0');
      const mi = String(parsed.M || 0).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    }
  }

  return String(value).trim();
};

const extractFromDescription = (description) => {
  const text = String(description ?? '');

  const medidaMatch = text.match(/(\d{2,3}\s?[xX]\s?\d{2,3})/);
  const gramajeMatch = text.match(/(\d{2,4})\s?(g|gr|gsm)\b/i);

  const normalized = normalizeText(text);

  const textura = normalized.includes('rugos')
    ? 'Rugosa'
    : normalized.includes('mate')
      ? 'Mate'
      : normalized.includes('satin')
        ? 'Satinada'
        : normalized.includes('brillo')
          ? 'Brillante'
          : normalized.includes('lisa')
            ? 'Lisa'
            : '';

  const gramajeRaw = gramajeMatch?.[1] || '';

  return {
    medida: medidaMatch ? medidaMatch[1].replace(/\s/g, '') : '',
    textura,
    gramaje: gramajeRaw ? Number(gramajeRaw) : 0,
  };
};

const findColumn = (headers, options) => {
  const normalizedOptions = options.map(normalizeText);
  return headers.find((header) => normalizedOptions.includes(normalizeText(header)));
};

const logMissingColumn = (sheetName, fieldName, options) => {
  console.warn(
    `[WARN] Hoja ${sheetName}: no encontré columna para "${fieldName}". Probadas: ${options.join(', ')}`,
  );
};

const parseStock = (rows, sheetName) => {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);

  const codeCol = findColumn(headers, ['codigo', 'cod', 'sku']);
  const descriptionCol = findColumn(headers, ['descripcion', 'producto', 'articulo', 'detalle']);
  const stockCol = findColumn(headers, ['existencia', 'stock', 'cantidad']);
  const priceCol = findColumn(headers, ['precio', 'precio unitario', 'pvp', 'valor']);
  const medidaCol = findColumn(headers, ['medida', 'tamano', 'tamaño', 'dimension']);
  const texturaCol = findColumn(headers, ['textura', 'acabado']);
  const gramajeCol = findColumn(headers, ['gramaje', 'peso', 'gsm']);

  if (!codeCol) logMissingColumn(sheetName, 'codigo', ['codigo', 'cod', 'sku']);
  if (!descriptionCol) {
    logMissingColumn(sheetName, 'descripcion', ['descripcion', 'producto', 'articulo', 'detalle']);
  }
  if (!stockCol) logMissingColumn(sheetName, 'existencia', ['existencia', 'stock', 'cantidad']);
  if (!priceCol) {
    logMissingColumn(sheetName, 'precio', ['precio', 'precio unitario', 'pvp', 'valor']);
  }
  if (!medidaCol) logMissingColumn(sheetName, 'medida', ['medida', 'tamano', 'dimension']);
  if (!texturaCol) logMissingColumn(sheetName, 'textura', ['textura', 'acabado']);
  if (!gramajeCol) logMissingColumn(sheetName, 'gramaje', ['gramaje', 'peso', 'gsm']);

  return rows
    .map((row, index) => {
      const descripcion = String(descriptionCol ? row[descriptionCol] : '').trim();
      const inferred = extractFromDescription(descripcion);

      const medida = String(medidaCol ? row[medidaCol] : '').trim() || inferred.medida;
      const textura = String(texturaCol ? row[texturaCol] : '').trim() || inferred.textura;
      const gramaje = toNumber(gramajeCol ? row[gramajeCol] : 0) || inferred.gramaje;

      return {
        id: index + 1,
        codigo: String(codeCol ? row[codeCol] : '').trim() || `SIN-COD-${index + 1}`,
        descripcion,
        existencia: toNumber(stockCol ? row[stockCol] : 0),
        precio: toNumber(priceCol ? row[priceCol] : 0),
        medida,
        textura,
        gramaje,
      };
    })
    .filter((item) => item.descripcion || item.codigo);
};

const parseEvents = (rows, sheetName) => {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);

  const fechaRegistroCol = findColumn(headers, ['fecha/hora registro', 'fecha hora registro']);
  const fechaMovimientoCol = findColumn(headers, ['fecha movimiento', 'fecha']);
  const descripcionCol = findColumn(headers, ['descripcion', 'detalle', 'texto', 'observacion']);
  const codigoCol = findColumn(headers, ['codigo', 'cod', 'sku']);
  const otCol = findColumn(headers, ['ot']);
  const cantidadCol = findColumn(headers, ['cantidad descontada', 'cantidad']);
  const stockAntesCol = findColumn(headers, ['stock antes']);
  const stockDespuesCol = findColumn(headers, ['stock despues']);
  const usuarioCol = findColumn(headers, ['usuario']);
  const visualizarCol = findColumn(headers, ['visualizar', 'mostrar', 'visible']);

  if (!fechaRegistroCol && !fechaMovimientoCol) {
    logMissingColumn(sheetName, 'fecha', ['fecha/hora registro', 'fecha movimiento', 'fecha']);
  }
  if (!descripcionCol) {
    logMissingColumn(sheetName, 'descripcion', ['descripcion', 'detalle', 'texto', 'observacion']);
  }
  if (!visualizarCol) {
    logMissingColumn(sheetName, 'visualizar', ['visualizar', 'mostrar', 'visible']);
  }

  const shouldShow = (value) => {
    const normalized = normalizeText(value);
    return ['si', 'sí', 'true', '1', 'x', 'ok'].includes(normalized);
  };

  const events = rows
    .filter((row) => {
      if (!visualizarCol) return true;
      return shouldShow(row[visualizarCol]);
    })
    .map((row, index) => {
      const descripcion = String(descripcionCol ? row[descripcionCol] : '').trim();
      const codigo = String(codigoCol ? row[codigoCol] : '').trim();
      const ot = String(otCol ? row[otCol] : '').trim();
      const cantidad = toNumber(cantidadCol ? row[cantidadCol] : 0);
      const stockAntes = toNumber(stockAntesCol ? row[stockAntesCol] : 0);
      const stockDespues = toNumber(stockDespuesCol ? row[stockDespuesCol] : 0);
      const usuario = String(usuarioCol ? row[usuarioCol] : '').trim();

      let tipo = 'Movimiento';
      if (stockDespues < stockAntes) tipo = 'Salida';
      else if (stockDespues > stockAntes) tipo = 'Entrada';
      else tipo = 'Ajuste';

      const fecha = excelDateToISO(
        fechaRegistroCol ? row[fechaRegistroCol] : fechaMovimientoCol ? row[fechaMovimientoCol] : ''
      );

      const textoPartes = [
        descripcion,
        codigo ? `Código: ${codigo}` : '',
        ot ? `OT: ${ot}` : '',
        cantidad ? `Cantidad: ${cantidad}` : '',
        usuario ? `Usuario: ${usuario}` : '',
      ].filter(Boolean);

      return {
        id: index + 1,
        tipo,
        fecha,
        texto: textoPartes.join(' | '),
      };
    })
    .filter((event) => event.texto || event.fecha);

  return events.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
};

console.log('[INFO] Repo root:', repoRoot);
console.log('[INFO] Buscando Excel en:', excelPath);

if (!fs.existsSync(excelPath)) {
  console.error(`[ERROR] No existe el Excel en: ${excelPath}`);
  process.exit(1);
}

const workbook = xlsx.readFile(excelPath, { cellDates: true });

const stockSheet = workbook.Sheets[STOCK_SHEET_NAME];
const eventsSheet = workbook.Sheets[EVENTS_SHEET_NAME];

if (!stockSheet) {
  console.warn(`[WARN] No existe la hoja "${STOCK_SHEET_NAME}". Se generará stock.json vacío.`);
}
if (!eventsSheet) {
  console.warn(`[WARN] No existe la hoja "${EVENTS_SHEET_NAME}". Se generará events.json vacío.`);
}

const stockRows = stockSheet ? xlsx.utils.sheet_to_json(stockSheet, { defval: '' }) : [];
const eventsRows = eventsSheet ? xlsx.utils.sheet_to_json(eventsSheet, { defval: '' }) : [];

const stock = parseStock(stockRows, STOCK_SHEET_NAME);
const events = parseEvents(eventsRows, EVENTS_SHEET_NAME);
const dataMeta = {
  generatedAt: new Date().toISOString(),
  sourceFile: path.basename(excelPath),
};

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'stock.json'), JSON.stringify(stock, null, 2), 'utf8');
fs.writeFileSync(path.join(publicDir, 'events.json'), JSON.stringify(events, null, 2), 'utf8');
fs.writeFileSync(path.join(publicDir, 'data-meta.json'), JSON.stringify(dataMeta, null, 2), 'utf8');

console.log(`[OK] Generados ${stock.length} registros en public/stock.json`);
console.log(`[OK] Generados ${events.length} registros en public/events.json`);
console.log(`[OK] Marca de actualización en public/data-meta.json (${dataMeta.generatedAt})`);
