const fs = require('node:fs');
const path = require('node:path');

const frontendDir = path.resolve(__dirname, '..');
const categoryRoot = path.join(frontendDir, 'assets', 'category');
const outputFile = path.join(frontendDir, 'products.js');

function spaceFitProportionFor(title, category) {
  const text = `${title} ${category}`.toLowerCase();
  if (/sectional|sofa|dining set|oversized|grand|large dining|king-size/.test(text)) return 'Spacious Living';
  if (/nightstand|bedside|side table|desk|lighting|lamp|compact chair/.test(text)) return 'Compact / Studio Fit';
  if (/\brugs?\b/.test(text)) return 'Spacious Living';
  return 'Standard Bedroom';
}

// Keep the product information already supplied by the original prototype.
const curatedProducts = [
  { id: 'luna-bed', title: 'Luna Bed Frame', fullTitle: 'Luna Upholstered Queen Bed', category: 'Beds', price: 450000, priceFormatted: '₦450,000', condition: 'Handcrafted Oak', location: 'Lagos', availability: 'In stock', description: 'Natural solid oak with curved headboard and oatmeal bouclé upholstery.', specs: 'Solid wood frame, 200 × 160 × 90 cm, Modern, Easy assembly', image: 'assets/featured%20product/lunabedframe.jpg' },
  { id: 'cloudrest-mattress', title: 'Comfort Cloud Mattress', fullTitle: 'Comfort Cloud Orthopedic Mattress', category: 'Mattresses', price: 180000, priceFormatted: '₦180,000', condition: 'Verified Seller', location: 'Abuja', availability: 'In stock', description: 'Orthopedic dual-layer high density foam with breathable cooling gel.', specs: 'Memory foam & pocket spring, 180 × 200 × 28 cm, Zero motion transfer', image: 'assets/featured%20product/cloud%20bedding.jpg' },
  { id: 'kanso-wardrobe', title: 'Aspen Solid Wardrobe', fullTitle: 'Aspen Solid Minimalist Wardrobe', category: 'Wardrobes', price: 320000, priceFormatted: '₦320,000', condition: '3-Door Minimal', location: 'Ibadan', availability: 'In stock', description: 'Ash wood finish with integrated hangers and soft-close German hinges.', specs: 'Blonde ash wood, 150 × 210 × 60 cm, Modular shelving', image: 'assets/featured%20product/solid%20wardrobe.jpg' },
  { id: 'nordic-desk', title: 'Novo Work Desk', fullTitle: 'Novo Ergonomic Oak Work Desk', category: 'Desks', price: 150000, priceFormatted: '₦150,000', condition: 'Popular Compact', location: 'Lagos', availability: 'In stock', description: 'Slender tapered legs with cable routing for clean, mindful workspaces.', specs: 'Sustainably sourced white oak, 120 × 60 × 75 cm, Beveled perimeter', image: 'assets/featured%20product/novo%20workdesk.jpg' },
  { id: 'kyoto-bed', title: 'Kyoto Solid Ash Bed Frame', fullTitle: 'Kyoto Solid Ash Low Platform Bed', category: 'Beds', price: 520000, priceFormatted: '₦520,000', condition: 'Brand new', location: 'Lagos', availability: 'Low stock (2 Left)', description: 'Low-profile Japanese solid ash bed frame with mortise and tenon joinery.', specs: 'Solid Japanese Ash, 215 × 195 × 85 cm, Japandi Minimalist', image: 'assets/carousell/Serene%20living%20room%20with%20sectional%20sofa%20and%20abstract%20art%20coffee%20table%20floor%20lamp.jpg' },
  { id: 'arlo-nightstand', title: 'Arlo Floating Walnut Nightstand', fullTitle: 'Arlo Floating Walnut Bedside Drawer', category: 'Nightstands', price: 65000, priceFormatted: '₦65,000', condition: 'Like new', location: 'Lagos', availability: 'In stock', description: 'Cantilevered floating American walnut nightstand with cable dock channel.', specs: 'American walnut & brass cleat, 45 × 32 × 25 cm, Wall mounted', image: 'assets/shop%20by%20category/nightstand.jpg' },
  { id: 'sahara-rug', title: 'Sahara Handwoven Wool Rug', fullTitle: 'Sahara Handwoven Berber Wool Rug', category: 'Rugs', price: 140000, priceFormatted: '₦140,000', condition: 'Brand new', location: 'Abuja', availability: 'In stock', description: 'Handwoven 100% natural mountain wool area rug with subtle Berber motifs.', specs: '100% Unbleached Mountain Wool, 240 × 300 cm, Non-shedding pile', image: 'assets/shop%20by%20category/rugs.jpg' },
  { id: 'vesper-lamp', title: 'Vesper Brass Floor Lamp', fullTitle: 'Vesper Brass Floor Standing Lamp', category: 'Lighting', price: 82000, priceFormatted: '₦82,000', condition: 'Brand new', location: 'Lagos', availability: 'In stock', description: 'Architectural floor lamp crafted from brushed solid brass with travertine base.', specs: 'Brushed brass & travertine stone, 145 × 28 × 28 cm, 2700K warm LED', image: 'assets/carousell/Scandinavian-style%20home%20office%20with%20a%20minimalist%20desk,%20ergonomic%20chair,%20and%20built-in%20shelves.jpg' }
].map((product) => ({ ...product, spaceFitProportion: spaceFitProportionFor(product.title, product.category), fallbackImage: product.image, placeholder: false }));

