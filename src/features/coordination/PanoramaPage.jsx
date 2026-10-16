import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Term from '../../components/Term.jsx';
import { STAGE_DEFINITIONS } from '../../domain/stageMachine.js';
import { getCurrentStage, calculateProgress } from '../../domain/progressCalculator.js';

const RISK_ORDER = ['Alto', 'Medio', 'Bajo', 'Completado'];
const RISK_COLOR = { Alto: 'bg-(--red)', Medio: 'bg-(--amber)', Bajo: 'bg-(--green)', Completado: 'bg-(--info)' };

/**
 * PanoramaPage — Vista general de la cohorte para coordinación (Fase 4 · menú "Panorama").
 * Indicadores, distribución por etapa y por riesgo, y los proyectos que requieren atención.
 */
export default function PanoramaPage({ projects, tutorsCount, onOpenProject, onGoToProjects }) {
  const total = projects.length;
  const avgProgress = Math.round(projects.reduce((acc, p) => acc + calculateProgress(p.stages).percentage, 0) / (total || 1));
  const completed = projects.filter(p => p.riskLevel === 'Completado').length;
  const byStage = STAGE_DEFINITIONS.map(def => ({
    ...def,
    count: projects.filter(p => p.riskLevel !== 'Completado' && getCurrentStage(p.stages).id === def.id).length
  }));
  const byRisk = RISK_ORDER.map(level => ({ level, count: projects.filter(p => p.riskLevel === level).length }));
  const attention = projects
    .filter(p => p.riskLevel === 'Alto' || p.riskLevel === 'Medio')
    .sort((a, b) => RISK_ORDER.indexOf(a.riskLevel) - RISK_ORDER.indexOf(b.riskLevel));
  const maxStage = Math.max(1, ...byStage.map(s => s.count));

  const kpis = [
    { label: 'Proyectos del piloto', value: total },
    { label: 'Tutores', value: tutorsCount },
    { label: 'Avance promedio', value: `${avgProgress}%` },
    { label: 'Completados', value: completed }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Coordinación · Cohorte 2026-1"
        title="Panorama de la cohorte"
        description="Cómo va el piloto y qué proyectos necesitan atención."
      />

      <div data-tour="indicadores" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-(--line) border-t-4 border-t-(--brand) rounded-(--radius) p-4">
            <p className="text-[11px] text-(--light) font-semibold">{k.label}</p>
            <p className="font-editorial text-3xl text-(--brand) mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <section className="lg:col-span-7 bg-white border border-(--line) rounded-(--radius) p-5 space-y-4">
          <h2 className="text-sm font-bold text-(--ink)">Proyectos en curso por etapa</h2>
          <ul className="space-y-2.5">
            {byStage.map(s => (
              <li key={s.id} className="grid grid-cols-12 items-center gap-2 text-xs">
                <span className="col-span-5 sm:col-span-4 text-(--muted) truncate">
                  <strong className="text-(--accent)">{s.id}</strong> {s.name.replace(' (Gate 0)', '')}
                </span>
                <div className="col-span-6 sm:col-span-7 h-5 bg-(--surface-subtle) rounded-(--radius) overflow-hidden">
                  <div className="h-full bg-(--accent)" style={{ width: `${(s.count / maxStage) * 100}%` }} />
                </div>
                <span className="col-span-1 font-mono font-bold text-(--ink) text-right">{s.count}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-sm font-bold text-(--ink) pt-2"><Term id="riesgo">Riesgo</Term> de los proyectos</h2>
          <div className="flex h-4 rounded-(--radius) overflow-hidden" role="img" aria-label={byRisk.map(r => `${r.level}: ${r.count}`).join(', ')}>
            {byRisk.filter(r => r.count > 0).map(r => (
              <div key={r.level} className={RISK_COLOR[r.level]} style={{ width: `${(r.count / (total || 1)) * 100}%` }} title={`${r.level}: ${r.count}`} />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--muted)">
            {byRisk.map(r => (
              <li key={r.level} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${RISK_COLOR[r.level]}`} /> {r.level}: <strong className="text-(--ink)">{r.count}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section data-tour="atencion" className="lg:col-span-5 bg-white border border-(--line) rounded-(--radius) p-5 space-y-3">
          <h2 className="text-sm font-bold text-(--ink) flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-(--red)" /> Requieren atención ({attention.length})
          </h2>
          {attention.length === 0 ? (
            <p className="text-xs text-(--muted)">Ningún proyecto con alertas.</p>
          ) : (
            <ul className="divide-y divide-(--line)">
              {attention.map(p => (
                <li key={p.id}>
                  <button type="button" onClick={() => onOpenProject(p.id)} className="w-full text-left py-2.5 flex items-start gap-3 hover:bg-(--surface-subtle) px-1 rounded-(--radius)">
                    <div className="min-w-0 flex-1">
                      <strong className="block text-xs text-(--ink) truncate">{p.student} &bull; {p.title}</strong>
                      <span className="text-[11px] text-(--light)">{p.riskReason}</span>
                    </div>
                    <StatusBadge type="risk" value={p.riskLevel} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={onGoToProjects} className="text-xs font-bold text-(--accent) hover:underline inline-flex items-center gap-1">
            Ver todos los proyectos <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      </div>
    </div>
  );
}
