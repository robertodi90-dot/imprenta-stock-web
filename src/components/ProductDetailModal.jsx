import { useEffect } from 'react';

const ProductDetailModal = ({ product, onClose }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${product.descripcion}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h3>Detalle de producto</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar detalle">
            ✕
          </button>
        </header>

        <dl className="detail-grid">
          <div>
            <dt>Código</dt>
            <dd>{product.codigo || '-'}</dd>
          </div>
          <div>
            <dt>Descripción</dt>
            <dd>{product.descripcion || '-'}</dd>
          </div>
          <div>
            <dt>Existencia</dt>
            <dd>{product.existencia ?? '-'}</dd>
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
          {product.tipo && (
            <div>
              <dt>Tipo</dt>
              <dd>{product.tipo}</dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
};

export default ProductDetailModal;
