export const STOCK_THRESHOLDS = {
  criticalMax: 500,
  lowMax: 1500,
};

export const getStockLevel = (existencia) => {
  const stock = Number(existencia) || 0;

  if (stock <= STOCK_THRESHOLDS.criticalMax) {
    return {
      key: 'critical',
      label: 'Crítico',
      className: 'stock-critical',
    };
  }

  if (stock <= STOCK_THRESHOLDS.lowMax) {
    return {
      key: 'low',
      label: 'Bajo',
      className: 'stock-low',
    };
  }

  return {
    key: 'normal',
    label: 'Normal',
    className: 'stock-normal',
  };
};
