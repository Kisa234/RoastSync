import { Distrito, Provincia } from '../models/ubigeo';

/**
 * Helpers de ubigeo reutilizables entre formularios (lote, muestra).
 *
 * El ubigeo es jerárquico por prefijo:
 *   departamento "06"  →  provincia "0608"  →  distrito "060801"
 * así que un distrito pertenece a la provincia cuyo código es prefijo del suyo.
 */

const norm = (s: string) => s.trim().toUpperCase();

/** Distritos que pertenecen a una provincia (por nombre). Sin provincia → todos. */
export function filtrarDistritosPorProvincia(
  distritos: Distrito[],
  provincias: Provincia[],
  provinciaNombre?: string | null,
): Distrito[] {
  if (!provinciaNombre) return distritos;
  const prov = provincias.find(p => norm(p.nombre) === norm(provinciaNombre));
  if (!prov) return distritos;
  return distritos.filter(d => d.codigo.startsWith(prov.codigo));
}

/**
 * Deduce la provincia a partir de uno o varios distritos (acepta "A, B" o ["A","B"]).
 * Devuelve undefined si no se puede deducir con certeza:
 *  - algún distrito no existe en la lista o su nombre se repite en 2+ provincias
 *  - los distritos pertenecen a provincias distintas
 */
export function inferirProvincia(
  distritoValor: string | string[] | null | undefined,
  distritos: Distrito[],
  provincias: Provincia[],
): Provincia | undefined {
  const nombres = (Array.isArray(distritoValor) ? distritoValor : (distritoValor ?? '').split(','))
    .map(n => n.trim())
    .filter(Boolean);
  if (nombres.length === 0) return undefined;

  let encontrada: Provincia | undefined;
  for (const nombre of nombres) {
    const matches = distritos.filter(d => norm(d.nombre) === norm(nombre));
    if (matches.length !== 1) return undefined;            // no existe o nombre ambiguo

    const prov = provincias.find(p => matches[0].codigo.startsWith(p.codigo));
    if (!prov) return undefined;
    if (encontrada && encontrada.codigo !== prov.codigo) return undefined; // provincias distintas
    encontrada = prov;
  }
  return encontrada;
}