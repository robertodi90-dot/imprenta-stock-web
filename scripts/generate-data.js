import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import xlsx from 'xlsx';

/**
 * Configuración simple:
 * 1) Edita EXCEL_FILE_PATH con tu ruta local absoluta o relativa.
 * 2) Opcional: sobrescribe por CLI: node scripts/generate-data.js /ruta/a/archivo.xlsx
 */
const EXCEL_FILE_PATH = process.env.PRIVATE_EXCEL_PATH || './private/stock.xlsx';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const excelPathArg = process.argv[2];
const excelPath = path.resolve(repoRoot, excelPathArg || EXCEL_FILE_PATH);
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
  const normalized = String(value).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const extractFromDescription = (description) => {
  const text = String(description ?? '');
  const medidaMatch = text.match(/(\d{2,3}\s?[xX]\s?\d{2,3})/);
  const gramajeMatch = text.match(/(\d{2,4})\s?g\b|\b(\d{2,4})\s?gr\b|\b(\d{2,4})\s?gsm\b/i);

  const normalized = normalizeText(text);
  const textura = normalized.includes('rugos')
    ? 'Rugosa'
    : normalized.includes('mate')
      ? 'Mate'
      : normalized.includes('satin')
        ? 'Satinada'
        : normalized.includes('lisa')
          ? 'Lisa'
          : '';

  const gramajeRaw = gramajeMatch?.[1] || gramajeMatch?.[2] || gramajeMatch?.[3] || '';

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
  const priceCol = findColumn(headers, ['precio', 'precio unitario', 'pvp']);
  const medidaCol = findColumn(headers, ['medida', 'tamano', 'tamaño', 'dimension']);
  const texturaCol = findColumn(headers, ['textura', 'acabado']);
  const gramajeCol = findColumn(headers, ['gramaje', 'peso', 'gsm']);

  if (!codeCol) logMissingColumn(sheetName, 'codigo', ['codigo', 'cod', 'sku']);
  if (!descriptionCol) logMissingColumn(sheetName, 'descripcion', ['descripcion', 'producto', 'articulo']);
  if (!stockCol) logMissingColumn(sheetName, 'existencia', ['existencia', 'stock', 'cantidad']);
  if (!priceCol) logMissingColumn(sheetName, 'precio', ['precio', 'precio unitario', 'pvp']);
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
  const typeCol = findColumn(headers, ['tipo', 'movimiento', 'evento']);
  const dateCol = findColumn(headers, ['fecha', 'fecha hora', 'timestamp']);
  const textCol = findColumn(headers, ['texto', 'detalle', 'descripcion', 'observacion']);

  if (!typeCol) logMissingColumn(sheetName, 'tipo', ['tipo', 'movimiento', 'evento']);
  if (!dateCol) logMissingColumn(sheetName, 'fecha', ['fecha', 'fecha hora', 'timestamp']);
  if (!textCol) logMissingColumn(sheetName, 'texto', ['texto', 'detalle', 'descripcion', 'observacion']);

  return rows
    .map((row, index) => ({
      id: index + 1,
      tipo: String(typeCol ? row[typeCol] : 'Evento').trim() || 'Evento',
      fecha: String(dateCol ? row[dateCol] : '').trim(),
      texto: String(textCol ? row[textCol] : '').trim(),
    }))
    .filter((event) => event.texto || event.fecha);
};

if (!fs.existsSync(excelPath)) {
  console.error(`[ERROR] No existe el Excel en: ${excelPath}`);
  process.exit(1);
}

const workbook = xlsx.readFile(excelPath);

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

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'stock.json'), JSON.stringify(stock, null, 2));
fs.writeFileSync(path.join(publicDir, 'events.json'), JSON.stringify(events, null, 2));

console.log(`[OK] Generados ${stock.length} registros en public/stock.json`);
console.log(`[OK] Generados ${events.length} registros en public/events.json`);
