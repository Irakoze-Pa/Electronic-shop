export function categoryPhoto(subject: string) {
  const value = subject.toLowerCase();
  if (/headphone|earbud|audio|speaker|airpod/.test(value)) return "/images/products/headphones.jpg";
  if (/desktop|\bpcs?\b|imac|all[ -]in[ -]one|workstation/.test(value)) return "/images/products/desktop.jpg";
  if (/laptop|macbook|notebook|computer/.test(value)) return "/images/products/laptop.jpg";
  if (/television|\btvs?\b/.test(value)) return "/images/products/television.jpg";
  if (/gaming|console|playstation|xbox|nintendo/.test(value)) return "/images/products/gaming.jpg";
  if (/phone|iphone|smartphone/.test(value)) return "/images/products/phone.jpg";
  return "/images/products/electronics.jpg";
}

export function isCatalogPhoto(url: string) {
  return Boolean(url.trim()) && !/placehold\.(co|it)|placeholder\.com|via\.placeholder/i.test(url);
}
