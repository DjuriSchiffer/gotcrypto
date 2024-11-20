import logo from '../public/images/logo.svg';
import gold from '../public/images/gold.svg';
import silver from '../public/images/silver.svg';

export const getImage = (id?: number, format: number = 32) => {
  if (!id) return logo

  if (id === 3575) {
    return gold
  }
  if (id === 3574) {
    return silver
  }

  return `https://s2.coinmarketcap.com/static/img/coins/${format}x${format}/${id}.png`;
};
