/**
 * Pasos del recorrido guiado por rol (Fase 3 · feat/recorrido-guiado-por-rol).
 * Cada paso apunta a un elemento marcado con data-tour="<target>" en la interfaz.
 * Si el elemento no está en pantalla (por ejemplo en celular), el paso se muestra sin resaltar nada.
 */
export const TOUR_STEPS = {
  estudiante: [
    {
      target: 'riel-etapas',
      title: 'Tu avance en 6 etapas',
      text: 'Aquí ves en qué etapa va tu trabajo de grado y el estado de cada una. Puedes hacer clic en una etapa para ver su detalle.'
    },
    {
      target: 'siguiente-paso',
      title: 'Lo que tienes que hacer ahora',
      text: 'Esta tarjeta siempre te dice el siguiente paso: entregar, corregir o esperar la revisión del tutor.'
    },
    {
      target: 'compromiso',
      title: 'Compromisos y observaciones',
      text: 'Las fechas acordadas con tu tutor y su última observación. Si un compromiso vence, el proyecto pasa a riesgo alto.'
    },
    {
      target: 'menu',
      title: 'Todo tu proyecto en el menú',
      text: 'Etapas (detalle de cada una), Entregas (todas tus versiones) y Bitácora (compromisos e historial). Abajo puedes cambiar el rol de la demo.'
    }
  ],
  tutor: [
    {
      target: 'bandeja',
      title: 'Tu bandeja de revisión',
      text: 'Los proyectos que tienes asignados, con su etapa y estado. Los que tienen alertas muestran su nivel de riesgo.'
    },
    {
      target: 'identidad',
      title: 'Simular otro tutor',
      text: 'En la demo puedes elegir aquí cuál de los 3 tutores del piloto eres. Cada uno ve solo sus proyectos.'
    },
    {
      target: 'pestanas',
      title: 'Revisar la entrega',
      text: 'Consulta la evidencia, los criterios de Gate 0 (en la etapa 1), las observaciones anteriores y el historial.'
    },
    {
      target: 'decision',
      title: 'Tomar la decisión',
      text: 'Aprueba la etapa o solicita cambios. Si un botón está desactivado, aquí mismo se explica por qué.'
    }
  ],
  admin: [
    {
      target: 'indicadores',
      title: 'La cohorte de un vistazo',
      text: 'Proyectos del piloto, tutores, avance promedio y proyectos completados.'
    },
    {
      target: 'atencion',
      title: 'Lo que requiere atención',
      text: 'Proyectos con compromisos vencidos o con cambios solicitados, con el motivo de cada alerta.'
    },
    {
      target: 'menu',
      title: 'Más detalle',
      text: 'En Proyectos está la tabla completa con búsqueda, filtros y exportación; en Tutores, la carga y las alertas de cada tutor.'
    }
  ]
};
