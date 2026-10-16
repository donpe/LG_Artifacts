import React from 'react';
import { getStageEvidences } from '../../domain/evidence.js';

/**
 * EvidenceList — Todas las entregas del proyecto agrupadas por etapa (Fase 4).
 * Se usa en "Entregas" del estudiante y en la pestaña "Entregas" de la ficha del proyecto.
 */
export default function EvidenceList({ project, onOpenStage }) {
  return (
    <div className="space-y-4">
      {project.stages.map(stage => {
        const evidences = getStageEvidences(project.evidences, stage.id);
        return (
          <section key={stage.id} className="bg-white border border-(--line) rounded-(--radius) p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-(--ink)">
                <span className="text-(--accent)">Etapa {stage.id}</span> &bull; {stage.name.replace(' (Gate 0)', '')}
              </h3>
              {onOpenStage && (
                <button type="button" onClick={() => onOpenStage(stage.id)} className="text-[11px] font-bold text-(--accent) hover:underline">
                  Ver etapa &rarr;
                </button>
              )}
            </div>
            {evidences.length === 0 ? (
              <p className="text-xs text-(--light)">Sin entregas.</p>
            ) : (
              <ul className="divide-y divide-(--line)">
                {evidences.map((ev, i) => (
                  <li key={ev.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <strong className="block text-(--ink) truncate">{ev.filename}</strong>
                      <span className="text-[11px] text-(--light)">{ev.uploadedBy} &bull; {ev.date} &bull; {ev.size}</span>
                    </div>
                    <span className={`shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded ${i === 0 ? 'bg-(--brand) text-white' : 'bg-(--sand) text-(--muted)'}`}>
                      {ev.version}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
