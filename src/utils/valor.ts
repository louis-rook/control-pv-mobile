/**
 * Lee el monto que escribe el operador en pesos colombianos.
 *
 * Antes se usaba `parseFloat(texto.replace(/[^\d.]/g, ''))`: con el punto de
 * miles, como se escribe en Colombia, "25.000" quedaba como 25 y se registraba
 * un pago de $25. Ahora el punto y la coma son separadores de miles, salvo que
 * el último separador vaya seguido de 1 o 2 dígitos al final, que se toma como
 * decimal ("12.500,50" → 12500.5; "1500.5" → 1500.5).
 *
 * @returns el monto, o `null` si no hay un número mayor que cero
 */
export function parseValorPesos(texto: string): number | null {
  const limpio = texto.replace(/[^\d.,]/g, '')
  if (!/\d/.test(limpio)) return null
  const decimal = limpio.match(/^(.*\d)[.,](\d{1,2})$/)
  const entero = (decimal ? decimal[1] : limpio).replace(/[.,]/g, '')
  const n = Number(decimal ? `${entero}.${decimal[2]}` : entero)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** "$25.000" — formato con el que se le confirma al operador lo que se va a guardar. */
export function formatoPesos(n: number): string {
  return `$${n.toLocaleString('es-CO', { maximumFractionDigits: 2 })}`
}
