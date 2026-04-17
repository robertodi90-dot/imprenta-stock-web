const FiltersBar = ({
  search,
  onSearchChange,
  medida,
  textura,
  gramaje,
  onMedidaChange,
  onTexturaChange,
  onGramajeChange,
  sortBy,
  onSortChange,
  onlyWithStock,
  onOnlyWithStockChange,
  onClear,
  medidas,
  texturas,
  gramajes,
}) => (
  <section className="panel filters-panel">
    <h2>Filtros y búsqueda</h2>
    <div className="filters-grid">
      <label>
        Buscar (código o descripción)
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Ej: PAP-003 o opalina"
        />
      </label>

      <label>
        Medida
        <select value={medida} onChange={(event) => onMedidaChange(event.target.value)}>
          <option value="">Todas</option>
          {medidas.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label>
        Textura
        <select value={textura} onChange={(event) => onTexturaChange(event.target.value)}>
          <option value="">Todas</option>
          {texturas.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label>
        Gramaje
        <select value={gramaje} onChange={(event) => onGramajeChange(event.target.value)}>
          <option value="">Todos</option>
          {gramajes.map((value) => (
            <option key={value} value={String(value)}>
              {value} g
            </option>
          ))}
        </select>
      </label>

      <label>
        Ordenar por
        <select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
          <option value="descripcion">Descripción (A-Z)</option>
          <option value="existencia_desc">Existencia (mayor a menor)</option>
          <option value="precio_asc">Precio (menor a mayor)</option>
        </select>
      </label>

      <label className="stock-toggle">
        <input
          type="checkbox"
          checked={onlyWithStock}
          onChange={(event) => onOnlyWithStockChange(event.target.checked)}
        />
        <span>Mostrar solo con stock</span>
      </label>

      <button type="button" className="clear-btn" onClick={onClear}>
        Limpiar filtros
      </button>
    </div>
  </section>
);

export default FiltersBar;
