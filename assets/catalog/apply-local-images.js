// Generated image paths only. Product identities and palette remain in the registry.
for (const model of window.RAWAQ_CATALOG.models) {
  const images = (window.RAWAQ_LOCAL_IMAGES || {})[model.id];
  if (!images) continue;
  for (const [number, angles] of Object.entries(images)) {
    const n = Number(number);
    if (!Number.isInteger(n) || n < 1 || n > cat666Colors.length) continue;
    let variant = model.variants.find(v => v.colorNumber === n);
    if (!variant) {
      const [colorName, swatch] = cat666Colors[n - 1];
      variant = {colorNumber:n, colorName, swatch, sku:'', size:model.size,
        fabricType:model.fabricType, fabricCatalog:model.fabricCatalog,
        frontImage:null, sideImage:null};
      model.variants.push(variant);
    }
    for (const key of ['frontImage','sideImage']) {
      if (typeof angles[key] === 'string' && angles[key].startsWith('assets/variants/local_recolor/') && !angles[key].includes('..')) variant[key] = angles[key];
    }
    variant.status = 'معالجة ألوان محلية؛ مطابقة المورد مطلوبة';
  }
  model.variants.sort((a,b) => a.colorNumber-b.colorNumber);
  model.mainImage = model.variants.find(v=>v.frontImage)?.frontImage || model.mainImage;
}
