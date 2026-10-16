import React from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import { TimingBadge } from '../projects/ProjectLogView.jsx';
import { listPendingCommitments } from '../../domain/projectLog.js';

/**
 * CommitmentsPage — Compromisos pendientes de los proyectos del tutor (Fase 4 · menú "Compromisos").
 * Ordenados por fecha límite; los vencidos primero.
 */
export default function CommitmentsPage({ tutorName, projects, onOpenProject }) {
  const items = listPendingCommitments(projects);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Tutor · ${tutorName}`}
        title="Compromisos"
        description="Fechas acordadas con tus estudiantes. Un compromiso vencido pone el proyecto en riesgo alto."
      />
      <section className="bg-white border border-(--line) rounded-(--radius) overflow-hidden">
        {items.length === 0 ? (
          <p className="p-10 text-center text-xs text-(--muted)">No hay compromisos pendientes.</p>
        ) : (
          <ul className="divide-y divide-(--line)">
            {items.map(c => (
              <li key={`${c.project.id}-${c.id}`}>
                <button type="button" onClick={() => onOpenProject(c.project.id)} className="w-full text-left p-4 sm:px-5 hover:bg-(--surface-subtle) grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                  <span className="sm:col-span-2 font-mono text-(--muted)">{c.dueDate}</span>
                  <span className="sm:col-span-6 text-(--ink)">{c.description}</span>
                  <span className="sm:col-span-2 text-(--light)">{c.project.student}</span>
                  <span className="sm:col-span-2 sm:text-right"><TimingBadge timing={c.timing} /></span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
