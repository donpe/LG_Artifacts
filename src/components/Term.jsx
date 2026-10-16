import React, { useId } from 'react';
import { GLOSSARY } from '../data/glossary.js';

/**
 * Term — Término con ayuda emergente (Fase 3 · feat/glosario-y-ayudas-de-terminos).
 * Muestra el texto con subrayado punteado; al pasar el cursor o enfocar con el teclado,
 * aparece la definición del glosario (src/data/glossary.js).
 *
 * Uso: <Term id="gate0">Gate 0</Term>
 */
export default function Term({ id, children }) {
  const tooltipId = useId();
  const entry = GLOSSARY[id];
  if (!entry) return children;

  return (
    <span className="relative inline-block group">
      <span
        tabIndex={0}
        aria-describedby={tooltipId}
        className="underline decoration-dotted decoration-(--accent) underline-offset-2 cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) rounded-sm"
      >
        {children ?? entry.term}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute left-0 top-full mt-1.5 z-50 w-64 p-3 rounded-(--radius) bg-(--brand) text-(--on-brand) text-[11px] font-normal normal-case tracking-normal leading-relaxed text-left"
      >
        <strong className="block text-(--cyan) mb-0.5">{entry.term}</strong>
        {entry.definition}
      </span>
    </span>
  );
}
