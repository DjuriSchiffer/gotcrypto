import bitcoin from "../public/images/bitcoin.png";
import litecoin from "../public/images/litecoin.png";
import ethereum from "../public/images/ethereum.png";
import tether from "../public/images/tether.png";
import xrp from "../public/images/xrp.png";
import bnb from "../public/images/bnb.png";
import hex from "../public/images/hex.png";
import gold from "../public/images/bitcoin.png";
import silver from "../public/images/bitcoin.png";

export const getImage = (id) => {
  return images[id];
};

const images = {
  1: bitcoin, //bitcoin
  2: litecoin, //litecoin
  3575: gold, // gold
  3574: silver, // silver
  1839: tether, // tether
  825: bnb, // bnb
  52: xrp, // xrp
  1027: ethereum, // eth
  5015: hex, // hex
};
