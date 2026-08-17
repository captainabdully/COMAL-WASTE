export const formatQuantity = (value: string | number) => {
  const quantity = Number(value);
  return Number.isFinite(quantity) ? quantity.toString() : String(value);
};
