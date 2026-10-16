/**
 * Glosario de la plataforma (Fase 3 · feat/glosario-y-ayudas-de-terminos).
 * Definiciones cortas en lenguaje simple. Se usan en las ayudas emergentes (<Term>),
 * en las pastillas de estado (StatusBadge) y en el panel "Ayuda contextual".
 */
export const GLOSSARY = {
  etapa: {
    term: 'Etapa',
    definition: 'Cada una de las 6 partes del trabajo de grado: Propuesta, Marco Teórico, Metodología, Recolección, Análisis y Documento Final. Se aprueban en orden.'
  },
  gate0: {
    term: 'Gate 0',
    definition: 'Lista de 14 criterios de calidad que el tutor verifica en la propuesta (etapa 1). Cumplirlos habilita la aprobación, pero el tutor siempre decide.'
  },
  fase0: {
    term: 'Fase 0',
    definition: 'Guía de 17 actividades para preparar la propuesta antes de entregarla: pregunta, objetivos, alcance, metodología, etc.'
  },
  evidencia: {
    term: 'Evidencia',
    definition: 'Documento que el estudiante entrega en una etapa. Cada nueva entrega crea una versión (v1.0, v1.1…) y las anteriores se conservan.'
  },
  bitacora: {
    term: 'Bitácora',
    definition: 'Historial de todo lo que pasa en el proyecto: entregas, observaciones y aprobaciones, con autor y fecha. No se borra.'
  },
  compromiso: {
    term: 'Compromiso',
    definition: 'Tarea acordada con fecha límite (por ejemplo, "ajustar la muestra antes del 20/10"). Si vence sin cumplirse, el proyecto pasa a riesgo alto.'
  },
  riesgo: {
    term: 'Riesgo',
    definition: 'Semáforo automático: Alto si hay compromisos vencidos, Medio si el tutor pidió cambios, Bajo si avanza sin alertas y Completado si las 6 etapas están aprobadas.'
  },
  pendiente: {
    term: 'Pendiente',
    definition: 'La etapa aún no empieza: se habilita cuando se aprueba la anterior.'
  },
  en_revision: {
    term: 'En revisión',
    definition: 'El estudiante ya entregó y el tutor debe revisar la evidencia.'
  },
  observado: {
    term: 'Cambios solicitados',
    definition: 'El tutor revisó y pidió ajustes. El estudiante debe corregir y entregar una nueva versión.'
  },
  aprobado: {
    term: 'Aprobado',
    definition: 'El tutor aprobó la etapa. El avance del proyecto sube 1 de 6.'
  }
};
