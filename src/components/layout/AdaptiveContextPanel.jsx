import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { GLOSSARY } from '../../data/glossary.js';
import StatusBadge from '../StatusBadge.jsx';

/**
 * AdaptiveContextPanel — Panel Contextual Lateral Deslizable (Academic Flow 2.0)
 * Provee acceso a detalles, checklist de Gate 0/Fase 0, formularios de dictamen y bitácora
 * sin bloquear el lienzo de trabajo central.
 */
export default function AdaptiveContextPanel({
  isOpen,
  onClose,
  title,
  project,
  role,
  activeStage,
  gate0Analysis,
  onToggleGateItem,
  onTogglePhase0Step,
  onStudentUploadEvidence,
  onTutorRequestChanges,
  onTutorApproveStage,
  stageActions
}) {
  const panelRef = useRef(null);

  const [defaultDeadline10] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });

  const [defaultDeadline14] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  // Close on Escape & trap focus
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderContent = () => {
    // 1. Observaciones del Tutor
    if (title.includes('Observaciones')) {
      const observations = (project.decisionLog || []).filter(
        log => log.action.includes('Observación') || log.action.includes('Cambios')
      );
      const latest = observations[0] || project.decisionLog?.[0];

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-(--line)">
            <span className="font-bold text-(--brand) uppercase text-[10px] tracking-wider">
              Etapa #{activeStage.id} &bull; {activeStage.name.split('(')[0]}
            </span>
            <StatusBadge type="stage" value={activeStage.status} />
          </div>

          {latest ? (
            <div className="p-4 bg-(--surface-subtle) rounded-(--radius) border border-(--line2) space-y-2">
              <div className="flex items-center justify-between text-xs">
                <strong className="text-(--ink)">{latest.author}</strong>
                <span className="text-[11px] font-mono text-(--light)">{latest.timestamp}</span>
              </div>
              <p className="text-xs text-(--muted) leading-relaxed border-l-2 border-(--accent) pl-3 py-1 bg-white rounded-r-lg">
                {latest.notes}
              </p>
              {latest.deadline && (
                <div className="text-[11px] text-(--accent) font-semibold pt-1">
                  Fecha límite sugerida: <span className="font-mono">{latest.deadline}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-(--muted)">No hay observaciones registradas para esta etapa.</p>
          )}

          {stageActions?.upload.allowed && (
            <button
              type="button"
              onClick={() => {
                onStudentUploadEvidence();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-(--brand) text-white text-xs font-bold rounded-(--radius) hover:bg-(--brand-hover) transition-colors"
            >
              Preparar y Entregar Nueva Versión
            </button>
          )}
        </div>
      );
    }

    // 2. Criterios Gate 0 (14 Criterios)
    if (title.includes('Gate 0') || title.includes('Criterios')) {
      const completedCount = (project.gate0Items || []).filter(i => i.checked).length;
      return (
        <div className="space-y-4">
          <div className="bg-(--surface-subtle) p-4 rounded-(--radius) border border-(--line2) space-y-2">
            <div className="flex items-center justify-between text-xs">
              <strong className="text-(--ink)">Avance de Criterios</strong>
              <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                completedCount === 14 ? 'bg-(--green-bg) text-(--green)' : 'bg-(--amber-bg) text-(--amber)'
              }`}>
                {completedCount} de 14 Conformes
              </span>
            </div>
            <div className="w-full bg-(--line) rounded-full h-2 overflow-hidden">
              <div
                className="bg-(--green) h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / 14) * 100}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-(--light) leading-tight">
              <strong>Regla Mandatoria:</strong> Completar los 14 criterios de Gate 0 es un prerrequisito técnico, pero <strong>no aprueba automáticamente la etapa</strong>. El tutor debe dictaminar formalmente por separado.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            {(project.gate0Items || []).map((item) => (
              <label
                key={item.id}
                className={`p-3 rounded-(--radius) border flex items-start gap-2.5 transition-all ${
                  role === 'tutor' ? 'cursor-pointer hover:bg-(--surface-subtle)' : 'cursor-default'
                } ${
                  item.checked ? 'bg-(--green-bg)/40 border-(--green-line)' : 'bg-white border-(--line)'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  disabled={role !== 'tutor'}
                  onChange={() => onToggleGateItem(item.id)}
                  className="mt-0.5 h-4 w-4 rounded text-(--green) focus:ring-0 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-(--brand) bg-(--sand) px-1.5 py-0.2 rounded">
                      {item.id}
                    </span>
                    <strong className="text-xs text-(--ink)">{item.label}</strong>
                  </div>
                  <small className="text-[11px] text-(--light) block leading-snug">{item.suggestedCheck}</small>
                </div>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // 3. Guía Metodológica Fase 0 (17 Pasos)
    if (title.includes('Fase 0')) {
      const completedCount = (project.phase0Steps || []).filter(s => s.completed).length;
      return (
        <div className="space-y-4">
          <div className="bg-(--surface-subtle) p-4 rounded-(--radius) border border-(--line2) space-y-2">
            <div className="flex items-center justify-between text-xs">
              <strong className="text-(--ink)">17 Actividades Metodológicas</strong>
              <span className="font-mono font-bold px-2 py-0.5 rounded-full text-[11px] bg-(--sand) text-(--brand)">
                {completedCount} de 17 Completadas
              </span>
            </div>
            <div className="w-full bg-(--line) rounded-full h-2 overflow-hidden">
              <div
                className="bg-(--brand) h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / 17) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {(project.phase0Steps || []).map((step) => (
              <label
                key={step.number}
                className={`p-3 rounded-(--radius) border flex items-start gap-2.5 transition-all cursor-pointer ${
                  step.completed ? 'bg-(--green-bg)/40 border-(--green-line)' : 'bg-white border-(--line) hover:bg-(--surface-subtle)'
                }`}
              >
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => onTogglePhase0Step(step.number)}
                  className="mt-0.5 h-4 w-4 rounded text-(--brand) focus:ring-0 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <strong className="text-xs text-(--ink)">Paso {step.number}: {step.title}</strong>
                  <small className="text-[11px] text-(--light) block leading-snug">{step.description}</small>
                </div>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // 4. Ficha Académica Completa (Dublin Core)
    if (title.includes('Ficha')) {
      return (
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-(--surface-subtle) rounded-(--radius) border border-(--line2) space-y-2.5">
            <span className="font-bold text-[10px] uppercase tracking-wider text-(--brand)">
              Estándar Dublin Core
            </span>
            <h3 className="font-editorial font-bold text-base text-(--ink) leading-tight">
              {project.title}
            </h3>
            <div className="space-y-1.5 text-[11px] text-(--muted) pt-2 border-t border-(--line)">
              <div className="flex justify-between">
                <span>Código Institucional:</span>
                <strong className="font-mono text-(--ink)">{project.institutionalId}</strong>
              </div>
              <div className="flex justify-between">
                <span>Estudiante:</span>
                <strong className="text-(--ink)">{project.student}</strong>
              </div>
              <div className="flex justify-between">
                <span>Correo:</span>
                <span className="font-mono text-(--brand)">{project.studentEmail}</span>
              </div>
              <div className="flex justify-between">
                <span>Tutor Asignado:</span>
                <strong className="text-(--ink)">{project.tutor}</strong>
              </div>
              <div className="flex justify-between">
                <span>Línea Temática:</span>
                <span className="text-(--ink)">{project.thematicLine}</span>
              </div>
              <div className="flex justify-between">
                <span>Departamento:</span>
                <span className="text-(--ink)">{project.department}</span>
              </div>
              <div className="flex justify-between">
                <span>Cohorte:</span>
                <span className="text-(--ink)">{project.cohort}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha Objetivo:</span>
                <span className="font-mono font-bold text-(--amber)">{project.targetDate}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span>Nivel de Riesgo:</span>
                <span title={project.riskReason}>
                  <StatusBadge type="risk" value={project.riskLevel} />
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 5. Formulario de Solicitar Cambios (Tutor)
    if (title.includes('Solicitar cambios')) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const text = e.target.notes.value.trim();
            if (!text) return;
            onTutorRequestChanges({
              notes: text,
              milestone: `Ajuste en ${activeStage.name}`,
              deadline: e.target.deadline.value
            });
            onClose();
          }}
          className="space-y-4 text-xs"
        >
          <div className="p-3 bg-(--red-bg) rounded-(--radius) border border-(--red-line) text-[11px] text-(--red)">
            Al emitir observaciones, el estado de la etapa pasa a <strong>'Cambios solicitados'</strong> y se notifica formalmente al estudiante.
          </div>

          <div>
            <label className="block text-[11px] font-bold text-(--ink) mb-1">
              Observaciones obligatorias:
            </label>
            <textarea
              name="notes"
              required
              rows={5}
              placeholder="Describe de forma concreta las correcciones solicitadas en el documento..."
              className="w-full p-3 rounded-(--radius) border border-(--line2) bg-(--bg) text-(--ink) focus:bg-white focus:outline-hidden leading-relaxed text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-(--ink) mb-1">
              Fecha límite pactada para entrega corregida:
            </label>
            <input
              type="date"
              name="deadline"
              defaultValue={defaultDeadline10}
              className="w-full p-2.5 rounded-(--radius) border border-(--line2) bg-(--bg) text-(--ink)"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-(--red) text-white font-bold rounded-(--radius) hover:bg-(--red-hover) transition-colors"
          >
            Emitir y Registrar Observación
          </button>
        </form>
      );
    }

    // 6. Formulario de Aprobar Etapa (Tutor)
    if (title.includes('Aprobar etapa') || title.includes('Confirmar aprobación')) {
      const isGate0Blocked = activeStage.id === 1 && !gate0Analysis.isFullyCompliant;
      // Otras reglas (no saltar etapas, etapa sin entrega o ya aprobada) vienen de stageMachine.js.
      const approveBlockedReason = !isGate0Blocked && stageActions && !stageActions.approve.allowed
        ? stageActions.approve.reason
        : null;
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isGate0Blocked || approveBlockedReason) return;
            onTutorApproveStage({
              notes: e.target.notes.value.trim(),
              milestone: activeStage.id < 6 ? `Inicio de Etapa ${activeStage.id + 1}` : 'Culminación de Trabajo de Grado',
              deadline: e.target.deadline.value
            });
            onClose();
          }}
          className="space-y-4 text-xs"
        >
          {isGate0Blocked ? (
            <div className="p-3.5 bg-(--red-bg) rounded-(--radius) border border-(--red-line) text-(--red) space-y-1">
              <strong className="block font-bold">⛔ Bloqueo de Regla de Negocio: Gate 0 Incompleto</strong>
              <p className="text-[11px] text-(--muted)">
                Actualmente hay <strong>{gate0Analysis.completedCount} de 14</strong> criterios conformes. Debe certificar el 100% de Gate 0 antes de aprobar la Etapa 1.
              </p>
            </div>
          ) : approveBlockedReason ? (
            <div className="p-3.5 bg-(--red-bg) rounded-(--radius) border border-(--red-line) text-[11px] text-(--red)">
              <strong className="block font-bold">No se puede aprobar esta etapa</strong>
              {approveBlockedReason}
            </div>
          ) : (
            <div className="p-3 bg-(--green-bg) rounded-(--radius) border border-(--green-line) text-[11px] text-(--green)">
              La aprobación formal registrará la fecha actual, habilitará la siguiente etapa del ciclo académico e insertará el registro en la bitácora inmutable.
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-(--ink) mb-1">
              Notas de mérito y dictamen:
            </label>
            <textarea
              name="notes"
              rows={4}
              defaultValue={`Se dictamina la aprobación formal de la etapa ${activeStage.name}. Requisitos y evidencias validadas.`}
              className="w-full p-3 rounded-(--radius) border border-(--line2) bg-(--bg) text-(--ink) focus:bg-white focus:outline-hidden leading-relaxed text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-(--ink) mb-1">
              Fecha estimada siguiente hito:
            </label>
            <input
              type="date"
              name="deadline"
              defaultValue={defaultDeadline14}
              className="w-full p-2.5 rounded-(--radius) border border-(--line2) bg-(--bg) text-(--ink)"
            />
          </div>

          <button
            type="submit"
            disabled={isGate0Blocked || !!approveBlockedReason}
            className={`w-full py-2.5 px-4 font-bold rounded-(--radius) transition-colors ${
              isGate0Blocked || approveBlockedReason
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-(--green) text-white hover:bg-(--green-hover)'
            }`}
          >
            Confirmar Dictamen de Aprobación
          </button>
        </form>
      );
    }

    // 7. Todas las Evidencias
    if (title.includes('Evidencias')) {
      const evidences = project.evidences || [];
      return (
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-(--line)">
            <strong className="text-(--ink)">Versiones Entregadas ({evidences.length})</strong>
            {stageActions?.upload.allowed && (
              <button
                type="button"
                onClick={() => {
                  onStudentUploadEvidence();
                  onClose();
                }}
                className="text-[11px] font-bold text-(--brand) hover:underline"
              >
                + Subir archivo
              </button>
            )}
          </div>

          <div className="space-y-2">
            {evidences.map((ev) => (
              <div key={ev.id} className="p-3 bg-(--bg) rounded-(--radius) border border-(--line) space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-(--ink)">{ev.filename}</strong>
                  <span className="font-mono text-[10px] bg-(--brand) text-white px-1.5 py-0.2 rounded">
                    {ev.version}
                  </span>
                </div>
                <div className="text-[11px] text-(--light)">
                  Etapa #{ev.stageId} &bull; {ev.uploadedBy} &bull; {ev.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 8. Bitácora Completa
    if (title.includes('Bitácora')) {
      const logs = project.decisionLog || [];
      return (
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-(--line)">
            <strong className="text-(--ink)">Historial Inmutable de Decisiones</strong>
            <span className="font-mono text-[11px] text-(--brand)">{logs.length} registros</span>
          </div>

          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-(--bg) rounded-(--radius) border border-(--line) space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <strong className="text-(--ink)">{log.action}</strong>
                  <span className="font-mono text-[10px] text-(--light)">{log.timestamp}</span>
                </div>
                <p className="text-[11px] text-(--muted) leading-relaxed bg-white p-2 rounded-(--radius) border border-(--line)">
                  {log.notes}
                </p>
                <div className="text-[10px] text-(--light)">Autor: {log.author}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 9. Ayuda Contextual / General
    return (
      <div className="space-y-3 text-xs text-(--muted) leading-relaxed">
        <h4 className="font-editorial font-bold text-base text-(--ink)">{title}</h4>
        <p>
          Términos que usa la plataforma. También puedes pasar el cursor sobre las palabras subrayadas
          o sobre las pastillas de estado para ver su significado.
        </p>
        {/* Glosario completo (src/data/glossary.js) — Fase 3 */}
        <dl className="divide-y divide-(--line) border border-(--line) rounded-(--radius) bg-white">
          {Object.entries(GLOSSARY).map(([key, entry]) => (
            <div key={key} className="p-3">
              <dt className="font-bold text-(--brand) text-xs">{entry.term}</dt>
              <dd className="text-[11px] text-(--muted) mt-0.5">{entry.definition}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10" ref={panelRef}>
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-(--line) flex flex-col h-full animate-fade-in-slide">
          {/* Header */}
          <div className="p-5 border-b border-(--line) flex items-center justify-between bg-(--bg)">
            <h2 id="drawer-title" className="font-editorial font-bold text-base text-(--ink) truncate">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-(--radius) text-(--muted) hover:bg-(--sand) hover:text-(--ink) transition-colors"
              aria-label="Cerrar panel contextual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
