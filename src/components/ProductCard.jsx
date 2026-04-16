const LOW_STOCK_LIMIT = 6;

const ProductCard = ({ product }) => {
  const isLowStock = product.existencia <= LOW_STOCK_LIMIT;

  return (
    <article className={`product-card ${isLowStock ? 'low-stock' : ''}`}>
      <header className="product-header">
        <span className="product-code">{product.codigo}</span>
        {isLowStock && <span className="badge">Bajo stock</span>}
      </header>

      <h3>{product.descripcion}</h3>

      <dl>
        <div>
          <dt>Existencia</dt>
          <dd>{product.existencia}</dd>
        </div>
        <div>
          <dt>Precio</dt>
          <dd>${product.precio.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Medida</dt>
          <dd>{product.medida}</dd>
        </div>
        <div>
          <dt>Textura</dt>
          <dd>{product.textura}</dd>
        </div>
        <div>
          <dt>Gramaje</dt>
          <dd>{product.gramaje} g</dd>
        </div>
      </dl>
    </article>
  );
};

export default ProductCard;
