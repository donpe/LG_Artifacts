import React from 'react';
import { Home, Layers, FileText, Clock, Inbox, Users, BarChart3, HelpCircle } from 'lucide-react';

/**
 * RoleSidebar — Barra lateral fija / off-canvas por rol.
 * Fase 2: fondo azul marino (--brand) con indicador cian en la opción activa, como eafit.edu.co.
 * Navegación especializada para Estudiante, Tutor y Administrador.
 */
export default function RoleSidebar({
  role,
  activeNav,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
  onOpenDrawer,
  pendingReviewCount = 3,
  profileName
}) {
  const navConfigs = {
    estudiante: [
      { id: 'Mi proyecto', label: 'Mi proyecto', icon: Home },
      { id: 'Etapas', label: 'Etapas', icon: Layers },
      { id: 'Evidencias', label: 'Evidencias', icon: FileText },
      { id: 'Bitácora', label: 'Bitácora', icon: Clock }
    ],
    tutor: [
      { id: 'Pendientes de revisión', label: 'Pendientes de revisión', icon: Inbox, count: pendingReviewCount },
      { id: 'Proyectos asignados', label: 'Proyectos asignados', icon: Layers },
      { id: 'Seguimiento', label: 'Seguimiento', icon: Clock }
    ],
    admin: [
      { id: 'Proyectos', label: 'Proyectos', icon: Layers },
      { id: 'Asignaciones', label: 'Asignaciones', icon: Users },
      { id: 'Seguimiento general', label: 'Seguimiento general', icon: BarChart3 }
    ]
  };

  const currentNav = navConfigs[role] || navConfigs.estudiante;

  const roleMeta = {
    estudiante: { initial: 'E', name: 'Estudiante demo', roleLabel: 'Modo demostración' },
    tutor: { initial: 'T', name: 'Tutor demo', roleLabel: 'Tutor asignado' },
    admin: { initial: 'A', name: 'Administrador demo', roleLabel: 'Coordinación académica' }
  }[role] || { initial: 'U', name: 'Usuario demo', roleLabel: 'Modo demostración' };

  // Nombre real del usuario simulado (tutor o estudiante del proyecto abierto) cuando se conoce.
  const profile = profileName
    ? { ...roleMeta, name: profileName, initial: profileName.replace(/^(Dr|Dra)\.\s*/, '')[0] }
    : roleMeta;


  return (
    <>
      <aside
        id="sidebar"
        aria-label="Navegación por rol"
        className={`w-[236px] bg-(--brand) text-(--on-brand) flex-none flex flex-col h-screen sticky top-0 z-40 transition-transform duration-200 ease-out ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 translate-x-0 shadow-2xl z-50'
            : 'max-md:-translate-x-full max-md:fixed max-md:inset-y-0 max-md:left-0'
        }`}
      >
        {/* Brand Emblem & Academic Title */}
        <div className="flex items-center gap-3 p-6 pb-5">
          <div className="h-10 w-10 rounded-(--radius) text-(--brand) grid place-items-center font-editorial text-lg bg-(--on-brand) select-none">
            LG
          </div>
          <div>
            <div className="font-editorial text-lg text-(--on-brand) tracking-tight leading-none">
              Academic Flow
            </div>
            <div className="text-[10px] text-white/70 tracking-wider uppercase font-semibold mt-1">
              SEGUIMIENTO DE TESIS
            </div>
          </div>
        </div>

        {/* Section Label */}
        <div className="text-[10px] tracking-widest text-white/60 font-bold px-6 pt-3 pb-2 uppercase">
          ESPACIO DE TRABAJO
        </div>

        {/* Navigation Items */}
        <nav className="px-3 flex flex-col gap-1 flex-1">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`flex items-center gap-3 w-full text-left rounded-(--radius) px-3.5 py-2.5 text-xs font-semibold transition-all min-h-[42px] border-l-4 ${
                  isActive
                    ? 'bg-white/12 text-(--on-brand) font-bold border-(--cyan)'
                    : 'text-white/80 border-transparent hover:bg-white/8 hover:text-(--on-brand)'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-(--cyan)' : 'text-white/70'}`} />
                <span className="truncate flex-1">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-auto bg-(--cyan) text-(--brand) text-[11px] font-extrabold rounded-full px-2 py-0.5">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Bar: Help + Demo Profile */}
        <div className="mt-auto border-t border-white/15 p-3 space-y-2">
          <button
            type="button"
            onClick={() => {
              onOpenDrawer('Ayuda contextual');
              onCloseMobile();
            }}
            className="flex items-center gap-3 w-full text-left rounded-(--radius) px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-white/8 hover:text-(--on-brand) transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-white/70" />
            <span>Ayuda contextual</span>
          </button>

          <div className="flex items-center gap-2.5 pt-2 border-t border-white/15 px-1">
            <span className="w-8 h-8 rounded-full bg-(--cyan) text-(--brand) font-bold text-xs grid place-items-center shrink-0">
              {profile.initial}
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-xs font-bold text-(--on-brand) truncate leading-tight">
                {profile.name}
              </strong>
              <small className="block text-[11px] text-white/70 truncate">
                {profile.roleLabel}
              </small>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
    </>
  );
}
