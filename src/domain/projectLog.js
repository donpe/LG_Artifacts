/**
 * Bitácora y compromisos de los proyectos (Fase 4).
 */

/** Nombre corto de una etapa, sin "(Gate 0)": "Propuesta / Protocolo". */
export const stageShortName = (stage) => stage.name.replace(/\s*\(.*\)\s*$/, '').trim();

/**
 * Registros de la bitácora que corresponden a una etapa.
 * Los registros nuevos guardan stageId; los de los datos semilla se reconocen por el nombre de la etapa
 * en la acción (por ejemplo, "Observación Registrada: Metodología").
 */
export function getStageLog(project, stage) {
  const name = stageShortName(stage);
  return (project.decisionLog || []).filter(log =>
    log.stageId === stage.id || (log.stageId === undefined && log.action.includes(name))
  );
}

/**
 * Compromisos pendientes de varios proyectos, ordenados por fecha límite, con su estado:
 * 'vencido' si la fecha ya pasó, 'proximo' si vence en 7 días o menos, 'a_tiempo' en otro caso.
 */
export function listPendingCommitments(projects = [], today = new Date().toISOString().split('T')[0]) {
  const inAWeek = new Date(new Date(today).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return projects
    .flatMap(p => (p.commitments || [])
      .filter(c => c.status === 'pendiente')
      .map(c => ({
        ...c,
        project: p,
        timing: c.dueDate < today ? 'vencido' : c.dueDate <= inAWeek ? 'proximo' : 'a_tiempo'
      })))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
