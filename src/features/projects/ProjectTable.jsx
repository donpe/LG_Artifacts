import React from 'react';
import { ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import { getCurrentStage, calculateProgress } from '../../domain/progressCalculator.js';

/**
 * ProjectTable — Tabla de proyectos (Fase 4). Se usa en "Proyectos" de coordinación y en
 * "Mis proyectos" del tutor. Al hacer clic en una fila se abre la ficha del proyecto.
 */
export default function ProjectTable({ projects, onOpen, showTutor = true, emptyText = 'No hay proyectos que coincidan.' }) {
  return (
    <section data-tour="tabla" className="bg-white rounded-(--radius) border border-(--line) overflow-hidden">
      <div className="hidden lg:grid grid-cols-12 gap-3 p-3.5 px-5 bg-(--surface-subtle) border-b border-(--line) text-[11px] font-bold text-(--light) uppercase tracking-wider">
        <span className={showTutor ? 'col-span-5' : 'col-span-6'}>Proyecto / Estudiante</span>
        <span className="col-span-3">Etapa actual</span>
        {showTutor && <span className="col-span-2">Tutor</span>}
        <span className={`${showTutor ? 'col-span-2' : 'col-span-3'} text-right`}>Estado</span>
      </div>

      <ul className="divide-y divide-(--line)">
        {projects.map(p => {
          const st = getCurrentStage(p.stages);
          const progress = calculateProgress(p.stages);
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onOpen(p.id)}
                className="w-full text-left p-4 sm:px-5 hover:bg-(--surface-subtle) transition-colors flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-2 lg:gap-3 text-xs"
              >
                <div className={`${showTutor ? 'lg:col-span-5' : 'lg:col-span-6'} min-w-0`}>
                  <strong className="font-editorial text-sm text-(--ink) leading-tight line-clamp-2">{p.title}</strong>
                  <small className="text-[11px] text-(--light) block mt-0.5">
                    {p.student} &bull; <span className="font-mono">{p.institutionalId}</span>
                  </small>
                </div>
                <div className="lg:col-span-3 text-(--muted)">
                  <span>Etapa {st.id} &bull; {st.name.replace(' (Gate 0)', '')}</span>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-(--line) rounded-full overflow-hidden">
                      <div className="h-full bg-(--green)" style={{ width: `${progress.percentage}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-(--light)">{progress.percentage}%</span>
                  </div>
                </div>
                {showTutor && <div className="lg:col-span-2 text-(--muted)">{p.tutor}</div>}
                <div className={`${showTutor ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-wrap items-center lg:justify-end gap-2`}>
                  <StatusBadge type="stage" value={st.status} />
                  <span title={p.riskReason}>
                    <StatusBadge type="risk" value={p.riskLevel} />
                  </span>
                  <ArrowRight className="w-4 h-4 text-(--light) shrink-0 hidden lg:block" />
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {projects.length === 0 && <p className="p-10 text-center text-xs text-(--muted)">{emptyText}</p>}
    </section>
  );
}
