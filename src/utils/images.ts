export const getImage = (id: number, format: number = 32) => {
  return `https://s2.coinmarketcap.com/static/img/coins/${format}x${format}/${id}.png`;
};
