/**
 * Datos Semilla Ficticios para el Piloto Académico 2026-1
 * Capacidad: 15 Estudiantes, 15 Proyectos de Grado y 3 Tutores Principales.
 * Todos los datos son completamente ficticios y no comprometen información privada.
 *
 * Fase 1 · chore/datos-piloto-variados-contexto-eafit (ver docs/CAMBIOS.md):
 * - Contexto EAFIT: escuelas de la universidad, nombres colombianos y correos de ejemplo
 *   (@ejemplo.edu.co, dominio ficticio para no apuntar a buzones reales).
 * - Estados variados para que la demo muestre todos los casos: proyectos completados,
 *   con cambios solicitados, con compromisos vencidos (riesgo alto) y en avance normal.
 * - Fechas relativas al día en que se abre la demo, para que los vencimientos y el
 *   semáforo de riesgo se vean igual sin importar cuándo se presente.
 */

import { PHASE0_ACTIVITIES } from './phase0Catalog.js';
import { GATE0_CRITERIA } from './gate0Catalog.js';
import { STAGE_DEFINITIONS } from '../domain/stageMachine.js';

// --- Utilidades de fechas relativas a hoy -------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
const dateFromToday = (days) => new Date(Date.now() + days * DAY_MS);

/** AAAA-MM-DD (fechas de etapas, evidencias y compromisos). */
const isoDate = (days) => dateFromToday(days).toISOString().split('T')[0];

/** DD/MM/AAAA (fechas límite en la bitácora). */
const shortDate = (days) => dateFromToday(days).toLocaleDateString('es-CO', {
  day: '2-digit', month: '2-digit', year: 'numeric'
});

/** DD/MM/AAAA HH:MM (marca de tiempo de la bitácora). */
const stamp = (days, time) => `${shortDate(days)} ${time}`;

/** "15 de diciembre de 2026" (fecha objetivo de la ficha). */
const longDate = (days) => dateFromToday(days).toLocaleDateString('es-CO', {
  day: 'numeric', month: 'long', year: 'numeric'
});

// --- Personas -----------------------------------------------------------------------------

export const TUTORS = [
  { id: 'TUT-01', name: 'Dr. Carlos Gutiérrez', email: 'carlos.gutierrez@ejemplo.edu.co', department: 'Escuela de Administración' },
  { id: 'TUT-02', name: 'Dra. Elena Ramos', email: 'elena.ramos@ejemplo.edu.co', department: 'Escuela de Ciencias Aplicadas e Ingeniería' },
  { id: 'TUT-03', name: 'Dra. Sofía Mendoza', email: 'sofia.mendoza@ejemplo.edu.co', department: 'Escuela de Finanzas, Economía y Gobierno' }
];

export const ADMIN_USER = {
  id: 'ADM-01',
  name: 'Coordinación de la Maestría',
  email: 'coordinacion.maestria@ejemplo.edu.co',
  role: 'admin'
};

const tutorById = Object.fromEntries(TUTORS.map(t => [t.id, t]));

// --- Constructores ------------------------------------------------------------------------

/**
 * Construye las 6 etapas a partir de la etapa activa.
 * @param {number} activeStage   Etapa en curso (1..6). Usar 7 para un proyecto con todo aprobado.
 * @param {string} activeStatus  Estado de la etapa activa: 'en_revision' | 'observado'.
 * @param {number[]} approvedDaysAgo  Hace cuántos días se aprobó cada etapa anterior.
 */
function buildStages(activeStage, activeStatus = 'en_revision', approvedDaysAgo = []) {
  return STAGE_DEFINITIONS.map(({ id, name, description }) => {
    if (id < activeStage) {
      return { id, name, description, status: 'aprobado', date: isoDate(-(approvedDaysAgo[id - 1] ?? 30)) };
    }
    if (id === activeStage) {
      return { id, name, description, status: activeStatus, date: null };
    }
    return { id, name, description, status: 'pendiente', date: null };
  });
}

function buildGate0(checkedCount) {
  return GATE0_CRITERIA.map((crit, idx) => ({ ...crit, checked: idx < checkedCount }));
}

