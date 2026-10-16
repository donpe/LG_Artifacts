import React from 'react';
import { Upload, CheckCircle2, MessageSquareWarning } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import Term from '../../components/Term.jsx';
import { getStageEvidences } from '../../domain/evidence.js';
import { getStageLog } from '../../domain/projectLog.js';

/**
 * StagesView — Riel de las 6 etapas y detalle de la etapa elegida (Fase 4).
 * Se usa en "Etapas" del estudiante y en la pestaña "Etapas" de la ficha del proyecto.
 *
 * Muestra, para la etapa elegida: estado, entregas de esa etapa, observaciones y decisiones de esa
 * etapa, los 14 criterios de Gate 0 (solo en la etapa 1) y las acciones permitidas según el rol.
 * Las acciones se piden a quien lo usa con onAction('upload' | 'approve' | 'request-changes').
 */
export default function StagesView({
  project,
  activeStage,
  onSelectStage,
  role,
  stageActions,
  gate0Analysis,
  onToggleGateItem,
  onAction
}) {
  const stages = project.stages || [];
  const evidences = getStageEvidences(project.evidences, activeStage.id);
  const log = getStageLog(project, activeStage);

  const railLabel = (st) => {
    if (st.status === 'aprobado') return 'Aprobada';
    if (st.status === 'en_revision') return 'En revisión';
    if (st.status === 'observado') return 'Cambios solicitados';
    const prev = stages.find(x => x.id === st.id - 1);
    return !prev || prev.status === 'aprobado' ? 'Por entregar' : 'Bloqueada';
  };

  return (
    <div className="space-y-5">
      {/* Riel de etapas */}
      <nav aria-label="Etapas del trabajo de grado" className="bg-white border border-(--line) rounded-(--radius) p-3">
        <ol className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {stages.map(st => {
            const isActive = st.id === activeStage.id;
            const isApproved = st.status === 'aprobado';
            return (
              <li key={st.id}>
                <button
                  type="button"
                  onClick={() => onSelectStage(st.id)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`w-full text-left p-2.5 rounded-(--radius) border-b-4 transition-colors ${
                    isActive ? 'bg-(--accent-soft) border-(--brand)' : 'border-transparent hover:bg-(--surface-subtle)'
                  }`}
                >
                  <span className={`flex items-center gap-1 text-[11px] font-bold ${isApproved ? 'text-(--green)' : 'text-(--accent)'}`}>
                    {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />} Etapa {st.id}
                  </span>
                  <strong className="block text-xs text-(--ink) leading-tight truncate">{st.name.replace(' (Gate 0)', '')}</strong>
                  <span className="block text-[10px] text-(--light)">{railLabel(st)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Detalle de la etapa */}
        <section className="lg:col-span-7 bg-white border border-(--line) rounded-(--radius) p-5 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-(--accent)">Etapa {activeStage.id} de 6</p>
              <h2 className="font-editorial text-xl text-(--ink)">{activeStage.name}</h2>
              <p className="text-xs text-(--muted) mt-1">{activeStage.description}</p>
            </div>
            <StatusBadge type="stage" value={activeStage.status} />
          </div>

          {/* Entregas de esta etapa */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-(--ink)">
              <Term id="evidencia">Entregas</Term> de esta etapa ({evidences.length})
            </h3>
            {evidences.length === 0 ? (
              <p className="p-3 rounded-(--radius) border border-dashed border-(--line2) text-xs text-(--muted)">
                Aún no hay entregas en esta etapa.
              </p>
            ) : (
              <ul className="space-y-2">
                {evidences.map((ev, i) => (
                  <li key={ev.id} className="flex items-center justify-between gap-3 p-3 rounded-(--radius) border border-(--line) bg-(--surface-subtle)">
                    <div className="min-w-0">
                      <strong className="block text-xs text-(--ink) truncate">{ev.filename}</strong>
                      <small className="text-[11px] text-(--light)">{ev.uploadedBy} &bull; {ev.date} &bull; {ev.size}</small>
                    </div>
                    <span className={`shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded ${i === 0 ? 'bg-(--brand) text-white' : 'bg-(--sand) text-(--muted)'}`}>
                      {ev.version}{i === 0 ? ' · última' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Acciones según el rol (las reglas vienen de stageMachine.js) */}
          {role === 'estudiante' && (
            <div className="pt-4 border-t border-(--line)">
              {stageActions?.upload.allowed ? (
                <button
                  type="button"
                  onClick={() => onAction('upload')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-(--radius) bg-(--brand) text-(--on-brand) text-xs font-bold hover:bg-(--brand-hover)"
                >
                  <Upload className="w-4 h-4" />
                  {activeStage.status === 'en_revision' ? 'Subir nueva versión' : 'Subir entrega'}
                </button>
              ) : (
                <p className="text-[11px] text-(--amber)" role="note">{stageActions?.upload.reason}</p>
              )}
            </div>
          )}
          {role === 'tutor' && (
            <div data-tour="decision" className="pt-4 border-t border-(--line) flex flex-wrap items-center justify-end gap-3">
              {!stageActions?.approve.allowed && (
                <p className="text-[11px] text-(--amber) mr-auto" role="note">{stageActions?.approve.reason}</p>
              )}
              <button
                type="button"
                onClick={() => onAction('request-changes')}
                disabled={!stageActions?.requestChanges.allowed}
                title={stageActions?.requestChanges.reason}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-(--radius) border border-(--line2) bg-white text-(--brand) text-xs font-bold hover:bg-(--surface-subtle) disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquareWarning className="w-4 h-4" /> Solicitar cambios
              </button>
              <button
                type="button"
                onClick={() => onAction('approve')}
                disabled={!stageActions?.approve.allowed}
                title={stageActions?.approve.reason}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-(--radius) bg-(--brand) text-(--on-brand) text-xs font-bold hover:bg-(--brand-hover) disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" /> Aprobar etapa
              </button>
            </div>
          )}
        </section>

        <div className="lg:col-span-5 space-y-5">
          {/* Gate 0 (solo etapa 1) */}
          {activeStage.id === 1 && (
            <section className="bg-white border border-(--line) rounded-(--radius) p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-(--ink)">
                  Criterios <Term id="gate0">Gate 0</Term>
                </h3>
                <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  gate0Analysis.isFullyCompliant ? 'bg-(--green-bg) text-(--green)' : 'bg-(--amber-bg) text-(--amber)'
                }`}>
                  {gate0Analysis.completedCount}/14
                </span>
              </div>
              <p className="text-[11px] text-(--muted)">
                {role === 'tutor'
                  ? 'Marca cada criterio que el protocolo cumple. Con los 14 se habilita la aprobación.'
                  : 'El tutor marca cada criterio que tu protocolo cumple.'}
              </p>
              <ul className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {(project.gate0Items || []).map(item => (
                  <li key={item.id}>
                    <label className={`flex items-start gap-2 p-2 rounded-(--radius) border text-xs ${
                      item.checked ? 'bg-(--green-bg) border-(--green-line)' : 'bg-white border-(--line)'
                    } ${role === 'tutor' ? 'cursor-pointer' : ''}`}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        disabled={role !== 'tutor'}
                        onChange={() => onToggleGateItem(item.id)}
                        className="mt-0.5 h-4 w-4"
                      />
                      <span>
                        <span className="font-mono text-[10px] font-bold text-(--brand) mr-1">{item.id}</span>
                        {item.label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Observaciones y decisiones de esta etapa */}
          <section className="bg-white border border-(--line) rounded-(--radius) p-5 space-y-3">
            <h3 className="text-xs font-bold text-(--ink)">Observaciones y decisiones de esta etapa</h3>
            {log.length === 0 ? (
              <p className="text-xs text-(--muted)">Todavía no hay registros para esta etapa.</p>
            ) : (
              <ul className="space-y-2">
                {log.map(entry => (
                  <li key={entry.id} className="p-3 rounded-(--radius) border border-(--line) bg-(--surface-subtle) space-y-1">
                    <div className="flex justify-between gap-2 text-[11px]">
                      <strong className="text-(--ink)">{entry.action}</strong>
                      <span className="font-mono text-(--light) shrink-0">{entry.timestamp}</span>
                    </div>
                    <p className="text-xs text-(--muted) leading-relaxed">{entry.notes}</p>
                    <p className="text-[10px] text-(--light)">{entry.author}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
