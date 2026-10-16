/**
 * Maquina de Estados y Reglas de Transicion para las 6 Etapas Academicas
 * Evolve, do not rebuild. Logica de dominio pura sin dependencias de React.
 */

export const STAGE_DEFINITIONS = [
  {
    id: 1,
    name: 'Propuesta / Protocolo (Gate 0)',
    description: 'Definición rigurosa del problema, 14 criterios del protocolo y viabilidad metodológica.',
    hasGate0Audit: true
  },
  {
    id: 2,
    name: 'Marco Teórico',
    description: 'Revisión sistemática de literatura y fundamentación del estado del arte.',
    hasGate0Audit: false
  },
  {
    id: 3,
    name: 'Metodología',
    description: 'Diseño muestral, instrumentos validados y protocolo de recolección.',
    hasGate0Audit: false
  },
  {
    id: 4,
    name: 'Recolección',
    description: 'Levantamiento empírico de datos primarios o corpus documental.',
    hasGate0Audit: false
  },
  {
    id: 5,
    name: 'Análisis',
    description: 'Procesamiento estadístico, cualitativo y triangulación de hallazgos.',
    hasGate0Audit: false
  },
  {
    id: 6,
    name: 'Documento Final',
    description: 'Redacción académica integral, conclusiones y verificación de originalidad.',
    hasGate0Audit: false
  }
];

export const STAGE_STATUS = {
  PENDIENTE: 'pendiente',
  EN_REVISION: 'en_revision',
  OBSERVADO: 'observado',
  APROBADO: 'aprobado'
};

/**
 * Valida si un actor tiene autorizacion y precondiciones para una transicion dada.
 */
export function canTransition({
  currentStatus,
  targetStatus,
  actorRole,
  stageNumber,
  isGate0Compliant = false,
  hasObservation = false,
  previousStageApproved = false
}) {
  // Transicion 1: Estudiante entrega evidencia de etapa activa
  if (
    currentStatus === STAGE_STATUS.PENDIENTE &&
    targetStatus === STAGE_STATUS.EN_REVISION
  ) {
    if (actorRole !== 'estudiante' && actorRole !== 'tutor') {
      return { allowed: false, reason: 'Solo el estudiante o tutor pueden cargar evidencias.' };
    }
    if (stageNumber > 1 && !previousStageApproved) {
      return { allowed: false, reason: 'No se puede habilitar una etapa si la anterior no está aprobada.' };
    }
    return { allowed: true };
  }

  // Transicion 2: Estudiante entrega correccion tras observacion
  if (
    currentStatus === STAGE_STATUS.OBSERVADO &&
    targetStatus === STAGE_STATUS.EN_REVISION
  ) {
    if (actorRole !== 'estudiante' && actorRole !== 'tutor') {
      return { allowed: false, reason: 'Solo el estudiante o tutor pueden entregar correcciones.' };
    }
    return { allowed: true };
  }

  // Transicion 3: Tutor pide cambios (observado)
  if (
    currentStatus === STAGE_STATUS.EN_REVISION &&
    targetStatus === STAGE_STATUS.OBSERVADO
  ) {
    if (actorRole !== 'tutor') {
      return { allowed: false, reason: 'Solo el tutor asignado puede emitir observaciones.' };
    }
    if (!hasObservation) {
      return { allowed: false, reason: 'Es obligatorio registrar una observación con su motivo.' };
    }
    return { allowed: true };
  }

  // Transicion 4: Tutor aprueba etapa
  if (
    (currentStatus === STAGE_STATUS.EN_REVISION || currentStatus === STAGE_STATUS.OBSERVADO) &&
    targetStatus === STAGE_STATUS.APROBADO
  ) {
    if (actorRole !== 'tutor') {
      return { allowed: false, reason: 'Solo el tutor asignado puede aprobar formalmente una etapa.' };
    }
    if (stageNumber === 1 && !isGate0Compliant) {
      return {
        allowed: false,
        reason: 'Para aprobar la Etapa 1 se deben verificar positivamente los 14 criterios de Gate 0.'
      };
    }
    if (stageNumber > 1 && !previousStageApproved) {
      return {
        allowed: false,
        reason: `La etapa ${stageNumber - 1} debe estar aprobada antes de aprobar la etapa ${stageNumber}.`
      };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Transición de estado no permitida por las reglas del flujo académico.' };
}

/**
 * Acciones disponibles sobre una etapa para el rol actual.
 * Centraliza en un solo lugar las reglas de canTransition para que la interfaz
 * (botones habilitados/deshabilitados) y los manejadores de App.jsx usen la misma fuente.
 * Fase 1 · feat/aplicar-reglas-de-transicion-de-etapas (ver docs/CAMBIOS.md).
 *
 * @returns {{ upload: {allowed:boolean, reason?:string},
 *             approve: {allowed:boolean, reason?:string},
 *             requestChanges: {allowed:boolean, reason?:string} }}
 */
export function getStageActions({ stages = [], stageId, role, isGate0Compliant = false }) {
  const stage = stages.find(s => s.id === stageId);
  if (!stage) {
    const none = { allowed: false, reason: 'Etapa no encontrada.' };
    return { upload: none, approve: none, requestChanges: none };
  }

  const previous = stages.find(s => s.id === stageId - 1);
  const previousStageApproved = stageId === 1 || previous?.status === STAGE_STATUS.APROBADO;

  // Entregar evidencia
  let upload;
  if (role !== 'estudiante') {
    upload = { allowed: false, reason: 'Solo el estudiante entrega evidencias.' };
  } else if (stage.status === STAGE_STATUS.APROBADO) {
    upload = { allowed: false, reason: 'Esta etapa ya fue aprobada por el tutor.' };
  } else if (stage.status === STAGE_STATUS.EN_REVISION) {
    // Mientras está en revisión se permite reemplazar la entrega con una nueva versión.
    upload = { allowed: true };
  } else {
    upload = canTransition({
      currentStatus: stage.status,
      targetStatus: STAGE_STATUS.EN_REVISION,
      actorRole: role,
      stageNumber: stageId,
      previousStageApproved
    });
  }

  // Aprobar etapa
  const approve = stage.status === STAGE_STATUS.PENDIENTE
    ? { allowed: false, reason: 'La etapa aún no tiene una entrega para revisar.' }
    : stage.status === STAGE_STATUS.APROBADO
      ? { allowed: false, reason: 'La etapa ya está aprobada.' }
      : canTransition({
          currentStatus: stage.status,
          targetStatus: STAGE_STATUS.APROBADO,
          actorRole: role,
          stageNumber: stageId,
          isGate0Compliant,
          previousStageApproved
        });

  // Solicitar cambios (la observación no vacía la exige el formulario)
  const requestChanges = stage.status !== STAGE_STATUS.EN_REVISION
    ? { allowed: false, reason: 'Solo se pueden solicitar cambios sobre una entrega en revisión.' }
    : canTransition({
          currentStatus: stage.status,
          targetStatus: STAGE_STATUS.OBSERVADO,
          actorRole: role,
          stageNumber: stageId,
          hasObservation: true
        });

  return { upload, approve, requestChanges };
}
