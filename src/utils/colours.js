export const getColour = (id) => {
  return colours[id];
};

const colours = {
  1: "rgb(247, 147, 26)", //bitcoin
  2: "rgb(52,93,157)", //litecoin
  3575: "rgb(255,215,0)", // gold
  3574: "rgb(192,192,192)", // silver
  1839: "rgb(241,191,32)", // tether
  825: "rgb(0,147,147)", // bnb
  52: "rgb(35,41,47)", // xrp
  1027: "rgb(21,21,21)", // eth
  5015: "rgb(255,23,167)", // hex
};
