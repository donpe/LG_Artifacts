import assert from 'node:assert/strict';
import { calculateProgress, calculateRiskLevel } from '../src/domain/progressCalculator.js';
import { canTransition, getStageActions, STAGE_STATUS } from '../src/domain/stageMachine.js';
import { validateGate0 } from '../src/domain/gate0Validator.js';
import { sanitizeCSVValue, exportProjectToCSV } from '../src/domain/csvExporter.js';
import { PILOT_PROJECTS } from '../src/data/pilotData.js';
import { getLatestEvidence } from '../src/domain/evidence.js';
import { parseHash, buildHash } from '../src/routing/hashRoute.js';
import { getStageLog, listPendingCommitments } from '../src/domain/projectLog.js';

console.log('🧪 Iniciando pruebas unitarias de lógica de dominio (Academic Tracking)...');

// --- 1. Cálculo de Progreso (Denominador estricto: 6) ---
console.log('  1. Verificando cálculo de avance sobre 6 etapas...');
const testStages0 = [
  { id: 1, status: 'en_revision' }, { id: 2, status: 'pendiente' },
  { id: 3, status: 'pendiente' }, { id: 4, status: 'pendiente' },
  { id: 5, status: 'pendiente' }, { id: 6, status: 'pendiente' }
];
assert.equal(calculateProgress(testStages0).percentage, 0, '0 etapas aprobadas = 0%');

const testStages1 = [
  { id: 1, status: 'aprobado' }, { id: 2, status: 'en_revision' },
  { id: 3, status: 'pendiente' }, { id: 4, status: 'pendiente' },
  { id: 5, status: 'pendiente' }, { id: 6, status: 'pendiente' }
];
assert.equal(calculateProgress(testStages1).percentage, 17, '1 de 6 etapas aprobadas = 17% (redondeado)');

const testStages3 = [
  { id: 1, status: 'aprobado' }, { id: 2, status: 'aprobado' },
  { id: 3, status: 'aprobado' }, { id: 4, status: 'en_revision' },
  { id: 5, status: 'pendiente' }, { id: 6, status: 'pendiente' }
];
assert.equal(calculateProgress(testStages3).percentage, 50, '3 de 6 etapas aprobadas = 50%');

const testStages6 = [
  { id: 1, status: 'aprobado' }, { id: 2, status: 'aprobado' },
  { id: 3, status: 'aprobado' }, { id: 4, status: 'aprobado' },
  { id: 5, status: 'aprobado' }, { id: 6, status: 'aprobado' }
];
assert.equal(calculateProgress(testStages6).percentage, 100, '6 de 6 etapas aprobadas = 100%');
console.log('     ✓ Progreso exacto validado para 0%, 17%, 50% y 100%.');

// Test calculateRiskLevel
assert.equal(calculateRiskLevel({ stages: [{ status: 'observado' }] }), 'Medio', 'Riesgo Medio si hay etapa observada');
assert.equal(calculateRiskLevel({ stages: [{ status: 'aprobado' }], commitments: [] }), 'Completado', 'Riesgo Completado si todo aprobado');
const overdueProject = {
  stages: [{ status: 'observado' }],
  commitments: [{ status: 'pendiente', dueDate: '2026-10-01', description: 'Entrega' }]
};
assert.equal(calculateRiskLevel(overdueProject, '2026-10-16'), 'Alto', 'Compromiso vencido tiene prioridad: riesgo Alto');
assert.equal(calculateRiskLevel({ stages: [{ status: 'en_revision' }], commitments: [] }), 'Bajo', 'Sin alertas: riesgo Bajo');
console.log('     ✓ Cálculo de nivel de riesgo validado.');

// --- 2. Reglas de Máquina de Estados ---
console.log('  2. Verificando máquina de estados y transiciones...');

// Estudiante no puede aprobar
const studentApprove = canTransition({
  currentStatus: STAGE_STATUS.EN_REVISION,
  targetStatus: STAGE_STATUS.APROBADO,
  actorRole: 'estudiante',
  stageNumber: 1,
  isGate0Compliant: true
});
assert.equal(studentApprove.allowed, false, 'Estudiante no puede aprobar etapas');

// Tutor no puede aprobar etapa 1 si Gate 0 < 14
const tutorApproveIncompleteGate0 = canTransition({
  currentStatus: STAGE_STATUS.EN_REVISION,
  targetStatus: STAGE_STATUS.APROBADO,
  actorRole: 'tutor',
  stageNumber: 1,
  isGate0Compliant: false
});
assert.equal(tutorApproveIncompleteGate0.allowed, false, 'No se aprueba Etapa 1 con Gate 0 incompleto');

