import React from 'react';

/**
 * PageHeader — Encabezado común de las páginas (Fase 4): antetítulo, título, descripción y acciones.
 */
export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="text-[10px] uppercase font-bold tracking-widest text-(--light) mb-1">{eyebrow}</p>
        )}
        <h1 className="font-editorial text-3xl sm:text-4xl text-(--brand) tracking-tight">{title}</h1>
        {description && <p className="text-xs text-(--muted) mt-1">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
