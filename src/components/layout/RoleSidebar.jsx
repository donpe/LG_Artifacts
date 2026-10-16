import React from 'react';
import { Home, Layers, FileText, Clock, Inbox, Users, BarChart3, HelpCircle } from 'lucide-react';

/**
 * RoleSidebar — Barra lateral fija / off-canvas por rol (Academic Flow 2.0)
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
        className={`w-[236px] bg-[#F7F3ED] border-r border-[#E8E1D5] flex-none flex flex-col h-screen sticky top-0 z-40 transition-transform duration-200 ease-out ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 translate-x-0 shadow-2xl z-50'
            : 'max-md:-translate-x-full max-md:fixed max-md:inset-y-0 max-md:left-0'
        }`}
      >
        {/* Brand Emblem & Academic Title */}
        <div className="flex items-center gap-3 p-6 pb-5">
          <div className="h-10 w-10 border-[1.5px] border-[#6E432F] rounded-xl text-[#6E432F] grid place-items-center font-editorial font-bold text-xl bg-[#FEFCF8] shadow-xs select-none">
            LG
          </div>
          <div>
            <div className="font-editorial font-bold text-lg text-[#36241C] tracking-tight leading-none">
              Academic Flow
            </div>
            <div className="text-[10px] text-[#73675D] tracking-wider uppercase font-semibold mt-1">
              SEGUIMIENTO DE TESIS
            </div>
          </div>
        </div>

        {/* Section Label */}
        <div className="text-[10px] tracking-widest text-[#908378] font-bold px-6 pt-3 pb-2 uppercase">
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
                className={`flex items-center gap-3 w-full text-left rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all min-h-[42px] ${
                  isActive
                    ? 'bg-[#EDE2D6] text-[#6E432F] font-bold shadow-xs'
                    : 'text-[#5E534D] hover:bg-[#EFE6DD] hover:text-[#1C1917]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#6E432F]' : 'text-[#7C736C]'}`} />
                <span className="truncate flex-1">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-auto bg-white text-[#6E432F] text-[11px] font-extrabold rounded-full px-2 py-0.5 shadow-xs border border-[#E8E1D5]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Bar: Help + Demo Profile */}
        <div className="mt-auto border-t border-[#E8E1D5] p-3 space-y-2">
          <button
            type="button"
            onClick={() => {
              onOpenDrawer('Ayuda contextual');
              onCloseMobile();
            }}
            className="flex items-center gap-3 w-full text-left rounded-xl px-3.5 py-2 text-xs font-semibold text-[#5E534D] hover:bg-[#EFE6DD] hover:text-[#1C1917] transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#7C736C]" />
            <span>Ayuda contextual</span>
          </button>

          <div className="flex items-center gap-2.5 pt-2 border-t border-[#E8E1D5] px-1">
            <span className="w-8 h-8 rounded-full bg-[#D5C2AF] text-[#5A3526] font-bold text-xs grid place-items-center shrink-0">
              {profile.initial}
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-xs font-bold text-[#1C1917] truncate leading-tight">
                {profile.name}
              </strong>
              <small className="block text-[11px] text-[#57534E] truncate">
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
