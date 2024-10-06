export const getColour = (id: number) => {
  return colours[id];
};

const colours: Record<number, string> = {
  1: 'rgb(247, 147, 26)', //bitcoin
  2: 'rgb(52,93,157)', //litecoin
  3575: 'rgb(255,215,0)', // gold
  3574: 'rgb(192,192,192)', // silver
  1839: 'rgb(241,191,32)', // tether
  825: 'rgb(0,147,147)', // bnb
  52: 'rgb(35,41,47)', // xrp
  1027: 'rgb(21,21,21)', // eth
  5015: 'rgb(255,23,167)', // hex
  2010: 'rgb(1, 51, 174)', // cardano
  6636: 'rgb(230, 0, 122)', // dot
  5426: 'rgb(25, 250, 155)', // sol
  3077: 'rgb(36, 0, 137)', // vet
  74: 'rgb(186, 159, 51)', // doge
};
