import { useMemo, useState } from 'react';
import FiltersBar from './components/FiltersBar';
import ProductCard from './components/ProductCard';
import EventsPanel from './components/EventsPanel';
import { products } from './data/products';
import { recentEvents } from './data/events';

const initialFilters = {
  search: '',
  medida: '',
  textura: '',
  gramaje: '',
  sortBy: 'descripcion',
};

function App() {
  const [filters, setFilters] = useState(initialFilters);

  const measures = useMemo(
    () => [...new Set(products.map((product) => product.medida))].sort(),
    [],
  );
  const textures = useMemo(
    () => [...new Set(products.map((product) => product.textura))].sort(),
    [],
  );
  const weights = useMemo(
    () => [...new Set(products.map((product) => product.gramaje))].sort((a, b) => a - b),
    [],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    const list = products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.codigo.toLowerCase().includes(normalizedSearch) ||
        product.descripcion.toLowerCase().includes(normalizedSearch);
      const matchesMeasure = !filters.medida || product.medida === filters.medida;
      const matchesTexture = !filters.textura || product.textura === filters.textura;
      const matchesWeight = !filters.gramaje || String(product.gramaje) === filters.gramaje;

      return matchesSearch && matchesMeasure && matchesTexture && matchesWeight;
    });

    return list.sort((a, b) => {
      switch (filters.sortBy) {
        case 'existencia_desc':
          return b.existencia - a.existencia;
        case 'precio_asc':
          return a.precio - b.precio;
        case 'descripcion':
        default:
          return a.descripcion.localeCompare(b.descripcion);
      }
    });
  }, [filters]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const clearFilters = () => setFilters(initialFilters);

  return (
    <main className="app-shell">
      <section>
        <h1>Stock de Imprenta</h1>
        <p className="subtitle">
          Demo inicial para consultar papeles e insumos con filtros rápidos y eventos recientes.
        </p>

        <FiltersBar
          search={filters.search}
          onSearchChange={(value) => updateFilter('search', value)}
          medida={filters.medida}
          textura={filters.textura}
          gramaje={filters.gramaje}
          onMedidaChange={(value) => updateFilter('medida', value)}
          onTexturaChange={(value) => updateFilter('textura', value)}
          onGramajeChange={(value) => updateFilter('gramaje', value)}
          sortBy={filters.sortBy}
          onSortChange={(value) => updateFilter('sortBy', value)}
          onClear={clearFilters}
          medidas={measures}
          texturas={textures}
          gramajes={weights}
        />

        <section className="products-header">
          <h2>Productos ({filteredProducts.length})</h2>
        </section>

        <section className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {filteredProducts.length === 0 && (
            <p className="empty-state">No hay productos para los filtros seleccionados.</p>
          )}
        </section>
      </section>

      <EventsPanel events={recentEvents} />
    </main>
  );
}

export default App;
