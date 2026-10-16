import React from 'react';

/**
 * StatusBadge — Insignia visual unificada con contrastes WCAG 2.2 AA auditados
 * Paleta Academic Flow 2.0:
 * - Aprobado: #146C4F / #EDF7F2 (5.84:1)
 * - En revisión: #8A4B08 / #FFFBEB (6.55:1)
 * - Cambios solicitados: #B42318 / #FEF2F2 (6.01:1)
 * - Pendiente / Bloqueado: #475569 / #F1EFEA (6.59:1)
 */
export default function StatusBadge({ type = 'stage', value, className = '' }) {
  if (type === 'stage') {
    switch (value) {
      case 'aprobado':
      case 'Aprobado':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDF7F2] text-[#146C4F] border border-[#9CD5BE]/50 ${className}`}>
            <svg className="w-3 h-3 text-[#146C4F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Aprobado</span>
          </span>
        );
      case 'en_revision':
      case 'En revisión':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#8A4B08] border border-[#FCD34D]/60 ${className}`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8A4B08] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#8A4B08]"></span>
            </span>
            <span>En revisión</span>
          </span>
        );
      case 'observado':
      case 'Cambios solicitados':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#B42318] border border-[#FCA5A5]/60 ${className}`}>
            <svg className="w-3 h-3 text-[#B42318]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
            </svg>
            <span>Cambios solicitados</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F1EFEA] text-[#475569] border border-[#D8D4CC] ${className}`}>
            <svg className="w-2.5 h-2.5 text-[#475569]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF2F2] text-[#B42318] border border-[#FCA5A5]/60 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B42318]"></span>
            <span>Riesgo Alto</span>
          </span>
        );
      case 'Completado':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#93C5FD]/60 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]"></span>
            <span>Completado</span>
          </span>
        );
      case 'Medio':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFFBEB] text-[#8A4B08] border border-[#FCD34D]/60 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A4B08]"></span>
            <span>Riesgo Medio</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EDF7F2] text-[#146C4F] border border-[#9CD5BE]/50 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#146C4F]"></span>
            <span>Riesgo Bajo</span>
          </span>
        );
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F5F1EA] text-[#57534E] border border-[#D8CEBF] ${className}`}>
      {value}
    </span>
  );
}
