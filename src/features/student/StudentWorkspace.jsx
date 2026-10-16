import React from 'react';
import { FileText, Clock, Layers, ChevronRight, Download, Upload } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';

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
  stageActions
}) {
  const approvedCount = (project.stages || []).filter(s => s.status === 'aprobado').length;
  const progressPct = Math.round((approvedCount / 6) * 100);

  // Latest observation
  const observations = (project.decisionLog || []).filter(
    log => log.action.includes('Observación') || log.action.includes('Cambios')
  );
  const latestObservation = observations[0];

  // Latest evidence for active stage
  const currentEvidence = (project.evidences || []).find(e => e.stageId === activeStage.id) ||
    project.evidences?.[0] || {
      filename: `Evidencia_Etapa_${activeStage.id}_v1.0.pdf`,
      version: 'v1.0',
      date: '12 oct. 2026',
      size: '2.4 MB'
    };

  // Next commitment
  const pendingCommitment = (project.commitments || []).find(c => c.status === 'pendiente');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Eyebrow & View Header */}
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-[#887668] mb-1">
          ESPACIO DEL ESTUDIANTE &bull; COHORTE {project.cohort}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-editorial font-bold text-2xl sm:text-3xl text-[#30251F] tracking-tight">
              Mi proyecto
            </h1>
            <p className="text-xs text-[#57534E] mt-0.5">
              Consulta tu avance y continúa donde lo dejaste.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenDrawer('Ficha académica completa')}
            className="text-xs font-bold text-[#6E432F] hover:underline self-start sm:self-auto flex items-center gap-1"
          >
            <span>Ver ficha completa</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Project Bar & 6-Stage Track */}
      <section className="bg-white rounded-2xl border border-[#E8E1D5] p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-editorial font-bold text-xl sm:text-2xl text-[#1C1917] tracking-tight leading-snug">
            {project.title}
          </h2>
          <div className="shrink-0">
            <StatusBadge type="stage" value={activeStage.status} />
          </div>
        </div>

        {/* Metadata Line */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#746A63] border-b border-[#E8E1D5] pb-4">
          <span>Tutor: <strong className="text-[#1C1917]">{project.tutor}</strong></span>
          <span className="text-[#D8CEBF]">&bull;</span>
          <span>Cohorte: <strong className="text-[#1C1917]">{project.cohort}</strong></span>
          <span className="text-[#D8CEBF]">&bull;</span>
          <span>Línea: <strong className="text-[#1C1917]">{project.thematicLine}</strong></span>
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
                      project.stages[i - 1].status === 'aprobado' ? 'bg-[#146C4F]' : 'bg-[#E4DED6]'
                    }`}
                  />
                )}

                {/* Node Circle */}
                <div
                  className={`w-8 h-8 rounded-full grid place-items-center font-bold text-xs z-10 transition-all ${
                    isApproved
                      ? 'bg-[#146C4F] text-white border-2 border-[#146C4F]'
                      : isCurrent
                      ? 'bg-[#FBF1E9] text-[#6E432F] border-2 border-[#6E432F] ring-4 ring-[#F2E4D9]'
                      : 'bg-white text-[#80766D] border-2 border-[#D5CDC3] group-hover:border-[#6E432F]'
                  }`}
                >
                  {isApproved ? '✓' : st.id}
                </div>

                {/* Stage Name */}
                <div className="w-full px-1">
                  <span className={`block font-semibold text-[11px] leading-tight truncate ${
                    isCurrent ? 'text-[#6E432F] font-bold' : 'text-[#57534E]'
                  }`}>
                    Etapa {st.id}: {st.name.split('(')[0]}
                  </span>
                  <span className="block text-[10px] text-[#7C736C]">
                    {isApproved ? 'Aprobado' : isCurrent ? (st.status === 'observado' ? 'Observado' : 'En curso') : 'Pendiente'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Stage Progress Banner */}
        <div className="sm:hidden bg-[#FBF8F4] p-3 rounded-xl border border-[#E8E1D5] space-y-1">
          <strong className="block text-xs font-bold text-[#1C1917]">
            Etapa {activeStage.id} de 6 &bull; {activeStage.name.split('(')[0]}
          </strong>
          <small className="block text-[11px] text-[#57534E]">
            {activeStage.status === 'observado'
              ? 'Cambios solicitados &bull; revisa las observaciones del tutor'
              : activeStage.status === 'aprobado'
              ? 'Etapa aprobada formalmente'
              : 'En desarrollo'}
          </small>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="flex items-center justify-between gap-4 pt-2 text-xs">
          <strong className="text-[#5F5550]">
            {approvedCount} de 6 etapas aprobadas
          </strong>
          <div className="flex-1 max-w-xs bg-[#EAE5DF] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#146C4F] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <strong className="text-[#5F5550] font-mono">{progressPct} %</strong>
        </div>
      </section>

      {/* 2-Column Work Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 cols): Action Card & Evidence */}
        <div className="lg:col-span-7 space-y-5">
          {/* Action Card: "Tu Siguiente Paso" */}
          <section className="bg-gradient-to-br from-[#FFF9F3] to-[#FAF0E7] border border-[#E8D7C7] rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#F1DFD1] text-[#6E432F] grid place-items-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#887668]">
                TU SIGUIENTE PASO
              </p>
              <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#30251F] leading-snug">
                {activeStage.status === 'observado'
                  ? 'Revisa las observaciones y prepara una nueva versión'
                  : activeStage.status === 'en_revision'
                  ? 'Tu evidencia está en proceso de revisión por el tutor'
                  : activeStage.status === 'aprobado'
                  ? 'Has culminado con éxito esta etapa académica'
                  : `Entrega la evidencia formal de la Etapa #${activeStage.id}`}
              </h2>
              <p className="text-xs text-[#645950] leading-relaxed">
                {activeStage.status === 'observado'
                  ? 'El tutor solicitó ajustes en el documento. Consulta sus comentarios detallados antes de entregar la versión corregida.'
                  : activeStage.status === 'en_revision'
                  ? 'El documento fue recibido y el tutor está verificando los criterios metodológicos e institucionales.'
                  : activeStage.status === 'aprobado'
                  ? 'El dictamen ha sido registrado en la bitácora. Puedes continuar con la siguiente etapa en el ciclo de 6 pasos.'
                  : 'Adjunta el documento en formato PDF cumpliendo con los lineamientos metodológicos establecidos.'}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {activeStage.status === 'observado' ? (
                  <button
                    type="button"
                    onClick={() => onOpenDrawer('Observaciones del tutor')}
                    className="px-4 py-2 bg-[#6E432F] text-white text-xs font-bold rounded-xl hover:bg-[#553323] transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Revisar observaciones</span>
                  </button>
                ) : stageActions?.upload.allowed ? (
                  <button
                    type="button"
                    onClick={onUploadEvidence}
                    className="px-4 py-2 bg-[#6E432F] text-white text-xs font-bold rounded-xl hover:bg-[#553323] transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir nueva evidencia</span>
                  </button>
                ) : (
                  // Bloqueado por reglas de etapa (stageMachine.js): se explica en lugar de ocultar.
                  <p className="text-[11px] text-[#8A4B08] self-center" role="note">
                    {stageActions?.upload.reason}
                  </p>
                )}

                {activeStage.id === 1 && (
                  <button
                    type="button"
                    onClick={() => onOpenDrawer('Criterios Gate 0 (14)')}
                    className="px-3.5 py-2 bg-white text-[#6E432F] border border-[#DACABD] text-xs font-bold rounded-xl hover:bg-[#FCF7F1] transition-colors shadow-xs"
                  >
                    Ver criterios Gate 0
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Current Evidence Surface */}
          <section className="bg-white rounded-2xl border border-[#E8E1D5] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
              <h3 className="font-editorial font-bold text-sm text-[#35281F]">
                Evidencia actual &bull; Etapa #{activeStage.id}
              </h3>
              <button
                type="button"
                onClick={() => onOpenDrawer('Todas las evidencias')}
                className="text-xs font-bold text-[#6E432F] hover:underline"
              >
                Ver versiones &rarr;
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#E8E1D5] bg-[#FFFDFC]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F9E4DC] text-[#9A442B] font-bold text-xs grid place-items-center shrink-0">
                  PDF
                </div>
                <div className="min-w-0">
                  <strong className="block text-xs text-[#1C1917] truncate">
                    {currentEvidence.filename}
                  </strong>
                  <small className="block text-[11px] text-[#7C736C]">
                    Versión {currentEvidence.version} &bull; {currentEvidence.date} &bull; {currentEvidence.size}
                  </small>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <StatusBadge type="stage" value={activeStage.status} />
                <button
                  type="button"
                  onClick={() => onOpenDrawer('Todas las evidencias')}
                  className="p-1.5 rounded-lg border border-[#DACABD] hover:bg-[#F5F1EA] text-[#6E432F] transition-colors"
                  title="Descargar copia de la evidencia"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): Commitments & Context Links */}
        <div className="lg:col-span-5 space-y-5">
          {/* Commitments & Latest Observation Surface */}
          <section className="bg-white rounded-2xl border border-[#E8E1D5] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
              <h3 className="font-editorial font-bold text-sm text-[#35281F]">
                Próximo compromiso
              </h3>
              <Clock className="w-4 h-4 text-[#887668]" />
            </div>

            <div className="space-y-1">
              <strong className="block text-sm text-[#332720] font-mono">
                {pendingCommitment ? pendingCommitment.dueDate : 'Sin fecha límite inmediata'}
              </strong>
              <p className="text-xs text-[#57534E]">
                {pendingCommitment ? pendingCommitment.description : 'No hay entregas pendientes con plazo asignado.'}
              </p>
            </div>

            <hr className="border-t border-[#E8E1D5]" />

            <div>
              <h3 className="font-editorial font-bold text-sm text-[#35281F] mb-1.5">
                Última observación del tutor
              </h3>
              {latestObservation ? (
                <>
                  <p className="border-l-2 border-[#CE9F7D] pl-3 py-0.5 text-xs text-[#5E524A] leading-relaxed line-clamp-3">
                    "{latestObservation.notes}"
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenDrawer('Observaciones del tutor')}
                    className="text-xs font-bold text-[#6E432F] hover:underline mt-2 inline-block"
                  >
                    Leer comentario completo &rarr;
                  </button>
                </>
              ) : (
                <p className="text-xs text-[#7C736C]">Sin observaciones registradas.</p>
              )}
            </div>
          </section>

          {/* Context Links Surface */}
          <section className="bg-white rounded-2xl border border-[#E8E1D5] p-5 shadow-sm space-y-2">
            <h3 className="font-editorial font-bold text-sm text-[#35281F] pb-2 border-b border-[#E8E1D5]">
              Consultar más
            </h3>

            <button
              type="button"
              onClick={() => onOpenDrawer('Detalle de etapa')}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[#44372E] hover:text-[#6E432F] border-b border-[#E8E1D5] text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#7C736C]" />
                <span>Qué debes entregar en esta etapa</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7C736C]" />
            </button>

            <button
              type="button"
              onClick={() => onOpenDrawer('Ficha académica completa')}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[#44372E] hover:text-[#6E432F] border-b border-[#E8E1D5] text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#7C736C]" />
                <span>Ficha académica Dublin Core</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7C736C]" />
            </button>

            <button
              type="button"
              onClick={() => onOpenDrawer('Bitácora del proyecto')}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[#44372E] hover:text-[#6E432F] text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7C736C]" />
                <span>Historial de decisiones / Bitácora</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7C736C]" />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
