/**
 * Calculador de Progreso Academico y Nivel de Riesgo
 * Regla de negocio mandatoria: Progreso = (approvedStages / 6) * 100
 */

export function calculateProgress(stages = []) {
  const approvedCount = stages.filter(s => s.status === 'aprobado').length;
  const totalStages = 6;
  const percentage = Math.round((approvedCount / totalStages) * 100);

  return {
    approvedCount,
    totalStages,
    percentage,
    formatted: `${percentage}% (${approvedCount}/6 etapas)`
  };
}

/**
 * Semáforo de riesgo académico con su motivo (Fase 1 · feat/calcular-riesgo-automaticamente).
 * Orden de prioridad:
 *   1. Alto       → hay compromisos pendientes con fecha límite vencida.
 *   2. Medio      → la etapa activa tiene cambios solicitados (observado).
 *   3. Completado → las 6 etapas están aprobadas.
 *   4. Bajo       → avance normal.
 * `today` se puede inyectar para pruebas (formato AAAA-MM-DD).
 */
export function describeRisk(project = {}, today = new Date().toISOString().split('T')[0]) {
  const stages = project.stages || [];
  const commitments = project.commitments || [];

  const overdue = commitments.filter(c => c.status === 'pendiente' && c.dueDate < today);
  if (overdue.length > 0) {
    return {
      level: 'Alto',
      reason: overdue.length === 1
        ? `Compromiso vencido desde ${overdue[0].dueDate}: ${overdue[0].description}`
        : `${overdue.length} compromisos vencidos.`
    };
  }

  if (stages.some(s => s.status === 'observado')) {
    return { level: 'Medio', reason: 'El tutor solicitó cambios y hay correcciones pendientes.' };
  }

  if (stages.length > 0 && stages.every(s => s.status === 'aprobado')) {
    return { level: 'Completado', reason: 'Las 6 etapas están aprobadas.' };
  }

  return { level: 'Bajo', reason: 'Avance sin alertas.' };
}

export function calculateRiskLevel(project = {}, today) {
  return describeRisk(project, today).level;
}

/**
 * Etapa "actual" de un proyecto: la que está en revisión u observada; si todas están aprobadas,
 * la última aprobada; si ninguna ha empezado, la primera.
 * Antes, un proyecto completo se mostraba como "Etapa 1" (Fase 1, ver docs/CAMBIOS.md).
 */
export function getCurrentStage(stages = []) {
  return stages.find(s => s.status === 'en_revision' || s.status === 'observado')
    || [...stages].reverse().find(s => s.status === 'aprobado')
    || stages[0];
}