// Tutor SÍ puede aprobar etapa 1 si Gate 0 == 14
const tutorApproveCompleteGate0 = canTransition({
  currentStatus: STAGE_STATUS.EN_REVISION,
  targetStatus: STAGE_STATUS.APROBADO,
  actorRole: 'tutor',
  stageNumber: 1,
  isGate0Compliant: true
});
assert.equal(tutorApproveCompleteGate0.allowed, true, 'Tutor puede aprobar Etapa 1 con Gate 0 conforme');

// No se puede aprobar Etapa 2 si Etapa 1 no está aprobada
const approveStage2Without1 = canTransition({
  currentStatus: STAGE_STATUS.EN_REVISION,
  targetStatus: STAGE_STATUS.APROBADO,
  actorRole: 'tutor',
  stageNumber: 2,
  previousStageApproved: false
});
assert.equal(approveStage2Without1.allowed, false, 'No se puede aprobar etapa sin previa aprobada');

// Solicitar cambios exige observación no vacía
const observeWithoutNote = canTransition({
  currentStatus: STAGE_STATUS.EN_REVISION,
  targetStatus: STAGE_STATUS.OBSERVADO,
  actorRole: 'tutor',
  hasObservation: false
});
assert.equal(observeWithoutNote.allowed, false, 'Observación no puede estar vacía');
console.log('     ✓ Restricciones de autorización y precondiciones validadas.');

// getStageActions: reglas aplicadas en la interfaz (Fase 1)
const mkStages = (...st) => st.map((status, i) => ({ id: i + 1, status }));
const pend6 = mkStages('aprobado', 'en_revision', 'pendiente', 'pendiente', 'pendiente', 'pendiente');
assert.equal(getStageActions({ stages: pend6, stageId: 4, role: 'estudiante' }).upload.allowed, false, 'Estudiante no puede entregar saltando etapas');
assert.equal(getStageActions({ stages: pend6, stageId: 2, role: 'estudiante' }).upload.allowed, true, 'Estudiante puede reemplazar entrega en revisión');
assert.equal(getStageActions({ stages: pend6, stageId: 1, role: 'estudiante' }).upload.allowed, false, 'No se entrega sobre etapa aprobada');
assert.equal(getStageActions({ stages: pend6, stageId: 2, role: 'tutor' }).approve.allowed, true, 'Tutor aprueba etapa en revisión con previa aprobada');
assert.equal(getStageActions({ stages: pend6, stageId: 3, role: 'tutor' }).approve.allowed, false, 'Tutor no aprueba etapa sin entrega');
const skip = mkStages('en_revision', 'en_revision', 'pendiente', 'pendiente', 'pendiente', 'pendiente');
assert.equal(getStageActions({ stages: skip, stageId: 2, role: 'tutor' }).approve.allowed, false, 'Tutor no aprueba etapa 2 sin etapa 1 aprobada');
assert.equal(getStageActions({ stages: skip, stageId: 1, role: 'tutor', isGate0Compliant: false }).approve.allowed, false, 'Gate 0 incompleto bloquea etapa 1');
assert.equal(getStageActions({ stages: skip, stageId: 1, role: 'tutor' }).requestChanges.allowed, true, 'Tutor puede observar entrega en revisión');
assert.equal(getStageActions({ stages: pend6, stageId: 2, role: 'estudiante' }).approve.allowed, false, 'Estudiante nunca aprueba');
console.log('     ✓ Acciones de etapa en la interfaz (getStageActions) validadas.');

// --- 3. Auditoría Gate 0 (14 Criterios y No Auto-aprobación) ---
console.log('  3. Verificando validador de Gate 0...');
const gate0Partial = Array.from({ length: 14 }, (_, i) => ({ id: `G0-${i+1}`, checked: i < 13 }));
const validationPartial = validateGate0(gate0Partial);
assert.equal(validationPartial.isFullyCompliant, false, '13/14 no es conforme');
assert.equal(validationPartial.missingCount, 1, 'Falta 1 criterio');

const gate0Full = Array.from({ length: 14 }, (_, i) => ({ id: `G0-${i+1}`, checked: true }));
const validationFull = validateGate0(gate0Full);
assert.equal(validationFull.isFullyCompliant, true, '14/14 es conforme');
console.log('     ✓ Validador de Gate 0 verificado.');

// --- 4. Exportación CSV y Sanitización de Fórmulas ---
console.log('  4. Verificando sanitización de CSV (QA-19 / CA-09)...');
assert.equal(sanitizeCSVValue('=SUM(A1:A10)'), '"\'=SUM(A1:A10)"', 'Neutraliza fórmula =');
assert.equal(sanitizeCSVValue('+cmd|/c'), '"\'+cmd|/c"', 'Neutraliza fórmula +');
assert.equal(sanitizeCSVValue('-1+1'), '"\'-1+1"', 'Neutraliza fórmula -');
assert.equal(sanitizeCSVValue('@echo'), '"\'@echo"', 'Neutraliza fórmula @');
assert.equal(sanitizeCSVValue('Economía Circular'), '"Economía Circular"', 'Respeta texto legítimo');

