import React, { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import Term from '../../components/Term.jsx';
import { getLatestEvidence } from '../../domain/evidence.js';
import { getCurrentStage } from '../../domain/progressCalculator.js';

/**
 * TutorWorkspace — Bandeja Maestro-Detalle de Revisión para Tutores (Academic Flow 2.0)
 * Permite seleccionar una entrega, cotejar evidencia y criterios, y emitir decisiones explícitas.
 */
export default function TutorWorkspace({
  projects,
  selectedProjectId,
  onSelectProject,
  activeStageId,
  gate0Analysis,
  onToggleGateItem,
  onOpenDrawer,
  tutorName = 'Carlos G.',
  stageActions
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Evidencia'); // 'Evidencia' | 'Criterios' | 'Observaciones' | 'Historial'

  // Selected project
  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  const activeStage = useMemo(() => {
    return selectedProject.stages.find(s => s.id === activeStageId) || selectedProject.stages[0];
  }, [selectedProject, activeStageId]);

  // Filter queue items
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchText = (p.title + ' ' + p.student + ' ' + p.institutionalId).toLowerCase();
      return matchText.includes(searchTerm.toLowerCase());
    });
  }, [projects, searchTerm]);

  // Current evidence
  // Solo entregas de la etapa que se está revisando (null si no hay ninguna).
  const currentEvidence = getLatestEvidence(selectedProject.evidences, activeStage.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Eyebrow & View Header */}
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-(--light) mb-1">
          ESPACIO DEL TUTOR ({tutorName}) &bull; COHORTE 2026-1
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-(--brand) tracking-tight">
              Pendientes de revisión
            </h1>
            <p className="text-xs text-(--muted) mt-0.5">
              Selecciona una entrega, revisa la evidencia y registra una decisión formal.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-(--amber-bg) text-(--amber) border border-(--amber-line)/60">
              <span>{projects.length} tesis asignadas</span>
            </span>
          </div>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Queue List (5 cols) */}
        <section data-tour="bandeja" className="lg:col-span-5 bg-white rounded-(--radius) border border-(--line) p-4 space-y-3">
          {/* Queue Header & Search */}
          <div className="space-y-2.5 pb-3 border-b border-(--line)">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial font-bold text-sm text-(--ink)">
                Entregas por supervisar
              </h3>
              <span className="text-[11px] font-mono font-bold text-(--brand)">
                {filteredProjects.length} proyectos
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-(--light) absolute left-3 top-2.5" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar proyecto o estudiante..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-(--radius) border border-(--line2) bg-(--bg) text-(--ink) focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Queue Items Scrollable List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredProjects.map((p) => {
              const currentSt = getCurrentStage(p.stages);
              const isSelected = p.id === selectedProject.id;
              const initials = p.student
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('');

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProject(p.id)}
                  className={`w-full text-left p-3 rounded-(--radius) border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-(--surface-subtle) border-(--line) ring-2 ring-(--brand)/15'
                      : 'bg-white border-(--line) hover:bg-(--surface-subtle)'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="w-8 h-8 rounded-full bg-(--line2) text-(--brand) font-bold text-xs grid place-items-center shrink-0">
                    {initials}
                  </span>

                  <div className="min-w-0 flex-1 space-y-1">
                    <strong className="block text-xs text-(--ink) truncate leading-tight font-editorial">
                      {p.title}
                    </strong>
                    <small className="block text-[11px] text-(--light) truncate">
                      {p.student} &bull; Etapa {currentSt.id} &bull; {currentSt.name.split('(')[0]}
                    </small>
                    <div className="pt-0.5 flex flex-wrap gap-1.5">
                      <StatusBadge type="stage" value={currentSt.status} />
                      {p.riskLevel !== 'Bajo' && (
                        <span title={p.riskReason}>
                          <StatusBadge type="risk" value={p.riskLevel} />
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-(--light) font-bold text-sm shrink-0 self-center">&rarr;</span>
                </button>
              );
            })}

            {filteredProjects.length === 0 && (
              <div className="p-6 text-center text-xs text-(--muted) border border-dashed border-(--line2) rounded-(--radius)">
                No se encontraron proyectos con los términos de búsqueda.
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Review Detail Workspace (7 cols) */}
        <section className="lg:col-span-7 bg-white rounded-(--radius) border border-(--line) p-5 sm:p-6 flex flex-col min-h-[580px] space-y-5">
          {/* Submission Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-(--line)">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-(--light)">
                ENTREGA SELECCIONADA &bull; {selectedProject.student}
              </p>
              <h2 className="font-editorial font-bold text-lg sm:text-xl text-(--ink) leading-snug">
                {selectedProject.title}
              </h2>
              <div className="text-xs text-(--muted)">
                Etapa {activeStage.id} &bull; {activeStage.name}{currentEvidence ? ` • Versión ${currentEvidence.version}` : ''}
              </div>
            </div>

            <div className="shrink-0">
              <StatusBadge type="stage" value={activeStage.status} />
            </div>
          </div>

          {/* Tabbar */}
          <div data-tour="pestanas" className="flex items-center gap-6 border-b border-(--line) text-xs font-semibold" role="tablist">
            {['Evidencia', 'Criterios', 'Observaciones', 'Historial'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 transition-all relative ${
                  activeTab === tab
                    ? 'text-(--brand) font-bold border-b-2 border-(--brand)'
                    : 'text-(--muted) hover:text-(--ink)'
                }`}
                role="tab"
                aria-selected={activeTab === tab}
              >
                {tab}
                {tab === 'Criterios' && activeStage.id === 1 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-(--green-bg) text-(--green) border border-(--green-line)">
                    {gate0Analysis.completedCount}/14
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 space-y-4 text-xs">
            {/* TAB 1: EVIDENCIA */}
            {activeTab === 'Evidencia' && (
              <div className="space-y-4">
                {!currentEvidence ? (
                  <p className="p-4 rounded-(--radius) border border-dashed border-(--line2) text-xs text-(--muted)">
                    El estudiante aún no ha entregado nada en esta etapa.
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
                        {currentEvidence.version} &bull; {currentEvidence.size} &bull; Enviado el {currentEvidence.date}
                      </small>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenDrawer('Todas las evidencias')}
                      className="px-3 py-1.5 text-xs font-semibold text-(--brand) bg-(--sand) hover:bg-(--hover) rounded-(--radius) border border-(--line2) transition-colors"
                    >
                      Ver documento
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDrawer('Todas las evidencias')}
                      className="p-1.5 rounded-(--radius) border border-(--line2) hover:bg-(--sand) text-(--muted)"
                      title="Descargar copia"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                )}

                <div className="p-4 bg-(--surface-subtle) rounded-(--radius) border border-(--line2) space-y-1">
                  <h4 className="font-bold text-xs text-(--ink)">Revisión de la evidencia</h4>
                  <p className="text-[11px] text-(--muted) leading-relaxed">
                    Compara el archivo entregado con los criterios metodológicos de la etapa y las observaciones previas antes de asentar tu dictamen.
                  </p>
                </div>

                {activeStage.id === 1 && (
                  <div className="p-4 bg-(--amber-bg) rounded-(--radius) border border-(--amber-line) space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-(--amber)">Auditoría <Term id="gate0">Gate 0</Term> (14 criterios)</strong>
                      <span className="font-mono font-bold text-xs text-(--amber)">
                        {gate0Analysis.completedCount}/14 Conformes
                      </span>
                    </div>
                    <div className="w-full bg-(--line) rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-(--green) h-1.5 rounded-full"
                        style={{ width: `${(gate0Analysis.completedCount / 14) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-(--muted)">
                      Para aprobar la Etapa 1, los 14 criterios de Gate 0 deben estar conformes.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CRITERIOS */}
            {activeTab === 'Criterios' && (
              <div className="space-y-3">
                {activeStage.id === 1 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-(--line)">
                      <span className="font-bold text-xs text-(--ink)">Criterios <Term id="gate0">Gate 0</Term> (Etapa 1)</span>
                      <button
                        type="button"
                        onClick={() => onOpenDrawer('Criterios Gate 0 (14)')}
                        className="text-[11px] font-bold text-(--brand) hover:underline"
                      >
                        Abrir panel extendido &rarr;
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {/* Campos según src/data/gate0Catalog.js: id, label, suggestedCheck (ver docs/CAMBIOS.md, Fase 1) */}
                      {(selectedProject.gate0Items || []).map((item) => (
                        <label
                          key={item.id}
                          className={`p-2.5 rounded-(--radius) border flex items-start gap-2.5 cursor-pointer transition-all ${
                            item.checked ? 'bg-(--green-bg)/40 border-(--green-line)' : 'bg-(--bg) border-(--line) hover:bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => onToggleGateItem(item.id)}
                            className="mt-0.5 h-4 w-4 rounded text-(--green) focus:ring-0 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-(--brand) bg-(--sand) px-1 rounded">
                                {item.id}
                              </span>
                              <strong className="text-xs text-(--ink)">{item.label}</strong>
                            </div>
                            <small className="text-[11px] text-(--light) block leading-tight">{item.suggestedCheck}</small>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-(--surface-subtle) rounded-(--radius) border border-(--line2) text-center space-y-2">
                    <h4 className="font-editorial font-bold text-sm text-(--ink)">
                      Criterios de Etapa #{activeStage.id}: {activeStage.name}
                    </h4>
                    <p className="text-xs text-(--muted) max-w-md mx-auto">
                      Verifica la coherencia del contenido, fuentes académicas y rigurosidad metodológica antes de emitir la decisión.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: OBSERVACIONES */}
            {activeTab === 'Observaciones' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-(--line)">
                  <strong className="text-xs text-(--ink)">Historial de Observaciones</strong>
                  {stageActions?.requestChanges.allowed && (
                    <button
                      type="button"
                      onClick={() => onOpenDrawer('Solicitar cambios')}
                      className="text-[11px] font-bold text-(--brand) hover:underline"
                    >
                      + Registrar nueva observación
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {(selectedProject.decisionLog || [])
                    .filter(log => log.action.includes('Observación') || log.action.includes('Cambios'))
                    .map((log) => (
                      <div key={log.id} className="p-3 bg-(--surface-subtle) rounded-(--radius) border border-(--line) space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-(--ink)">{log.action}</strong>
                          <span className="font-mono text-[10px] text-(--light)">{log.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-(--muted) leading-relaxed bg-white p-2 rounded-(--radius) border border-(--line)">
                          {log.notes}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB 4: HISTORIAL */}
            {activeTab === 'Historial' && (
              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {(selectedProject.decisionLog || []).map((log) => (
                  <div key={log.id} className="p-2.5 bg-(--bg) rounded-(--radius) border border-(--line) space-y-1">
                    <div className="flex justify-between text-xs">
                      <strong className="text-(--ink)">{log.action}</strong>
                      <span className="font-mono text-[10px] text-(--light)">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-(--muted)">{log.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fixed Review Decision Buttons */}
          <div data-tour="decision" className="pt-4 border-t border-(--line) flex flex-wrap items-center justify-end gap-3 mt-auto">
            {/* Motivo visible cuando una acción está bloqueada por las reglas de stageMachine.js */}
            {stageActions && !stageActions.approve.allowed && (
              <p className="text-[11px] text-(--amber) mr-auto" role="note">
                {stageActions.approve.reason}
              </p>
            )}
            <button
              type="button"
              onClick={() => onOpenDrawer('Solicitar cambios')}
              disabled={!stageActions?.requestChanges.allowed}
              title={stageActions?.requestChanges.reason}
              className="px-4 py-2 text-xs font-bold rounded-(--radius) bg-white text-(--brand) hover:bg-(--surface-subtle) border border-(--line2) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Solicitar cambios
            </button>

            <button
              type="button"
              onClick={() => onOpenDrawer('Confirmar aprobación')}
              disabled={!stageActions?.approve.allowed}
              title={stageActions?.approve.reason}
              className="px-4 py-2 text-xs font-bold rounded-(--radius) bg-(--brand) text-white hover:bg-(--brand-hover) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aprobar etapa
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
