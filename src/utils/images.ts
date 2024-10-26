import logo from '../public/images/logo.svg';

export const getImage = (id?: number, format: number = 32) => {
  if (!id) return logo

  return `https://s2.coinmarketcap.com/static/img/coins/${format}x${format}/${id}.png`;
};
