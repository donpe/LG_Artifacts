import React from 'react';
import Term from '../../components/Term.jsx';
import { listPendingCommitments } from '../../domain/projectLog.js';

const TIMING = {
  vencido: { label: 'Vencido', cls: 'bg-(--red-bg) text-(--red) border-(--red-line)' },
  proximo: { label: 'Vence pronto', cls: 'bg-(--amber-bg) text-(--amber) border-(--amber-line)' },
  a_tiempo: { label: 'A tiempo', cls: 'bg-(--green-bg) text-(--green) border-(--green-line)' }
};

/** Pastilla de plazo de un compromiso (vencido / vence pronto / a tiempo). */
export function TimingBadge({ timing }) {
  const t = TIMING[timing] || TIMING.a_tiempo;
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.cls}`}>{t.label}</span>;
}

/**
 * ProjectLogView — Compromisos y bitácora completa de un proyecto (Fase 4).
 * Se usa en "Bitácora" del estudiante y en la pestaña "Bitácora" de la ficha del proyecto.
 */
export default function ProjectLogView({ project }) {
  const pending = listPendingCommitments([project]);
  const done = (project.commitments || []).filter(c => c.status !== 'pendiente');
  const log = project.decisionLog || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <section className="lg:col-span-5 bg-white border border-(--line) rounded-(--radius) p-5 space-y-3">
        <h2 className="text-sm font-bold text-(--ink)"><Term id="compromiso">Compromisos</Term></h2>
        {pending.length === 0 && done.length === 0 && <p className="text-xs text-(--muted)">Sin compromisos registrados.</p>}
        <ul className="space-y-2">
          {pending.map(c => (
            <li key={c.id} className="p-3 rounded-(--radius) border border-(--line) space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-(--muted)">{c.dueDate}</span>
                <TimingBadge timing={c.timing} />
              </div>
              <p className="text-xs text-(--ink)">{c.description}</p>
              <p className="text-[10px] text-(--light)">Responsable: {c.responsible}</p>
            </li>
          ))}
          {done.map(c => (
            <li key={c.id} className="p-3 rounded-(--radius) border border-(--line) bg-(--surface-subtle) opacity-80 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-(--muted)">{c.dueDate}</span>
                <span className="text-[10px] font-bold text-(--green)">Cumplido</span>
              </div>
              <p className="text-xs text-(--muted) line-through">{c.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="lg:col-span-7 bg-white border border-(--line) rounded-(--radius) p-5 space-y-3">
        <h2 className="text-sm font-bold text-(--ink)"><Term id="bitacora">Bitácora</Term> ({log.length} registros)</h2>
        <ol className="relative border-l-2 border-(--line) ml-2 space-y-4">
          {log.map(entry => (
            <li key={entry.id} className="pl-4 relative">
              <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-(--accent)" aria-hidden="true" />
              <div className="flex flex-wrap justify-between gap-2 text-[11px]">
                <strong className="text-(--ink)">{entry.action}</strong>
                <span className="font-mono text-(--light)">{entry.timestamp}</span>
              </div>
              <p className="text-xs text-(--muted) leading-relaxed mt-0.5">{entry.notes}</p>
              <p className="text-[10px] text-(--light) mt-0.5">{entry.author}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