const sampleCSV = exportProjectToCSV(PILOT_PROJECTS[0]);
assert.ok(sampleCSV.startsWith('\uFEFF'), 'El CSV debe iniciar con UTF-8 BOM');
assert.ok(sampleCSV.includes('Impacto de la Economía Circular'), 'Incluye título con tildes');
assert.ok(sampleCSV.includes('G0-01'), 'Incluye códigos Gate 0');
assert.ok(sampleCSV.includes('6 etapas'), 'Menciona las 6 etapas académicas');
console.log('     ✓ Exportación CSV validada con UTF-8 BOM y mitigación de inyección.');

// --- 5. Datos del piloto (Fase 1): deben cubrir todos los casos de la demo ---
console.log('  5. Verificando variedad de los datos del piloto...');
assert.equal(PILOT_PROJECTS.length, 15, 'El piloto tiene 15 proyectos');
const levels = new Set(PILOT_PROJECTS.map(p => calculateRiskLevel(p)));
['Alto', 'Medio', 'Bajo', 'Completado'].forEach(l => assert.ok(levels.has(l), `Hay al menos un proyecto con riesgo ${l}`));
['TUT-01', 'TUT-02', 'TUT-03'].forEach(t => assert.equal(PILOT_PROJECTS.filter(p => p.tutorId === t).length, 5, `${t} tiene 5 proyectos`));
console.log('     ✓ Datos con riesgos Alto, Medio, Bajo y Completado, 5 proyectos por tutor.');

// --- 6. Evidencias por etapa (Fase 4) ---
console.log('  6. Verificando evidencias por etapa...');
const evs = [
  { id: 'a', stageId: 1, date: '2026-10-01' },
  { id: 'b', stageId: 1, date: '2026-10-10' },
  { id: 'c', stageId: 2, date: '2026-10-05' }
];
assert.equal(getLatestEvidence(evs, 1).id, 'b', 'Devuelve la entrega más reciente de la etapa');
assert.equal(getLatestEvidence(evs, 6), null, 'Una etapa sin entregas no muestra evidencias de otra etapa');
console.log('     ✓ Cada etapa muestra solo sus propias entregas.');

// --- 7. Rutas con dirección propia (Fase 4) ---
console.log('  7. Verificando rutas...');
const r1 = parseHash('#/tutor/por-revisar?tutor=TUT-02&proyecto=PRJ-05&etapa=1');
assert.deepEqual([r1.role, r1.section, r1.tutorId, r1.projectId, r1.stageId], ['tutor', 'por-revisar', 'TUT-02', 'PRJ-05', 1]);
const r2 = parseHash('#/coordinacion/proyecto/bitacora?proyecto=PRJ-07');
assert.deepEqual([r2.role, r2.section, r2.tab, r2.projectId], ['admin', 'proyecto', 'bitacora', 'PRJ-07']);
assert.equal(buildHash(r2), '#/coordinacion/proyecto/bitacora?proyecto=PRJ-07', 'La dirección se reconstruye igual');
assert.equal(parseHash('#/desconocido').role, 'tutor', 'Una dirección inválida vuelve a la ruta por defecto');
assert.equal(parseHash('#/estudiante/etapas?etapa=9').stageId, undefined, 'Etapas fuera de 1..6 se ignoran');
console.log('     ✓ Las direcciones se leen y se reconstruyen correctamente.');

// --- 8. Bitácora por etapa y compromisos (Fase 4) ---
console.log('  8. Verificando bitácora por etapa y compromisos...');
const logProject = {
  decisionLog: [
    { id: 1, action: 'Observación Registrada: Metodología' },
    { id: 2, action: 'Aprobación Formal: Marco Teórico' },
    { id: 3, action: 'Entrega de Evidencia', stageId: 3 }
  ]
};
assert.deepEqual(getStageLog(logProject, { id: 3, name: 'Metodología' }).map(l => l.id), [1, 3], 'Bitácora filtrada por etapa');
const cm = listPendingCommitments([
  { commitments: [{ status: 'pendiente', dueDate: '2026-10-01' }, { status: 'pendiente', dueDate: '2026-10-20' }, { status: 'cumplido', dueDate: '2026-09-01' }] }
], '2026-10-16');
assert.deepEqual(cm.map(c => c.timing), ['vencido', 'proximo'], 'Compromisos pendientes ordenados y clasificados');
console.log('     ✓ Bitácora por etapa y compromisos validados.');

console.log('✅ TODAS LAS PRUEBAS UNITARIAS DE DOMINIO PASARON SATISFACTORIAMENTE (100% OK).\n');
