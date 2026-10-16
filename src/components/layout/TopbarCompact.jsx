import React, { useState, useRef, useEffect } from 'react';
import { Menu, Info, Download, ChevronDown, RotateCcw } from 'lucide-react';

/**
 * TopbarCompact — Cabecera de control minimalista (Academic Flow 2.0)
 * Breadcrumb de ubicación, selector de rol simulado y acciones globales.
 */
export default function TopbarCompact({
  activeNav,
  role,
  onRoleChange,
  onToggleMobileMenu,
  onOpenProjectInfo,
  onExportCSV,
  onResetDemo
}) {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roleLabels = {
    estudiante: 'Estudiante',
    tutor: 'Tutor',
    admin: 'Administrador'
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fase 2: cabecera blanca y sólida con línea inferior azul marino.
  return (
    <header className="h-[61px] max-md:h-[56px] bg-white border-b-2 border-(--brand) sticky top-0 z-30 flex items-center justify-between px-6 max-md:px-4 gap-4">
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-3 text-xs sm:text-sm text-(--light)">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg text-(--muted) hover:bg-(--sand) transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="font-semibold text-(--ink) shrink-0">LG Artifacts</span>
        <span className="text-(--line2) max-sm:hidden">/</span>
        <span className="font-bold text-(--brand) max-sm:hidden max-w-[120px] lg:max-w-xs truncate">
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
            className="w-8 h-8 rounded-lg border border-transparent hover:border-(--line) hover:bg-(--sand) text-(--light) grid place-items-center transition-colors"
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
          className="w-8 h-8 rounded-lg border border-transparent hover:border-(--line) hover:bg-(--sand) text-(--light) grid place-items-center transition-colors"
          title="Ver ficha académica del proyecto"
          aria-label="Ver ficha académica del proyecto"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Export CSV Button */}
        <button
          type="button"
          onClick={onExportCSV}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-(--green) bg-(--green-bg) hover:bg-(--green-line) border border-(--green-line) transition-colors shadow-xs"
          title="Exportar reporte en formato CSV compatible con Excel"
        >
          <Download className="w-3.5 h-3.5" />
          <span>CSV</span>
        </button>

        {/* Role Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-(--line2) bg-white text-xs font-semibold text-(--ink) hover:bg-(--sand) transition-colors shadow-xs"
            aria-expanded={isRoleDropdownOpen}
            aria-label="Seleccionar rol de demostración"
          >
            <span>{roleLabels[role] || 'Rol'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-(--muted)" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 top-10 w-44 bg-white border border-(--line) rounded-xl shadow-xl p-1.5 z-50 animate-fade-in-slide">
              <span className="block px-2.5 py-1 text-[10px] font-bold text-(--light) uppercase tracking-wider">
                Cambiar Rol Simulado
              </span>
              <button
                type="button"
                onClick={() => {
                  onRoleChange('estudiante');
                  setIsRoleDropdownOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  role === 'estudiante'
                    ? 'bg-(--accent-soft) text-(--brand)'
                    : 'text-(--muted) hover:bg-(--sand)'
                }`}
              >
                Estudiante
              </button>
              <button
                type="button"
                onClick={() => {
                  onRoleChange('tutor');
                  setIsRoleDropdownOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  role === 'tutor'
                    ? 'bg-(--accent-soft) text-(--brand)'
                    : 'text-(--muted) hover:bg-(--sand)'
                }`}
              >
                Tutor
              </button>
              <button
                type="button"
                onClick={() => {
                  onRoleChange('admin');
                  setIsRoleDropdownOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  role === 'admin'
                    ? 'bg-(--accent-soft) text-(--brand)'
                    : 'text-(--muted) hover:bg-(--sand)'
                }`}
              >
                Administrador
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
