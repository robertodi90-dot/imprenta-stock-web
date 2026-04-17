import { getStockLevel } from '../utils/stockLevel';

const ProductCard = ({ product, onSelect }) => {
  const stockLevel = getStockLevel(product.existencia);

  return (
    <article
      className={`product-card ${stockLevel.className}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(product)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(product);
        }
      }}
      aria-label={`Ver detalle de ${product.descripcion}`}
    >
      <header className="product-header">
        <span className="product-code">{product.codigo}</span>
        <span className={`badge ${stockLevel.className}`}>{stockLevel.label}</span>
      </header>

      <h3>{product.descripcion}</h3>

      <dl>
        <div>
          <dt>Existencia</dt>
          <dd>{product.existencia}</dd>
        </div>
        <div>
          <dt>Precio</dt>
          <dd>${Number(product.precio || 0).toFixed(2)}</dd>
        </div>
        <div>
          <dt>Medida</dt>
          <dd>{product.medida || '-'}</dd>
        </div>
        <div>
          <dt>Textura</dt>
          <dd>{product.textura || '-'}</dd>
        </div>
        <div>
          <dt>Gramaje</dt>
          <dd>{product.gramaje ? `${product.gramaje} g` : '-'}</dd>
        </div>
      </dl>
    </article>
  );
};

export default ProductCard;
