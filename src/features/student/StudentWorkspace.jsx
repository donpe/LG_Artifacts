import React from 'react';
import { FileText, Clock, Layers, ChevronRight, Download, Upload } from 'lucide-react';
import Term from '../../components/Term.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { getLatestEvidence } from '../../domain/evidence.js';
import { getCurrentStage } from '../../domain/progressCalculator.js';

/**
 * StudentWorkspace — Espacio de Trabajo del Estudiante (Academic Flow 2.0)
 * Visualización clara, una sola acción prioritaria por pantalla, rail de 6 etapas y enlaces contextuales.
 */
export default function StudentWorkspace({
  project,
  activeStage,
  onSelectStage,
  onOpenDrawer,
  onUploadEvidence,
  stageActions,
  onNavigate
}) {
  const approvedCount = (project.stages || []).filter(s => s.status === 'aprobado').length;
  const progressPct = Math.round((approvedCount / 6) * 100);

  // Latest observation
  const observations = (project.decisionLog || []).filter(
    log => log.action.includes('Observación') || log.action.includes('Cambios')
  );
  const latestObservation = observations[0];

  // Latest evidence for active stage
  // Solo entregas de la etapa que se está viendo (null si no hay ninguna).
  const currentEvidence = getLatestEvidence(project.evidences, activeStage.id);

  // Etapa en la que realmente va el proyecto (puede ser distinta de la que el estudiante está mirando).
  const currentStage = getCurrentStage(project.stages || []);
  const isViewingOtherStage = currentStage && currentStage.id !== activeStage.id;
  const isLocked = activeStage.status === 'pendiente' && !stageActions?.upload.allowed;

  // Texto corto del estado de cada etapa en el riel (Fase 3: mensajes claros).
  const railLabel = (st) => {
    if (st.status === 'aprobado') return 'Aprobada';
    if (st.status === 'en_revision') return 'En revisión';
    if (st.status === 'observado') return 'Cambios solicitados';
    const prev = project.stages.find(x => x.id === st.id - 1);
    return !prev || prev.status === 'aprobado' ? 'Por entregar' : 'Bloqueada';
  };

  // Next commitment
  const pendingCommitment = (project.commitments || []).find(c => c.status === 'pendiente');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Eyebrow & View Header */}
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-(--light) mb-1">
          ESPACIO DEL ESTUDIANTE &bull; COHORTE {project.cohort}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-(--brand) tracking-tight">
              Mi proyecto
            </h1>
            <p className="text-xs text-(--muted) mt-0.5">
              Consulta tu avance y continúa donde lo dejaste.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenDrawer('Ficha académica completa')}
            className="text-xs font-bold text-(--brand) hover:underline self-start sm:self-auto flex items-center gap-1"
          >
            <span>Ver ficha completa</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Project Bar & 6-Stage Track */}
      <section data-tour="riel-etapas" className="bg-white rounded-(--radius) border border-(--line) p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-editorial font-bold text-xl sm:text-2xl text-(--ink) tracking-tight leading-snug">
            {project.title}
          </h2>
          <div className="shrink-0">
            <StatusBadge type="stage" value={activeStage.status} />
          </div>
        </div>

        {/* Metadata Line */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-(--light) border-b border-(--line) pb-4">
          <span>Tutor: <strong className="text-(--ink)">{project.tutor}</strong></span>
          <span className="text-(--line2)">&bull;</span>
          <span>Cohorte: <strong className="text-(--ink)">{project.cohort}</strong></span>
          <span className="text-(--line2)">&bull;</span>
          <span>Línea: <strong className="text-(--ink)">{project.thematicLine}</strong></span>
        </div>

        {/* Desktop 6-Stage Node Track */}
        <div className="hidden sm:grid grid-cols-6 gap-0 pt-2 relative">
          {project.stages.map((st, i) => {
            const isApproved = st.status === 'aprobado';
            const isCurrent = st.id === activeStage.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => onSelectStage(st.id)}
                className="group relative flex flex-col items-center gap-2 text-center text-xs focus:outline-hidden"
              >
                {/* Connecting Line */}
                {i > 0 && (
                  <div
                    className={`absolute top-4 -left-1/2 right-1/2 h-0.5 z-0 ${
                      project.stages[i - 1].status === 'aprobado' ? 'bg-(--green)' : 'bg-(--line)'
                    }`}
                  />
                )}

                {/* Node Circle */}
                <div
                  className={`w-8 h-8 rounded-full grid place-items-center font-bold text-xs z-10 transition-all ${
                    isApproved
                      ? 'bg-(--green) text-white border-2 border-(--green)'
                      : isCurrent
                      ? 'bg-(--surface-subtle) text-(--brand) border-2 border-(--brand) ring-4 ring-(--line)'
                      : 'bg-white text-(--light) border-2 border-(--line2) group-hover:border-(--brand)'
                  }`}
                >
                  {isApproved ? '✓' : st.id}
                </div>

                {/* Stage Name */}
                <div className="w-full px-1">
                  <span className={`block font-semibold text-[11px] leading-tight truncate ${
                    isCurrent ? 'text-(--brand) font-bold' : 'text-(--muted)'
                  }`}>
                    Etapa {st.id}: {st.name.split('(')[0]}
                  </span>
                  <span className="block text-[10px] text-(--light)">
                    {railLabel(st)}{isCurrent ? ' · viendo' : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Stage Progress Banner */}
        <div className="sm:hidden bg-(--surface-subtle) p-3 rounded-(--radius) border border-(--line) space-y-1">
          <strong className="block text-xs font-bold text-(--ink)">
            Etapa {activeStage.id} de 6 &bull; {activeStage.name.split('(')[0]}
          </strong>
          <small className="block text-[11px] text-(--muted)">
            {activeStage.status === 'observado'
              ? 'Cambios solicitados • revisa las observaciones del tutor'
              : railLabel(activeStage)}
          </small>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="flex items-center justify-between gap-4 pt-2 text-xs">
          <strong className="text-(--muted)">
            {approvedCount} de 6 etapas aprobadas
          </strong>
          <div className="flex-1 max-w-xs bg-(--line) rounded-full h-2 overflow-hidden">
            <div
              className="bg-(--green) h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <strong className="text-(--muted) font-mono">{progressPct} %</strong>
        </div>
      </section>

      {/* 2-Column Work Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 cols): Action Card & Evidence */}
        <div className="lg:col-span-7 space-y-5">
          {/* Action Card: "Tu Siguiente Paso" */}
          <section data-tour="siguiente-paso" className="bg-gradient-to-br from-(--surface-subtle) to-(--surface-subtle) border border-(--line) rounded-(--radius) p-6 flex items-start gap-4">
            <div className="w-11 h-11 rounded-(--radius) bg-(--line) text-(--brand) grid place-items-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-(--light)">
                TU SIGUIENTE PASO
              </p>
              <h2 className="font-editorial font-bold text-lg sm:text-xl text-(--ink) leading-snug">
                {activeStage.status === 'observado'
                  ? 'Revisa las observaciones y prepara una nueva versión'
                  : activeStage.status === 'en_revision'
                  ? 'Tu entrega está en revisión del tutor'
                  : activeStage.status === 'aprobado'
                  ? `La Etapa ${activeStage.id} ya está aprobada`
                  : isLocked
                  ? `La Etapa ${activeStage.id} aún no está habilitada`
                  : `Entrega la evidencia de la Etapa ${activeStage.id}`}
              </h2>
              <p className="text-xs text-(--muted) leading-relaxed">
                {activeStage.status === 'observado'
                  ? 'El tutor solicitó ajustes en el documento. Consulta sus comentarios detallados antes de entregar la versión corregida.'
                  : activeStage.status === 'en_revision'
                  ? 'El tutor recibió tu documento y está revisando los criterios de la etapa. Si necesitas corregir algo antes de su respuesta, puedes subir una nueva versión.'
                  : activeStage.status === 'aprobado'
                  ? 'La aprobación quedó registrada en la bitácora. No necesitas hacer nada más en esta etapa.'
                  : isLocked
                  ? `Se habilita cuando el tutor apruebe la Etapa ${activeStage.id - 1}. Por ahora tu trabajo está en la Etapa ${currentStage.id}.`
                  : 'Sube el documento de la etapa (PDF) para que el tutor lo revise.'}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {activeStage.status === 'observado' ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('etapas', activeStage.id)}
                    className="px-4 py-2 bg-(--brand) text-white text-xs font-bold rounded-(--radius) hover:bg-(--brand-hover) transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Revisar observaciones</span>
                  </button>
                ) : stageActions?.upload.allowed ? (
                  <button
                    type="button"
                    onClick={onUploadEvidence}
                    className="px-4 py-2 bg-(--brand) text-white text-xs font-bold rounded-(--radius) hover:bg-(--brand-hover) transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{activeStage.status === 'en_revision' ? 'Subir nueva versión' : 'Subir evidencia'}</span>
                  </button>
                ) : isViewingOtherStage ? (
                  // Etapa aprobada o bloqueada: la acción útil es volver a la etapa en curso.
                  <button
                    type="button"
                    onClick={() => onSelectStage(currentStage.id)}
                    className="px-4 py-2 bg-(--brand) text-white text-xs font-bold rounded-(--radius) hover:bg-(--brand-hover) transition-colors"
                  >
                    Ir a mi etapa actual (Etapa {currentStage.id})
                  </button>
                ) : (
                  // Bloqueado por reglas de etapa (stageMachine.js): se explica en lugar de ocultar.
                  <p className="text-[11px] text-(--amber) self-center" role="note">
                    {stageActions?.upload.reason}
                  </p>
                )}

                {activeStage.id === 1 && (
                  <button
                    type="button"
                    onClick={() => onNavigate('etapas', 1)}
                    className="px-3.5 py-2 bg-white text-(--brand) border border-(--line2) text-xs font-bold rounded-(--radius) hover:bg-(--surface-subtle) transition-colors"
                  >
                    Ver criterios Gate 0
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Current Evidence Surface */}
          <section className="bg-white rounded-(--radius) border border-(--line) p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-(--line)">
              <h3 className="font-editorial font-bold text-sm text-(--ink)">
                <Term id="evidencia">Evidencia</Term> actual &bull; Etapa #{activeStage.id}
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('entregas')}
                className="text-xs font-bold text-(--brand) hover:underline"
              >
                Ver versiones &rarr;
              </button>
            </div>

            {!currentEvidence ? (
              <p className="p-4 rounded-(--radius) border border-dashed border-(--line2) text-xs text-(--muted)">
                Aún no hay entregas en esta etapa.
              </p>
            ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-(--radius) border border-(--line) bg-(--surface-subtle)">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-(--radius) bg-(--accent-soft) text-(--accent) font-bold text-xs grid place-items-center shrink-0">
                  PDF
                </div>
                <div className="min-w-0">
                  <strong className="block text-xs text-(--ink) truncate">
                    {currentEvidence.filename}
                  </strong>
                  <small className="block text-[11px] text-(--light)">
                    Versión {currentEvidence.version} &bull; {currentEvidence.date} &bull; {currentEvidence.size}
                  </small>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <StatusBadge type="stage" value={activeStage.status} />
                <button
                  type="button"
                  onClick={() => onNavigate('entregas')}
                  className="p-1.5 rounded-(--radius) border border-(--line2) hover:bg-(--sand) text-(--brand) transition-colors"
                  title="Descargar copia de la evidencia"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            )}
          </section>
        </div>

        {/* Right Column (5 cols): Commitments & Context Links */}
        <div className="lg:col-span-5 space-y-5">
          {/* Commitments & Latest Observation Surface */}
          <section data-tour="compromiso" className="bg-white rounded-(--radius) border border-(--line) p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-(--line)">
              <h3 className="font-editorial font-bold text-sm text-(--ink)">
                Próximo <Term id="compromiso">compromiso</Term>
              </h3>
              <Clock className="w-4 h-4 text-(--light)" />
            </div>

            <div className="space-y-1">
              <strong className="block text-sm text-(--ink) font-mono">
                {pendingCommitment ? pendingCommitment.dueDate : 'Sin fecha límite inmediata'}
              </strong>
              <p className="text-xs text-(--muted)">
                {pendingCommitment ? pendingCommitment.description : 'No hay entregas pendientes con plazo asignado.'}
              </p>
            </div>

            <hr className="border-t border-(--line)" />

            <div>
              <h3 className="font-editorial font-bold text-sm text-(--ink) mb-1.5">
                Última observación del tutor
              </h3>
              {latestObservation ? (
                <>
                  <p className="border-l-2 border-(--line2) pl-3 py-0.5 text-xs text-(--muted) leading-relaxed line-clamp-3">
                    "{latestObservation.notes}"
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('etapas', activeStage.id)}
                    className="text-xs font-bold text-(--brand) hover:underline mt-2 inline-block"
                  >
                    Leer comentario completo &rarr;
                  </button>
                </>
              ) : (
                <p className="text-xs text-(--light)">Sin observaciones registradas.</p>
              )}
            </div>
          </section>

          {/* Context Links Surface */}
          <section className="bg-white rounded-(--radius) border border-(--line) p-5 space-y-2">
            <h3 className="font-editorial font-bold text-sm text-(--ink) pb-2 border-b border-(--line)">
              Consultar más
            </h3>

            <button
              type="button"
              onClick={() => onNavigate('etapas', activeStage.id)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-(--ink) hover:text-(--brand) border-b border-(--line) text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-(--light)" />
                <span>Qué debes entregar en esta etapa</span>
              </div>
              <ChevronRight className="w-4 h-4 text-(--light)" />
            </button>

            <button
              type="button"
              onClick={() => onOpenDrawer('Ficha académica completa')}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-(--ink) hover:text-(--brand) border-b border-(--line) text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-(--light)" />
                <span>Ficha académica Dublin Core</span>
              </div>
              <ChevronRight className="w-4 h-4 text-(--light)" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('bitacora')}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-(--ink) hover:text-(--brand) text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-(--light)" />
                <span>Historial de decisiones / <Term id="bitacora">Bitácora</Term></span>
              </div>
              <ChevronRight className="w-4 h-4 text-(--light)" />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
