import React from 'react';
import { GLOSSARY } from '../data/glossary.js';

/**
 * StatusBadge — Insignia visual unificada con contrastes WCAG 2.2 AA auditados
 * Colores semánticos definidos en src/styles/tokens.css:
 * - Aprobado: --green / --green-bg (5.84:1)
 * - En revisión: --amber / --amber-bg (6.55:1)
 * - Cambios solicitados: --red / --red-bg (6.01:1)
 * - Pendiente / Bloqueado: --pending / --pending-bg
 */
export default function StatusBadge(props) {
  // Fase 3: cada pastilla muestra su significado al pasar el cursor (glosario).
  const hint = props.type === 'risk'
    ? GLOSSARY.riesgo.definition
    : (GLOSSARY[STATUS_KEYS[props.value]]?.definition);
  return (
    <span title={hint} className="inline-flex">
      <BadgeBody {...props} />
    </span>
  );
}

const STATUS_KEYS = {
  aprobado: 'aprobado', Aprobado: 'aprobado',
  en_revision: 'en_revision', 'En revisión': 'en_revision',
  observado: 'observado', 'Cambios solicitados': 'observado',
  pendiente: 'pendiente', Pendiente: 'pendiente'
};

function BadgeBody({ type = 'stage', value, className = '' }) {
  if (type === 'stage') {
    switch (value) {
      case 'aprobado':
      case 'Aprobado':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-(--green-bg) text-(--green) border border-(--green-line)/50 ${className}`}>
            <svg className="w-3 h-3 text-(--green)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Aprobado</span>
          </span>
        );
      case 'en_revision':
      case 'En revisión':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-(--amber-bg) text-(--amber) border border-(--amber-line)/60 ${className}`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--amber) opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-(--amber)"></span>
            </span>
            <span>En revisión</span>
          </span>
        );
      case 'observado':
      case 'Cambios solicitados':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-(--red-bg) text-(--red) border border-(--red-line)/60 ${className}`}>
            <svg className="w-3 h-3 text-(--red)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
            </svg>
            <span>Cambios solicitados</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-(--pending-bg) text-(--pending) border border-(--line2) ${className}`}>
            <svg className="w-2.5 h-2.5 text-(--pending)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Pendiente</span>
          </span>
        );
    }
  }

  if (type === 'risk') {
    switch (value) {
      case 'Alto':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-(--red-bg) text-(--red) border border-(--red-line)/60 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-(--red)"></span>
            <span>Riesgo Alto</span>
          </span>
        );
      case 'Completado':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-(--info-bg) text-(--info) border border-(--info-line)/60 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-(--info)"></span>
            <span>Completado</span>
          </span>
        );
      case 'Medio':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-(--amber-bg) text-(--amber) border border-(--amber-line)/60 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-(--amber)"></span>
            <span>Riesgo Medio</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-(--green-bg) text-(--green) border border-(--green-line)/50 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-(--green)"></span>
            <span>Riesgo Bajo</span>
          </span>
        );
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-(--sand) text-(--muted) border border-(--line2) ${className}`}>
      {value}
    </span>
  );
}
