export const unitOptions = ['gram', 'kg', 'ml', 'litre', 'piece', 'slice', 'bottle', 'packet', 'box', 'crate', 'bag']

const families = {
  gram: 'weight', kg: 'weight', ml: 'volume', litre: 'volume',
  piece: 'piece', slice: 'slice', bottle: 'bottle',
  packet: 'package', box: 'package', crate: 'package', bag: 'package',
}

const standardFactors = { gram: 1, kg: 1000, ml: 1, litre: 1000 }

export const standardConversionFactor = (from, to) => {
  if (from === to) return 1
  if (families[from] !== families[to] || !standardFactors[from] || !standardFactors[to]) return null
  return standardFactors[from] / standardFactors[to]
}

export const compatibleUnits = (item) => {
  if (!item?.unit) return unitOptions
  return unitOptions.filter((unit) => standardConversionFactor(unit, item.unit) !== null)
}

export const conversionFactorFor = (item, entryUnit) => {
  const standard = standardConversionFactor(entryUnit, item?.unit)
  return standard
}

export const convertedQuantity = (item, quantity, entryUnit) => {
  const factor = conversionFactorFor(item, entryUnit)
  if (factor === null) return null
  return Math.round((Number(quantity || 0) * factor + Number.EPSILON) * 1000000) / 1000000
}
