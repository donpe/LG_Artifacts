import React, { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
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
  stageActions,
  tutors = [],
  demoTutorId,
  onDemoTutorChange
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
  const currentEvidence = (selectedProject.evidences || []).find(e => e.stageId === activeStage.id) ||
    selectedProject.evidences?.[0] || {
      filename: `Evidencia_Etapa_${activeStage.id}_v1.2.pdf`,
      version: 'v1.2',
      date: '12 oct. 2026',
      size: '2.4 MB'
    };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Eyebrow & View Header */}
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-[#887668] mb-1">
          ESPACIO DEL TUTOR ({tutorName}) &bull; COHORTE 2026-1
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-editorial font-bold text-2xl sm:text-3xl text-[#30251F] tracking-tight">
              Pendientes de revisión
            </h1>
            <p className="text-xs text-[#57534E] mt-0.5">
              Selecciona una entrega, revisa la evidencia y registra una decisión formal.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Modo demo: elegir qué tutor se simula. Cada tutor solo ve sus proyectos asignados. */}
            {tutors.length > 0 && (
              <label className="flex items-center gap-1.5 text-xs text-[#57534E]">
                <span>Ver como:</span>
                <select
                  value={demoTutorId}
                  onChange={(e) => onDemoTutorChange(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-[#D8CEBF] bg-white text-xs font-semibold text-[#1C1917]"
                >
                  {tutors.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFFBEB] text-[#8A4B08] border border-[#FCD34D]/60">
              <span>{projects.length} tesis asignadas</span>
            </span>
          </div>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Queue List (5 cols) */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-sm space-y-3">
          {/* Queue Header & Search */}
          <div className="space-y-2.5 pb-3 border-b border-[#E8E1D5]">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial font-bold text-sm text-[#1C1917]">
                Entregas por supervisar
              </h3>
              <span className="text-[11px] font-mono font-bold text-[#6E432F]">
                {filteredProjects.length} proyectos
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#8F8881] absolute left-3 top-2.5" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar proyecto o estudiante..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D8CEBF] bg-[#FBF9F5] text-[#1C1917] focus:bg-white focus:outline-hidden"
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
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#F9F3ED] border-[#E4CDBA] ring-2 ring-[#6E432F]/15 shadow-xs'
                      : 'bg-white border-[#E8E1D5] hover:bg-[#FBF6F0]'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="w-8 h-8 rounded-full bg-[#D5C2AF] text-[#5A3526] font-bold text-xs grid place-items-center shrink-0">
                    {initials}
                  </span>

                  <div className="min-w-0 flex-1 space-y-1">
                    <strong className="block text-xs text-[#1C1917] truncate leading-tight font-editorial">
                      {p.title}
                    </strong>
                    <small className="block text-[11px] text-[#746A62] truncate">
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

                  <span className="text-[#8F8881] font-bold text-sm shrink-0 self-center">&rarr;</span>
                </button>
              );
            })}

            {filteredProjects.length === 0 && (
              <div className="p-6 text-center text-xs text-[#57534E] border border-dashed border-[#D8CEBF] rounded-xl">
                No se encontraron proyectos con los términos de búsqueda.
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Review Detail Workspace (7 cols) */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-[#E8E1D5] p-5 sm:p-6 shadow-sm flex flex-col min-h-[580px] space-y-5">
          {/* Submission Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E1D5]">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#887668]">
                ENTREGA SELECCIONADA &bull; {selectedProject.student}
              </p>
              <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#1C1917] leading-snug">
                {selectedProject.title}
              </h2>
              <div className="text-xs text-[#57534E]">
                Etapa {activeStage.id} &bull; {activeStage.name} &bull; Versión {currentEvidence.version}
              </div>
            </div>

            <div className="shrink-0">
              <StatusBadge type="stage" value={activeStage.status} />
            </div>
          </div>

          {/* Tabbar */}
          <div className="flex items-center gap-6 border-b border-[#E8E1D5] text-xs font-semibold" role="tablist">
            {['Evidencia', 'Criterios', 'Observaciones', 'Historial'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 transition-all relative ${
                  activeTab === tab
                    ? 'text-[#6E432F] font-bold border-b-2 border-[#6E432F]'
                    : 'text-[#70665E] hover:text-[#1C1917]'
                }`}
                role="tab"
                aria-selected={activeTab === tab}
              >
                {tab}
                {tab === 'Criterios' && activeStage.id === 1 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-[#EDF7F2] text-[#146C4F] border border-[#9CD5BE]">
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
                        {currentEvidence.version} &bull; {currentEvidence.size} &bull; Enviado el {currentEvidence.date}
                      </small>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenDrawer('Todas las evidencias')}
                      className="px-3 py-1.5 text-xs font-semibold text-[#6E432F] bg-[#F5F1EA] hover:bg-[#EFE9DF] rounded-lg border border-[#D8CEBF] transition-colors"
                    >
                      Ver documento
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDrawer('Todas las evidencias')}
                      className="p-1.5 rounded-lg border border-[#D8CEBF] hover:bg-[#F5F1EA] text-[#57534E]"
                      title="Descargar copia"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#FBF7F2] rounded-xl border border-[#D8CEBF] space-y-1">
                  <h4 className="font-bold text-xs text-[#1C1917]">Revisión de la evidencia</h4>
                  <p className="text-[11px] text-[#57534E] leading-relaxed">
                    Compara el archivo entregado con los criterios metodológicos de la etapa y las observaciones previas antes de asentar tu dictamen.
                  </p>
                </div>

                {activeStage.id === 1 && (
                  <div className="p-4 bg-[#FFFBEB] rounded-xl border border-[#FCD34D] space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#8A4B08]">Auditoría Gate 0 (14 Criterios)</strong>
                      <span className="font-mono font-bold text-xs text-[#8A4B08]">
                        {gate0Analysis.completedCount}/14 Conformes
                      </span>
                    </div>
                    <div className="w-full bg-[#E8E1D5] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#146C4F] h-1.5 rounded-full"
                        style={{ width: `${(gate0Analysis.completedCount / 14) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#664C2E]">
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
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
                      <span className="font-bold text-xs text-[#1C1917]">Criterios Gate 0 (Etapa 1)</span>
                      <button
                        type="button"
                        onClick={() => onOpenDrawer('Criterios Gate 0 (14)')}
                        className="text-[11px] font-bold text-[#6E432F] hover:underline"
                      >
                        Abrir panel extendido &rarr;
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {/* Campos según src/data/gate0Catalog.js: id, label, suggestedCheck (ver docs/CAMBIOS.md, Fase 1) */}
                      {(selectedProject.gate0Items || []).map((item) => (
                        <label
                          key={item.id}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            item.checked ? 'bg-[#EDF7F2]/40 border-[#9CD5BE]' : 'bg-[#FBF9F5] border-[#E8E1D5] hover:bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => onToggleGateItem(item.id)}
                            className="mt-0.5 h-4 w-4 rounded text-[#146C4F] focus:ring-0 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-[#6E432F] bg-[#F5F1EA] px-1 rounded">
                                {item.id}
                              </span>
                              <strong className="text-xs text-[#1C1917]">{item.label}</strong>
                            </div>
                            <small className="text-[11px] text-[#6A625B] block leading-tight">{item.suggestedCheck}</small>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-[#FBF7F2] rounded-xl border border-[#D8CEBF] text-center space-y-2">
                    <h4 className="font-editorial font-bold text-sm text-[#1C1917]">
                      Criterios de Etapa #{activeStage.id}: {activeStage.name}
                    </h4>
                    <p className="text-xs text-[#57534E] max-w-md mx-auto">
                      Verifica la coherencia del contenido, fuentes académicas y rigurosidad metodológica antes de emitir la decisión.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: OBSERVACIONES */}
            {activeTab === 'Observaciones' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E1D5]">
                  <strong className="text-xs text-[#1C1917]">Historial de Observaciones</strong>
                  {stageActions?.requestChanges.allowed && (
                    <button
                      type="button"
                      onClick={() => onOpenDrawer('Solicitar cambios')}
                      className="text-[11px] font-bold text-[#6E432F] hover:underline"
                    >
                      + Registrar nueva observación
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {(selectedProject.decisionLog || [])
                    .filter(log => log.action.includes('Observación') || log.action.includes('Cambios'))
                    .map((log) => (
                      <div key={log.id} className="p-3 bg-[#FBF7F2] rounded-xl border border-[#E8E1D5] space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-[#1C1917]">{log.action}</strong>
                          <span className="font-mono text-[10px] text-[#7C736C]">{log.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-[#57534E] leading-relaxed bg-white p-2 rounded-lg border border-[#E8E1D5]">
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
                  <div key={log.id} className="p-2.5 bg-[#FBF9F5] rounded-xl border border-[#E8E1D5] space-y-1">
                    <div className="flex justify-between text-xs">
                      <strong className="text-[#1C1917]">{log.action}</strong>
                      <span className="font-mono text-[10px] text-[#7C736C]">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#57534E]">{log.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fixed Review Decision Buttons */}
          <div className="pt-4 border-t border-[#E8E1D5] flex flex-wrap items-center justify-end gap-3 mt-auto">
            {/* Motivo visible cuando una acción está bloqueada por las reglas de stageMachine.js */}
            {stageActions && !stageActions.approve.allowed && (
              <p className="text-[11px] text-[#8A4B08] mr-auto" role="note">
                {stageActions.approve.reason}
              </p>
            )}
            <button
              type="button"
              onClick={() => onOpenDrawer('Solicitar cambios')}
              disabled={!stageActions?.requestChanges.allowed}
              title={stageActions?.requestChanges.reason}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-white text-[#6E432F] hover:bg-[#FCF7F1] border border-[#DACABD] transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Solicitar cambios
            </button>

            <button
              type="button"
              onClick={() => onOpenDrawer('Confirmar aprobación')}
              disabled={!stageActions?.approve.allowed}
              title={stageActions?.approve.reason}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#6E432F] text-white hover:bg-[#553323] transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aprobar etapa
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
