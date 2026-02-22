const path = require('path');
const d = require(path.join(__dirname, '..', 'public', 'data', 'heureka-products.json'));

// Check for semicolons in data (would break CSV)
const withSemicolon = d.products.filter(p =>
    p.name.includes(';') ||
    (p.specs?.cpu || '').includes(';') ||
    (p.specs?.gpu || '').includes(';') ||
    (p.specs?.ram || '').includes(';')
);
console.log('Products with semicolons in data:', withSemicolon.length);
if (withSemicolon.length) {
    withSemicolon.slice(0, 3).forEach(p => console.log('  -', p.name));
}

// Check for missing images
const noImg = d.products.filter(p => !p.img);
console.log('No image:', noImg.length);

// Check for duplicate images
const imgCount = {};
d.products.forEach(p => { imgCount[p.img] = (imgCount[p.img] || 0) + 1; });
const dupes = Object.entries(imgCount).filter(([k, v]) => v > 1);
console.log('Duplicate images:', dupes.length, 'groups');
dupes.forEach(([img, count]) => {
    const names = d.products.filter(p => p.img === img).map(p => p.name).slice(0, 3);
    console.log('  [' + count + 'x]', names.join(' | '));
});

// Check price ranges
const prices = d.products.filter(p => p.price > 0).map(p => p.price);
console.log('Price range:', Math.min(...prices), '-', Math.max(...prices));
console.log('Products with price > 50:', prices.filter(p => p > 50).length);

// Simulate what loadFromCache does
const viable = d.products.filter(p => p.price && p.price > 50 && p.img);
console.log('Viable products (price>50 + has image):', viable.length);

// Check category distribution of smartSelect (top 30)
const byCategory = {};
viable.forEach(p => {
    const cat = p.category?.slug || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
});

const priorityCats = ['pc', 'gpu', 'notebook', 'cpu', 'phone', 'headset', 'monitor', 'case', 'psu', 'mobo', 'cooler', 'ram', 'storage', 'peripheral'];
const targetRatios = { pc: 0.35, gpu: 0.12, notebook: 0.1, cpu: 0.08, phone: 0.08, headset: 0.06, monitor: 0.04 };
const count = 30;
const selected = [];
for (const cat of priorityCats) {
    const target = Math.max(1, Math.ceil(count * (targetRatios[cat] || 0.02)));
    const pool = byCategory[cat] || [];
    if (!pool.length) continue;
    pool.sort((a, b) => (b.price || 0) - (a.price || 0));
    const step = Math.max(1, Math.floor(pool.length / target));
    for (let i = 0; i < Math.min(target, pool.length); i++) {
        const idx = Math.min(i * step, pool.length - 1);
        if (!selected.find(s => s.id === pool[idx].id)) {
            selected.push({ ...pool[idx], _selectedCat: cat });
        }
        if (selected.length >= count) break;
    }
    if (selected.length >= count) break;
}
console.log('\nSelected products (' + selected.length + '):');
selected.forEach((p, i) => {
    console.log(i + 1 + '.', p._selectedCat, '|', p.name.substring(0, 50), '|', p.priceFormatted, '| img:', p.img ? 'YES' : 'NO');
});

// Check if any have same image 
const selImgs = selected.map(p => p.img);
const selUniq = new Set(selImgs);
console.log('\nSelected unique images:', selUniq.size, '/', selected.length);
