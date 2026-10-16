import React from 'react';
import { Menu, Info, Download, RotateCcw } from 'lucide-react';
import { ROLE_LABELS } from '../../routing/navigation.js';

/**
 * TopbarCompact — Cabecera: ruta de ubicación (rol / sección) y acciones globales.
 * Desde la Fase 4 el rol se elige en la barra lateral.
 */
export default function TopbarCompact({
  activeNav,
  role,
  onToggleMobileMenu,
  onOpenProjectInfo,
  onExportCSV,
  onResetDemo
}) {
  // Fase 2: cabecera blanca y sólida con línea inferior azul marino.
  return (
    <header className="h-[61px] max-md:h-[56px] bg-white border-b-2 border-(--brand) sticky top-0 z-30 flex items-center justify-between px-6 max-md:px-4 gap-4">
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-3 text-xs sm:text-sm text-(--light)">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-(--radius) text-(--muted) hover:bg-(--sand) transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="font-semibold text-(--ink) shrink-0 max-sm:hidden">LG Artifacts</span>
        <span className="text-(--line2) max-sm:hidden">/</span>
        {/* El rol se cambia desde la barra lateral (Fase 4); aquí solo se muestra */}
        <span className="font-semibold text-(--muted) shrink-0 max-sm:hidden">{ROLE_LABELS[role]}</span>
        <span className="text-(--line2) max-sm:hidden">/</span>
        <span className="font-bold text-(--brand) max-w-[160px] lg:max-w-xs truncate">
          {activeNav}
        </span>
      </div>

      {/* Right: Actions, Demo Chip, Info & Role Selector */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Demo Mode Chip */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-(--brand) bg-(--accent-soft) border border-(--line) select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent) animate-pulse"></span>
          <span className="hidden md:inline">Modo demostración</span>
          <span className="md:hidden">Demo</span>
        </span>

        {/* Reiniciar demo: vuelve a los datos semilla (los cambios se guardan en el navegador) */}
        {onResetDemo && (
          <button
            type="button"
            onClick={onResetDemo}
            className="w-8 h-8 rounded-(--radius) border border-transparent hover:border-(--line) hover:bg-(--sand) text-(--light) grid place-items-center transition-colors"
            title="Reiniciar demo (volver a los datos originales)"
            aria-label="Reiniciar demo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Project Info Trigger */}
        <button
          type="button"
          onClick={onOpenProjectInfo}
          className="w-8 h-8 rounded-(--radius) border border-transparent hover:border-(--line) hover:bg-(--sand) text-(--light) grid place-items-center transition-colors"
          title="Ver ficha académica del proyecto"
          aria-label="Ver ficha académica del proyecto"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Export CSV Button */}
        <button
          type="button"
          onClick={onExportCSV}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-(--radius) text-xs font-semibold text-(--green) bg-(--green-bg) hover:bg-(--green-line) border border-(--green-line) transition-colors"
          title="Exportar reporte en formato CSV compatible con Excel"
        >
          <Download className="w-3.5 h-3.5" />
          <span>CSV</span>
        </button>

      </div>
    </header>
  );
}
