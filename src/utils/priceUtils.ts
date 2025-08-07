export function formatPrice(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPriceString(price: string): string {
  // Remove any existing rupee symbol and spaces
  const cleanPrice = price.replace(/[₹\s]/g, '');
  
  // Try to parse as number
  const numPrice = parseFloat(cleanPrice);
  
  if (isNaN(numPrice)) {
    // If it's not a valid number, return the original price
    return price.startsWith('₹') ? price : `₹${price}`;
  }
  
  // Format as currency
  return '₹' + numPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function cleanPrice(price: string): string {
  // Remove rupee symbol and spaces, return clean number string
  return price.replace(/[₹\s]/g, '');
}