const categoryLabels = { architecturallighting: 'Architectural Lighting', desk: 'Desks', nightstand: 'Nightstands', rugs: 'Rugs', wardrobe: 'Wardrobes' };
const categoryImageFallbacks = {
  beds: 'assets/shop%20by%20category/bed%20frame.jpg', mattresses: 'assets/shop%20by%20category/mattress.jpg',
  rugs: 'assets/shop%20by%20category/rugs.jpg', desks: 'assets/shop%20by%20category/desk.jpg',
  nightstands: 'assets/shop%20by%20category/nightstand.jpg', wardrobes: 'assets/shop%20by%20category/wardrobe.jpg',
  lighting: 'assets/carousell/Scandinavian-style%20home%20office%20with%20a%20minimalist%20desk,%20ergonomic%20chair,%20and%20built-in%20shelves.jpg'
};
// generated, please review: these category prices use the existing priced product in each category.
// Architectural Lighting has no existing exact-category listing, so it uses the existing Lighting listing as its closest match.
const generatedCategoryDetails = {
  architecturallighting: { price: 82000, description: 'Clean-lined architectural lighting with a considered profile for everyday spaces.' },
  desk: { price: 150000, description: 'A streamlined desk profile with practical details for everyday workspaces.' },
  nightstand: { price: 65000, description: 'A compact bedside profile with practical details for everyday use.' },
  rugs: { price: 140000, description: 'A versatile rug design with a considered finish for everyday spaces.' },
  wardrobe: { price: 320000, description: 'A streamlined wardrobe profile with practical storage for bedroom spaces.' }
};
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const toAssetUrl = (relativePath) => relativePath.split(path.sep).map(encodeURIComponent).join('/');
const titleFromFile = (filename) => path.basename(filename, path.extname(filename)).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (letter) => letter.toUpperCase());
const categoryName = (folder) => categoryLabels[folder.toLowerCase()] || titleFromFile(folder);

const folders = fs.existsSync(categoryRoot)
  ? fs.readdirSync(categoryRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))
  : [];
const generatedProducts = [];
const generatedCategories = [];

for (const folder of folders) {
  const folderPath = path.join(categoryRoot, folder.name);
  const allFiles = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (imageExtensions.has(path.extname(entry.name).toLowerCase())) allFiles.push(fullPath);
    }
  };
  walk(folderPath);
  const category = categoryName(folder.name);
  const cover = allFiles.find((file) => path.basename(file, path.extname(file)).toLowerCase() === 'cover') || allFiles[0];
  generatedCategories.push({ id: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: category, image: cover ? toAssetUrl(path.relative(frontendDir, cover)) : null, empty: allFiles.length === 0 });
  for (const file of allFiles) {
    const relative = path.relative(frontendDir, file);
    const basename = path.basename(file);
    const title = titleFromFile(basename);
    const generatedDetails = generatedCategoryDetails[folder.name.toLowerCase()];
    generatedProducts.push({
      id: `${folder.name}-${path.basename(file, path.extname(file))}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      fullTitle: title,
      category,
      spaceFitProportion: spaceFitProportionFor(title, category),
      price: generatedDetails ? generatedDetails.price : null,
      priceFormatted: generatedDetails ? `₦${generatedDetails.price.toLocaleString('en-NG')}` : 'Price: TODO',
      condition: 'TODO',
      location: 'TODO',
      availability: 'In stock',
      description: generatedDetails ? generatedDetails.description : 'TODO: add product description',
      specs: 'TODO: add product specifications',
      image: toAssetUrl(relative),
      fallbackImage: toAssetUrl(relative),
      placeholder: true,
      generatedReview: !!generatedDetails
    });
  }
}

const products = [...curatedProducts, ...generatedProducts];
const categoriesByName = new Map();
for (const category of generatedCategories) categoriesByName.set(category.name.toLowerCase(), category);
for (const product of curatedProducts) {
  const key = product.category.toLowerCase();
  if (!categoriesByName.has(key)) categoriesByName.set(key, {
    id: key.replace(/[^a-z0-9]+/g, '-'), name: product.category,
    image: categoryImageFallbacks[key] || product.image, empty: false
  });
}
for (const category of categoriesByName.values()) {
  category.count = products.filter((product) => product.category.toLowerCase() === category.name.toLowerCase()).length;
}

const productEntries = products.map(({ generatedReview, ...product }) => {
  const json = JSON.stringify(product, null, 2).split('\n').map((line) => `  ${line}`).join('\n');
  return `${generatedReview ? '  // generated, please review\n' : ''}${json}`;
});
const output = `// Generated by scripts/generate-products.js. Edit existing product data in that script; TODO fields mark missing metadata.\nwindow.SPACEFIT_PRODUCTS = [\n${productEntries.join(',\n')}\n];\nwindow.SPACEFIT_CATEGORIES = ${JSON.stringify([...categoriesByName.values()], null, 2)};\n`;
fs.writeFileSync(outputFile, output, 'utf8');
console.log(`Generated ${products.length} products across ${categoriesByName.size} categories at ${path.relative(process.cwd(), outputFile)}.`);
