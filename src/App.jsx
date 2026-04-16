import { useEffect, useMemo, useState } from 'react';
import FiltersBar from './components/FiltersBar';
import ProductCard from './components/ProductCard';
import EventsPanel from './components/EventsPanel';
import { fallbackProducts } from './data/products';
import { fallbackEvents } from './data/events';

const initialFilters = {
  search: '',
  medida: '',
  textura: '',
  gramaje: '',
  sortBy: 'descripcion',
};

function App() {
  const [filters, setFilters] = useState(initialFilters);
  const [products, setProducts] = useState(fallbackProducts);
  const [events, setEvents] = useState(fallbackEvents);
  const [isLoading, setIsLoading] = useState(true);
  const [dataMessage, setDataMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const [stockResult, eventsResult] = await Promise.allSettled([
        fetch('/stock.json').then((response) => {
          if (!response.ok) throw new Error('stock.json no encontrado');
          return response.json();
        }),
        fetch('/events.json').then((response) => {
          if (!response.ok) throw new Error('events.json no encontrado');
          return response.json();
        }),
      ]);

      let usedFallback = false;

      if (stockResult.status === 'fulfilled' && Array.isArray(stockResult.value)) {
        setProducts(stockResult.value);
      } else {
        usedFallback = true;
        console.warn('No se pudo cargar /stock.json, se usa fallback local.');
      }

      if (eventsResult.status === 'fulfilled' && Array.isArray(eventsResult.value)) {
        setEvents(eventsResult.value);
      } else {
        usedFallback = true;
        console.warn('No se pudo cargar /events.json, se usa fallback local.');
      }

      setDataMessage(
        usedFallback
          ? 'Mostrando datos de respaldo. Ejecuta el script de generación para publicar stock y eventos actualizados.'
          : '',
      );
      setIsLoading(false);
    };

    loadData();
  }, []);

  const measures = useMemo(
    () => [...new Set(products.map((product) => product.medida).filter(Boolean))].sort(),
    [products],
  );
  const textures = useMemo(
    () => [...new Set(products.map((product) => product.textura).filter(Boolean))].sort(),
    [products],
  );
  const weights = useMemo(
    () => [...new Set(products.map((product) => product.gramaje).filter(Boolean))].sort((a, b) => a - b),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    const list = products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        String(product.codigo).toLowerCase().includes(normalizedSearch) ||
        String(product.descripcion).toLowerCase().includes(normalizedSearch);
      const matchesMeasure = !filters.medida || product.medida === filters.medida;
      const matchesTexture = !filters.textura || product.textura === filters.textura;
      const matchesWeight = !filters.gramaje || String(product.gramaje) === filters.gramaje;

      return matchesSearch && matchesMeasure && matchesTexture && matchesWeight;
    });

    return list.sort((a, b) => {
      switch (filters.sortBy) {
        case 'existencia_desc':
          return Number(b.existencia) - Number(a.existencia);
        case 'precio_asc':
          return Number(a.precio) - Number(b.precio);
        case 'descripcion':
        default:
          return String(a.descripcion).localeCompare(String(b.descripcion));
      }
    });
  }, [filters, products]);

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
          Consulta stock y eventos desde JSON generados de forma privada fuera del navegador.
        </p>
        {dataMessage && <p className="empty-state">{dataMessage}</p>}

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
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id ?? `${product.codigo}-${index}`} product={product} />
          ))}
          {!isLoading && filteredProducts.length === 0 && (
            <p className="empty-state">No hay productos para los filtros seleccionados.</p>
          )}
        </section>
      </section>

      <EventsPanel events={events} />
    </main>
  );
}

export default App;
