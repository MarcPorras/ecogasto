import { Tarifa } from '../model/tarifa';

export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

export const MESES_LARGO = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Setiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const ICONOS: Record<string, string> = {
  Agua: '💧',
  Luz: '⚡',
  Gas: '🔥',
  Transporte: '🚌',
};

export const ANIO_MINIMO = 2024;

export type NivelConsumo = 'bajo' | 'moderado' | 'alto' | 'neutro';

export function icono(recurso: string | undefined): string {
  return (recurso && ICONOS[recurso]) || '📊';
}

export function nivelDe(valor: number, tarifa: Tarifa | undefined): NivelConsumo {
  if (!tarifa) {
    return 'neutro';
  }
  if (valor < tarifa.umbralBajo) {
    return 'bajo';
  }
  if (valor < tarifa.umbralAlto) {
    return 'moderado';
  }
  return 'alto';
}

export function etiquetaNivel(nivel: NivelConsumo): string {
  const etiquetas: Record<NivelConsumo, string> = {
    bajo: 'Bajo',
    moderado: 'Moderado',
    alto: 'Alto',
    neutro: 'Sin referencia',
  };
  return etiquetas[nivel];
}

export function costoEstimado(valor: number, recurso: string, personas: number, tarifa: Tarifa | undefined): number | null {
  if (!tarifa || !(valor > 0)) {
    return null;
  }
  const bruto = recurso === 'Agua' ? valor * personas * 30 * tarifa.tarifa : valor * tarifa.tarifa;
  return Math.round(bruto * 100) / 100;
}

export function periodoActual(): { anio: number; mes: number } {
  const hoy = new Date();
  return { anio: hoy.getFullYear(), mes: hoy.getMonth() + 1 };
}

export function aniosDisponibles(): number[] {
  const actual = new Date().getFullYear();
  const lista: number[] = [];
  for (let anio = actual; anio >= ANIO_MINIMO; anio--) {
    lista.push(anio);
  }
  return lista;
}

export function claveMes(anio: number, mes: number): string {
  return anio + '-' + String(mes).padStart(2, '0');
}

export function etiquetaMes(anio: number, mes: number): string {
  return MESES_LARGO[mes - 1] + ' ' + anio;
}
