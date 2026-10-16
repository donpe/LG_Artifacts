/**
 * Evidencias (entregas) de un proyecto.
 * Fase 4 · fix/evidencia-de-otra-etapa: antes, si una etapa no tenía entregas, las pantallas mostraban
 * la primera evidencia del proyecto (de otra etapa) o un archivo inventado.
 */

/** Entregas de una etapa, de la más reciente a la más antigua. */
export function getStageEvidences(evidences = [], stageId) {
  return evidences
    .filter(e => e.stageId === stageId)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

/** Última entrega de una etapa, o null si la etapa aún no tiene entregas. */
export function getLatestEvidence(evidences = [], stageId) {
  return getStageEvidences(evidences, stageId)[0] || null;
}
