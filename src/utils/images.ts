import bitcoin from '../public/images/bitcoin.png';
import litecoin from '../public/images/litecoin.png';
import ethereum from '../public/images/ethereum.png';
import tether from '../public/images/tether.png';
import xrp from '../public/images/xrp.png';
import bnb from '../public/images/bnb.png';
import hex from '../public/images/hex.png';
import gold from '../public/images/gold.png';
import silver from '../public/images/silver.png';
import cardano from '../public/images/cardano.png';
import dot from '../public/images/polkadot.png';
import sol from '../public/images/solana.png';
import vet from '../public/images/vechain.png';
import doge from '../public/images/dogecoin.png';

export const getImage = (id: number) => {
  return images[id];
};

const images: Record<number, string> = {
  1: bitcoin, //bitcoin
  2: litecoin, //litecoin
  3575: gold, // gold
  3574: silver, // silver
  825: tether, // tether
  1839: bnb, // bnb
  52: xrp, // xrp
  1027: ethereum, // eth
  5015: hex, // hex
  2010: cardano, // cardano
  6636: dot, // dot
  5426: sol, // sol
  3077: vet, // vet
  74: doge, // doge
};