// Format price in Indian numbering system with commas
export const formatIndianPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN').format(price);
};

// Convert price to Indian words (Lacs/Crores/Thousands)
export const priceToWords = (price: number): string => {
  if (price >= 10000000) {
    // Crores
    const crores = Math.floor(price / 10000000);
    const remaining = price % 10000000;
    const lacs = Math.floor(remaining / 100000);

    if (lacs > 0) {
      return `${crores} Crore${crores > 1 ? 's' : ''} ${lacs} Lac${lacs > 1 ? 's' : ''}`;
    }
    return `${crores} Crore${crores > 1 ? 's' : ''}`;
  } else if (price >= 100000) {
    // Lacs
    const lacs = Math.floor(price / 100000);
    const remaining = price % 100000;
    const thousands = Math.floor(remaining / 1000);

    if (thousands > 0) {
      return `${lacs} Lac${lacs > 1 ? 's' : ''} ${thousands} Thousand`;
    }
    return `${lacs} Lac${lacs > 1 ? 's' : ''}`;
  } else if (price >= 1000) {
    // Thousands
    const thousands = Math.floor(price / 1000);
    return `${thousands} Thousand`;
  } else {
    return `${price}`;
  }
};

// Combined format: ₹25,00,000 (25 Lacs)
export const formatPriceWithWords = (price: number): { formatted: string; words: string } => {
  return {
    formatted: `₹${formatIndianPrice(price)}`,
    words: priceToWords(price),
  };
};
