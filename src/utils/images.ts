import gold from '../public/images/gold.png';
import logo from '../public/images/logo.svg';
import silver from '../public/images/silver.png';

export const getImage = (id?: number, format = 32) => {
  if (!id) return logo

  if (id === 3575) {
    return gold
  }
  if (id === 3574) {
    return silver
  }

  return `https://s2.coinmarketcap.com/static/img/coins/${format}x${format}/${id}.png`;
};
