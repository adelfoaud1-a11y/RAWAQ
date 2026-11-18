import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dataSource = fs.readFileSync(path.join(root, 'assets/catalog/catalog-products.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(dataSource, sandbox, { filename: 'catalog-products.js' });
const catalog = sandbox.window.RAWAQ_CATALOG;
assert.equal(catalog.models.length, 3, 'three project design references should be listed');
const rose = catalog.models.find(model => model.id === 'R009');
assert.ok(rose, 'R009 should exist');
assert.equal(rose.variants.length, 40, 'Cat 666 should contain 40 numbered swatches');
assert.equal(rose.variants[0].sku, '44020200001');
assert.equal(rose.variants[39].sku, '44020200040');
assert.equal(new Set(rose.variants.map(variant => variant.sku)).size, 40, 'SKU values must be unique');
for (const variant of rose.variants) {
  assert.equal(variant.size, '90×190 سم');
  assert.equal(variant.fabricType, 'مخمل');
  if (variant.frontImage) assert.ok(fs.existsSync(path.join(root, variant.frontImage)), `missing image ${variant.frontImage}`);
  assert.equal(variant.sideImage, null, 'unavailable side views must remain pending');
}
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
assert.equal(inline.length, 1, 'the catalog should have one inline interaction controller');
new Function(inline[0]);
for (const id of ['catalogSearch','searchResults','nextColor','previousColor','swatches','angleTabs','exportCsv','imageModal']) {
  assert.ok(html.includes(`id="${id}"`), `missing interaction element ${id}`);
}
for (const required of ['dir="rtl"','color-scheme:dark','aspect-ratio:4/5','@media(max-width:700px)','variantForQuery','photoStatus','بانتظار الصورة','44020200000+colorNumber']) {
  assert.ok(html.includes(required) || dataSource.includes(required), `missing behavior or responsive style ${required}`);
}
const photoCount = rose.variants.filter(variant => variant.frontImage).length;
console.log(JSON.stringify({status:'PASS',designReferences:catalog.models.length,swatches:rose.variants.length,uniqueSkus:40,availableMainPhotos:photoCount,sidePhotos:0,searchAndInteractionScript:'syntax OK',mobileAndDesktopRules:'present'}, null, 2));
