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
      target: 'selector-rol',
      title: 'Cambiar de rol',
      text: 'En esta demo puedes ver la plataforma como tutor o coordinación desde aquí.'
    }
  ],
  tutor: [
    {
      target: 'bandeja',
      title: 'Tu bandeja de revisión',
      text: 'Los proyectos que tienes asignados, con su etapa y estado. Los que tienen alertas muestran su nivel de riesgo.'
    },
    {
      target: 'ver-como',
      title: 'Simular otro tutor',
      text: 'En la demo puedes ver la bandeja de cada uno de los 3 tutores del piloto.'
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
      text: 'Número de proyectos, tutores y avance promedio del piloto.'
    },
    {
      target: 'filtros',
      title: 'Buscar y filtrar',
      text: 'Busca por proyecto, estudiante o tutor, filtra por etapa o riesgo y exporta la información a Excel.'
    },
    {
      target: 'tabla',
      title: 'Estado de cada proyecto',
      text: 'Etapa actual, tutor, estado y semáforo de riesgo de cada trabajo de grado. Pasa el cursor sobre el riesgo para ver el motivo.'
    }
  ]
};
