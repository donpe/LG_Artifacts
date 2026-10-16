import React from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import { listPendingCommitments } from '../../domain/projectLog.js';

/**
 * TutorsPage — Carga y alertas por tutor para coordinación (Fase 4 · menú "Tutores").
 */
export default function TutorsPage({ tutors, projects, onOpenTutorProjects }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Coordinación · Cohorte 2026-1"
        title="Tutores"
        description="Cuántos proyectos acompaña cada tutor y dónde hay alertas."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tutors.map(t => {
          const own = projects.filter(p => p.tutorId === t.id);
          const stats = [
            { label: 'Proyectos', value: own.length },
            { label: 'Por revisar', value: own.filter(p => p.stages.some(s => s.status === 'en_revision')).length },
            { label: 'Cambios solicitados', value: own.filter(p => p.stages.some(s => s.status === 'observado')).length },
            { label: 'Compromisos vencidos', value: listPendingCommitments(own).filter(c => c.timing === 'vencido').length, alert: true }
          ];
          return (
            <article key={t.id} className="bg-white border border-(--line) rounded-(--radius) p-5 flex flex-col">
              <h2 className="font-editorial text-lg text-(--ink)">{t.name}</h2>
              <p className="text-[11px] text-(--light)">{t.department}</p>
              <dl className="grid grid-cols-2 gap-3 mt-4 flex-1">
                {stats.map(s => (
                  <div key={s.label} className="bg-(--surface-subtle) rounded-(--radius) p-2.5">
                    <dt className="text-[10px] text-(--light) font-semibold">{s.label}</dt>
                    <dd className={`font-editorial text-2xl ${s.alert && s.value > 0 ? 'text-(--red)' : 'text-(--brand)'}`}>{s.value}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                onClick={() => onOpenTutorProjects(t.id)}
                className="mt-4 w-full px-4 py-2 rounded-(--radius) border border-(--line2) text-xs font-bold text-(--brand) hover:bg-(--surface-subtle)"
              >
                Ver la bandeja de {t.name.replace(/^(Dr|Dra)\.\s*/, '')}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