function buildPhase0(completedCount) {
  return PHASE0_ACTIVITIES.map((act, idx) => ({ ...act, completed: idx < completedCount }));
}

function buildProject({ id, institutionalId, title, thematicLine, student, tutorId, targetInDays, ...rest }) {
  const tutor = tutorById[tutorId];
  const emailUser = student
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().split(' ').join('.');
  return {
    id,
    institutionalId,
    title,
    cohort: '2026-1',
    thematicLine,
    department: tutor.department,
    student,
    studentEmail: `${emailUser}@ejemplo.edu.co`,
    tutor: tutor.name,
    tutorId,
    targetDate: longDate(targetInDays),
    ...rest
  };
}

// --- Proyectos del piloto -----------------------------------------------------------------
// Resumen de casos (útil para la demo):
//   Riesgo Alto (compromiso vencido): PRJ-06, PRJ-07, PRJ-08
//   Cambios solicitados (riesgo Medio): PRJ-03, PRJ-04, PRJ-11
//   Completados (6/6): PRJ-13, PRJ-15
//   Listo para aprobar Etapa 1 (Gate 0 14/14): PRJ-05
//   Etapa 1 con Gate 0 incompleto: PRJ-01 (12/14), PRJ-09 (11/14)

export const PILOT_PROJECTS = [
  // ===== Dr. Carlos Gutiérrez · Escuela de Administración =====
  buildProject({
    id: 'PRJ-01',
    institutionalId: 'MAE-2026-ADM-042',
    title: 'Impacto de la Economía Circular en la Competitividad de MIPYMES Industriales del Valle de Aburrá',
    thematicLine: 'Sostenibilidad y Competitividad',
    student: 'Mateo Restrepo',
    tutorId: 'TUT-01',
    targetInDays: 210,
    stages: buildStages(1, 'en_revision'),
    gate0Items: buildGate0(12),
    phase0Steps: buildPhase0(15),
    evidences: [
      { id: 'EV-01', version: 'v1.1', filename: 'Protocolo_Economia_Circular_v1.1.pdf', stageId: 1, uploadedBy: 'Mateo Restrepo', date: isoDate(-4), size: '2.4 MB' },
      { id: 'EV-02', version: 'v1.0', filename: 'Protocolo_Economia_Circular_v1.0.pdf', stageId: 1, uploadedBy: 'Mateo Restrepo', date: isoDate(-11), size: '1.8 MB' }
    ],
    decisionLog: [
      { id: 2, timestamp: stamp(-4, '16:45'), author: 'Mateo Restrepo (Estudiante)', action: 'Entrega de Evidencia: Propuesta / Protocolo', notes: 'Se cargó la versión v1.1 del protocolo con la matriz de operacionalización ajustada.', milestone: 'Revisión de Gate 0 por el tutor', deadline: shortDate(4) },
      { id: 1, timestamp: stamp(-11, '10:15'), author: 'Mateo Restrepo (Estudiante)', action: 'Entrega de Avance v1.0', notes: 'Propuesta preliminar, diccionario de términos y ecuaciones de búsqueda para Scopus y SciELO.', milestone: 'Evaluación del protocolo por el tutor', deadline: shortDate(-4) }
    ],
    commitments: [
      { id: 'C-01', description: 'Completar los criterios G0-13 (bitácora activa) y G0-14 (control de versiones)', responsible: 'Mateo Restrepo', dueDate: isoDate(4), status: 'pendiente' },
      { id: 'C-02', description: 'Revisar ecuaciones de búsqueda en Scopus', responsible: 'Dr. Carlos Gutiérrez', dueDate: isoDate(-6), status: 'cumplido' }
    ]
  }),
  buildProject({
    id: 'PRJ-04',
    institutionalId: 'MAE-2026-ADM-043',
    title: 'Logística Inversa y Huella de Carbono en Cadenas de Suministro del Sector Retail Colombiano',
    thematicLine: 'Operaciones y Cadena de Suministro',
    student: 'Camila Ospina',
    tutorId: 'TUT-01',
    targetInDays: 150,
    stages: buildStages(3, 'observado', [75, 40]),
    gate0Items: buildGate0(14),
    phase0Steps: buildPhase0(17),
    evidences: [
      { id: 'EV-05', version: 'v1.2', filename: 'Diseno_Metodologico_Logistica_v1.2.pdf', stageId: 3, uploadedBy: 'Camila Ospina', date: isoDate(-6), size: '2.1 MB' }
    ],
    decisionLog: [
      { id: 2, timestamp: stamp(-2, '09:30'), author: 'Dr. Carlos Gutiérrez (Tutor)', action: 'Observación Registrada: Metodología', notes: 'El instrumento de medición de huella de carbono no está validado. Se requiere juicio de al menos 3 expertos antes de continuar.', milestone: 'Ajuste en Metodología', deadline: shortDate(8) },
      { id: 1, timestamp: stamp(-40, '14:00'), author: 'Dr. Carlos Gutiérrez (Tutor)', action: 'Aprobación Formal: Marco Teórico', notes: 'Marco teórico aprobado con 85 fuentes indexadas. Se habilita la etapa de Metodología.', milestone: 'Inicio de Etapa 3', deadline: shortDate(-10) }
    ],
    commitments: [
      { id: 'C-05', description: 'Validar la encuesta logística con juicio de 3 expertos', responsible: 'Camila Ospina', dueDate: isoDate(8), status: 'pendiente' }
    ]
  }),
  buildProject({
    id: 'PRJ-07',
    institutionalId: 'MAE-2026-ADM-044',
    title: 'Liderazgo y Retención de Talento en Empresas Familiares Antioqueñas',
    thematicLine: 'Gestión Humana y Organizaciones',
    student: 'Juan Pablo Arango',
    tutorId: 'TUT-01',
    targetInDays: 200,
    stages: buildStages(1, 'en_revision'),
    gate0Items: buildGate0(13),
    phase0Steps: buildPhase0(16),
    evidences: [
      { id: 'EV-08', version: 'v1.0', filename: 'Propuesta_Empresas_Familiares_v1.0.pdf', stageId: 1, uploadedBy: 'Juan Pablo Arango', date: isoDate(-20), size: '2.5 MB' }
    ],
    decisionLog: [
      { id: 1, timestamp: stamp(-20, '15:30'), author: 'Juan Pablo Arango (Estudiante)', action: 'Carga de Propuesta Inicial', notes: 'Propuesta con 13 criterios de Gate 0 conformes; falta el plan de control de versiones.', milestone: 'Subsanar control de versiones', deadline: shortDate(-6) }
    ],
    commitments: [
      { id: 'C-08', description: 'Crear el repositorio del proyecto con control de versiones (criterio G0-14)', responsible: 'Juan Pablo Arango', dueDate: isoDate(-6), status: 'pendiente' }
    ]
  }),
  buildProject({
    id: 'PRJ-10',
    institutionalId: 'MAE-2026-ADM-045',
    title: 'Cultura Organizacional e Innovación Abierta en Startups de Base Tecnológica de Medellín',
    thematicLine: 'Gestión de la Innovación',
    student: 'Valeria Montoya',
    tutorId: 'TUT-01',
    targetInDays: 90,
    stages: buildStages(5, 'en_revision', [120, 90, 60, 20]),
    gate0Items: buildGate0(14),
    phase0Steps: buildPhase0(17),
    evidences: [
      { id: 'EV-11', version: 'v1.0', filename: 'Resultados_Empiricos_Startups_v1.0.pdf', stageId: 5, uploadedBy: 'Valeria Montoya', date: isoDate(-3), size: '3.4 MB' }
    ],
    decisionLog: [
      { id: 1, timestamp: stamp(-20, '16:00'), author: 'Dr. Carlos Gutiérrez (Tutor)', action: 'Aprobación Formal: Recolección', notes: 'Se completaron las 45 entrevistas a fundadores. Se autoriza la etapa de Análisis.', milestone: 'Codificación temática de entrevistas', deadline: shortDate(10) }
    ],
    commitments: [
      { id: 'C-11', description: 'Entregar la matriz de triangulación de datos cualitativos', responsible: 'Valeria Montoya', dueDate: isoDate(10), status: 'pendiente' }
    ]
  }),
  buildProject({
    id: 'PRJ-13',
    institutionalId: 'MAE-2026-ADM-046',
    title: 'Factores Determinantes de la Adopción de Comercio Electrónico B2B en Empresas Exportadoras',
    thematicLine: 'Comercio Internacional y Negocios Digitales',
    student: 'Santiago Villa',
    tutorId: 'TUT-01',
    targetInDays: 20,
    stages: buildStages(7, 'aprobado', [180, 140, 100, 70, 35, 5]),
    gate0Items: buildGate0(14),
    phase0Steps: buildPhase0(17),
    evidences: [
      { id: 'EV-14', version: 'v2.0', filename: 'Documento_Final_B2B_v2.0.pdf', stageId: 6, uploadedBy: 'Santiago Villa', date: isoDate(-8), size: '4.9 MB' }
    ],
    decisionLog: [
      { id: 1, timestamp: stamp(-5, '11:00'), author: 'Dr. Carlos Gutiérrez (Tutor)', action: 'Aprobación Formal: Documento Final', notes: 'Documento final aprobado. Reporte de similitud por debajo del 8%. Listo para trámite de sustentación.', milestone: 'Culminación de Trabajo de Grado', deadline: shortDate(20) }
    ],
    commitments: [
      { id: 'C-14', description: 'Entregar versión final con ajustes de estilo', responsible: 'Santiago Villa', dueDate: isoDate(-10), status: 'cumplido' }
    ]
  }),

  // ===== Dra. Elena Ramos · Escuela de Ciencias Aplicadas e Ingeniería =====
  buildProject({
    id: 'PRJ-02',
    institutionalId: 'MAE-2026-ING-015',
    title: 'Modelos de Lenguaje de Gran Escala en la Detección Temprana de Sesgos de Selección',
    thematicLine: 'Inteligencia Artificial y Ética Computacional',
    student: 'Lucía Valencia',
    tutorId: 'TUT-02',
    targetInDays: 180,
    stages: buildStages(2, 'en_revision', [30]),
    gate0Items: buildGate0(14),
    phase0Steps: buildPhase0(17),
    evidences: [
      { id: 'EV-03', version: 'v2.0', filename: 'Marco_Teorico_Sesgos_LLM_v2.0.pdf', stageId: 2, uploadedBy: 'Lucía Valencia', date: isoDate(-5), size: '3.8 MB' }
    ],
    decisionLog: [
      { id: 1, timestamp: stamp(-30, '11:30'), author: 'Dra. Elena Ramos (Tutor)', action: 'Aprobación Formal: Propuesta / Protocolo', notes: 'Protocolo aprobado con los 14 criterios de Gate 0 conformes. Se habilita el Marco Teórico.', milestone: 'Mapeo sistemático de literatura', deadline: shortDate(7) }
    ],
    commitments: [
      { id: 'C-03', description: 'Entregar el primer borrador de la taxonomía de sesgos', responsible: 'Lucía Valencia', dueDate: isoDate(9), status: 'pendiente' }
    ]
  }),
  buildProject({
    id: 'PRJ-05',
    institutionalId: 'MAE-2026-ING-016',
    title: 'Visión Computacional Aplicada a la Clasificación de Residuos Sólidos Urbanos',
    thematicLine: 'Inteligencia Artificial y Sostenibilidad',
    student: 'Diego Morales',
    tutorId: 'TUT-02',
    targetInDays: 220,
    stages: buildStages(1, 'en_revision'),
    gate0Items: buildGate0(14),
    phase0Steps: buildPhase0(17),
    evidences: [
      { id: 'EV-06', version: 'v1.0', filename: 'Protocolo_Vision_Residuos_v1.0.pdf', stageId: 1, uploadedBy: 'Diego Morales', date: isoDate(-2), size: '4.2 MB' }
    ],
    decisionLog: [
      { id: 1, timestamp: stamp(-2, '17:00'), author: 'Diego Morales (Estudiante)', action: 'Carga de Protocolo Completo', notes: 'Protocolo con los 14 criterios de Gate 0 cubiertos y conjunto de datos de prueba preseleccionado.', milestone: 'Dictamen de Gate 0 por la tutora', deadline: shortDate(3) }
    ],
    commitments: [
      { id: 'C-06', description: 'Emitir dictamen formal del protocolo', responsible: 'Dra. Elena Ramos', dueDate: isoDate(3), status: 'pendiente' }
    ]
  }),
  buildProject({
    id: 'PRJ-08',
    institutionalId: 'MAE-2026-ING-017',
    title: 'Optimización de Rutas de Transporte Público Basada en Grafos Temporales y Tráfico en Tiempo Real',
    thematicLine: 'Ciudades Inteligentes y Movilidad',
    student: 'Mariana Zapata',
    tutorId: 'TUT-02',
    targetInDays: 160,
    stages: buildStages(3, 'en_revision', [60, 25]),
    gate0Items: buildGate0(14),
    phase0Steps: buildPhase0(17),
    evidences: [
      { id: 'EV-09', version: 'v1.0', filename: 'Metodologia_Grafos_Temporales_v1.0.pdf', stageId: 3, uploadedBy: 'Mariana Zapata', date: isoDate(-12), size: '3.1 MB' }
    ],
    decisionLog: [
      { id: 1, timestamp: stamp(-25, '11:00'), author: 'Dra. Elena Ramos (Tutor)', action: 'Aprobación Formal: Marco Teórico', notes: 'Muy buena revisión sobre algoritmos de caminos mínimos dinámicos.', milestone: 'Definición del conjunto de datos GPS abierto', deadline: shortDate(-3) }
    ],
    commitments: [
      { id: 'C-09', description: 'Validar la ingesta de datos GTFS del sistema de transporte', responsible: 'Mariana Zapata', dueDate: isoDate(-3), status: 'pendiente' }
    ]
  }),
  buildProject({
    id: 'PRJ-11',
    institutionalId: 'MAE-2026-ING-018',
    title: 'Detección de Amenazas en Entornos IoT Industriales Mediante Aprendizaje Federado',
    thematicLine: 'Seguridad de la Información y Redes',
    student: 'Alejandro Cardona',
    tutorId: 'TUT-02',
    targetInDays: 190,
    stages: buildStages(2, 'observado', [35]),
    gate0Items: buildGate0(14),
    phase0Steps: buildPhase0(17),
    evidences: [
      { id: 'EV-12', version: 'v1.0', filename: 'Marco_Teorico_Aprendizaje_Federado_v1.0.pdf', stageId: 2, uploadedBy: 'Alejandro Cardona', date: isoDate(-9), size: '2.8 MB' }
    ],
    decisionLog: [
      { id: 2, timestamp: stamp(-3, '15:20'), author: 'Dra. Elena Ramos (Tutor)', action: 'Observación Registrada: Marco Teórico', notes: 'Falta comparar Flower y PySyft con criterios explícitos y fuentes de los últimos 3 años.', milestone: 'Ajuste en Marco Teórico', deadline: shortDate(7) },
      { id: 1, timestamp: stamp(-35, '15:00'), author: 'Dra. Elena Ramos (Tutor)', action: 'Aprobación Formal: Propuesta / Protocolo', notes: 'Protocolo validado con alcance metodológico aprobado.', milestone: 'Revisión sistemática de arquitecturas', deadline: shortDate(-5) }
    ],
    commitments: [
      { id: 'C-12', description: 'Presentar la comparación de frameworks Flower y PySyft', responsible: 'Alejandro Cardona', dueDate: isoDate(7), status: 'pendiente' }
    ]
  }),
  buildProject({
    id: 'PRJ-14',
    institutionalId: 'MAE-2026-ING-019',
    title: 'Detección Automatizada de Noticias Falsas en Redes Sociales Mediante Modelos Multimodales',
    thematicLine: 'Procesamiento de Lenguaje Natural',
    student: 'Natalia Gómez',
    tutorId: 'TUT-02',
    targetInDays: 45,
    stages: buildStages(6, 'en_revision', [170, 130, 95, 60, 25]),
    gate0Items: buildGate0(14),
    phase0Steps: buildPhase0(17),
    evidences: [
      { id: 'EV-15', version: 'v1.0', filename: 'Borrador_Documento_Final_Noticias_v1.0.pdf', stageId: 6, uploadedBy: 'Natalia Gómez', date: isoDate(-4), size: '5.6 MB' }
    ],
    decisionLog: [
      { id: 1, timestamp: stamp(-25, '18:00'), author: 'Dra. Elena Ramos (Tutor)', action: 'Aprobación Formal: Análisis', notes: 'Resultados del modelo multimodal aprobados. Se habilita el Documento Final.', milestone: 'Redacción del documento final', deadline: shortDate(12) }
    ],
    commitments: [
      { id: 'C-15', description: 'Entregar reporte de similitud del documento final', responsible: 'Natalia Gómez', dueDate: isoDate(12), status: 'pendiente' }
    ]
  }),

  // ===== Dra. Sofía Mendoza · Escuela de Finanzas, Economía y Gobierno =====
  buildProject({
    id: 'PRJ-03',
    institutionalId: 'MAE-2026-FEG-008',
    title: 'Inclusión Financiera y Uso de Billeteras Digitales en Hogares Rurales de Antioquia',
    thematicLine: 'Finanzas Inclusivas',
    student: 'Jorge Betancur',
    tutorId: 'TUT-03',
    targetInDays: 230,
    stages: buildStages(1, 'observado'),
    gate0Items: buildGate0(10),
    phase0Steps: buildPhase0(12),
    evidences: [
      { id: 'EV-04', version: 'v1.0', filename: 'Protocolo_Billeteras_Digitales_v1.0.pdf', stageId: 1, uploadedBy: 'Jorge Betancur', date: isoDate(-8), size: '1.9 MB' }
    ],
    decisionLog: [
      { id: 1, timestamp: stamp(-5, '09:20'), author: 'Dra. Sofía Mendoza (Tutor)', action: 'Observación Registrada: Propuesta / Protocolo', notes: 'Es necesario delimitar los municipios de estudio y justificar el muestreo estratificado.', milestone: 'Ajuste en Propuesta / Protocolo', deadline: shortDate(6) }
    ],
    commitments: [
      { id: 'C-04', description: 'Ajustar el cálculo muestral con apoyo de estadística', responsible: 'Jorge Betancur', dueDate: isoDate(6), status: 'pendiente' }
    ]
  }),
  buildProject({
    id: 'PRJ-06',
    institutionalId: 'MAE-2026-FEG-009',
    title: 'Transmisión de la Tasa de Política Monetaria al Crédito de Vivienda en Colombia',
    thematicLine: 'Macroeconomía y Política Monetaria',
    student: 'Andrea Correa',
    tutorId: 'TUT-03',
    targetInDays: 120,
    stages: buildStages(4, 'en_revision', [100, 70, 30]),
    gate0Items: buildGate0(14),
    phase0Steps: buildPhase0(17),
    evidences: [
      { id: 'EV-07', version: 'v1.0', filename: 'Base_Datos_Credito_Vivienda_v1.0.xlsx', stageId: 4, uploadedBy: 'Andrea Correa', date: isoDate(-15), size: '1.2 MB' }
    ],
    decisionLog: [
      { id: 1, timestamp: stamp(-30, '10:00'), author: 'Dra. Sofía Mendoza (Tutor)', action: 'Aprobación Formal: Metodología', notes: 'Modelo VAR y fuentes de datos aprobados. Se habilita la Recolección.', milestone: 'Consolidar series de crédito por entidad', deadline: shortDate(-8) }
    ],
    commitments: [
      { id: 'C-07', description: 'Consolidar las series mensuales de crédito de vivienda 2010-2025', responsible: 'Andrea Correa', dueDate: isoDate(-8), status: 'pendiente' }
    ]
  }),
  buildProject({
    id: 'PRJ-09',
    institutionalId: 'MAE-2026-FEG-010',
    title: 'Evaluación de Impacto del Programa de Alimentación Escolar en el Rendimiento Académico',
    thematicLine: 'Evaluación de Políticas Públicas',
    student: 'Felipe Cárdenas',
    tutorId: 'TUT-03',
    targetInDays: 240,
    stages: buildStages(1, 'en_revision'),
    gate0Items: buildGate0(11),
    phase0Steps: buildPhase0(14),
    evidences: [
      { id: 'EV-10', version: 'v1.0', filename: 'Protocolo_Alimentacion_Escolar_v1.0.pdf', stageId: 1, uploadedBy: 'Felipe Cárdenas', date: isoDate(-5), size: '1.7 MB' }
    ],
    decisionLog: [
      { id: 1, timestamp: stamp(-5, '12:15'), author: 'Felipe Cárdenas (Estudiante)', action: 'Carga de Protocolo Inicial', notes: 'Protocolo preliminar con la estrategia de identificación por diferencias en diferencias.', milestone: 'Alineación de objetivos con la tutora', deadline: shortDate(5) }
    ],
    commitments: [
      { id: 'C-10', description: 'Definir grupo de control y fuentes de datos del ICFES', responsible: 'Felipe Cárdenas', dueDate: isoDate(5), status: 'pendiente' }
    ]
  }),
  buildProject({
    id: 'PRJ-12',
    institutionalId: 'MAE-2026-FEG-011',
    title: 'Bonos Verdes y Costo de Financiación en el Mercado de Capitales Colombiano',
    thematicLine: 'Finanzas Sostenibles',
    student: 'Laura Henao',
    tutorId: 'TUT-03',
    targetInDays: 140,
    stages: buildStages(3, 'en_revision', [65, 28]),
    gate0Items: buildGate0(14),
    phase0Steps: buildPhase0(17),
    evidences: [
      { id: 'EV-13', version: 'v1.1', filename: 'Metodologia_Bonos_Verdes_v1.1.pdf', stageId: 3, uploadedBy: 'Laura Henao', date: isoDate(-6), size: '2.2 MB' }
    ],
    decisionLog: [
      { id: 1, timestamp: stamp(-28, '10:30'), author: 'Dra. Sofía Mendoza (Tutor)', action: 'Aprobación Formal: Marco Teórico', notes: 'Revisión de literatura completa con 70 referencias indexadas.', milestone: 'Diseño del estudio de eventos', deadline: shortDate(8) }
    ],
    commitments: [
      { id: 'C-13', description: 'Definir la muestra de emisiones y la ventana del estudio de eventos', responsible: 'Laura Henao', dueDate: isoDate(8), status: 'pendiente' }
    ]
  }),
  buildProject({
    id: 'PRJ-15',
    institutionalId: 'MAE-2026-FEG-012',
    title: 'Gobernanza Fiscal y Calidad del Gasto en Municipios de Sexta Categoría',
    thematicLine: 'Gobierno y Finanzas Públicas',
    student: 'Sebastián Salazar',
    tutorId: 'TUT-03',
    targetInDays: 15,
    stages: buildStages(7, 'aprobado', [190, 150, 110, 75, 40, 3]),
    gate0Items: buildGate0(14),
    phase0Steps: buildPhase0(17),
    evidences: [
      { id: 'EV-16', version: 'v2.1', filename: 'Documento_Final_Gobernanza_Fiscal_v2.1.pdf', stageId: 6, uploadedBy: 'Sebastián Salazar', date: isoDate(-7), size: '5.1 MB' }
    ],
    decisionLog: [
      { id: 1, timestamp: stamp(-3, '15:00'), author: 'Dra. Sofía Mendoza (Tutor)', action: 'Aprobación Formal: Documento Final', notes: 'Documento final aprobado. Se recomienda postular el trabajo a mención meritoria.', milestone: 'Culminación de Trabajo de Grado', deadline: shortDate(15) }
    ],
    commitments: [
      { id: 'C-16', description: 'Revisión editorial completa y control de similitud (<10%)', responsible: 'Sebastián Salazar', dueDate: isoDate(-9), status: 'cumplido' }
    ]
  })
];
