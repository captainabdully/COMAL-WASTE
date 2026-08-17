export const formatQuantity = (value) => {
  const quantity = Number(value);
  return Number.isFinite(quantity) ? quantity.toString() : String(value);
};
