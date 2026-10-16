import { Home, Layers, FileText, Clock, Inbox, FolderKanban, CalendarClock, BarChart3, Users } from 'lucide-react';

/**
 * Opciones del menú lateral por rol (Fase 4 · feat/menu-con-pantalla-por-opcion).
 * El `id` es la sección de la dirección (#/rol/<id>). Cada opción abre una pantalla propia.
 * Una sola fuente para el menú y para la ruta de navegación de la cabecera.
 */
export const NAV_ITEMS = {
  estudiante: [
    { id: 'mi-proyecto', label: 'Mi proyecto', icon: Home },
    { id: 'etapas', label: 'Etapas', icon: Layers },
    { id: 'entregas', label: 'Entregas', icon: FileText },
    { id: 'bitacora', label: 'Bitácora', icon: Clock }
  ],
  tutor: [
    { id: 'por-revisar', label: 'Por revisar', icon: Inbox, showPendingCount: true },
    { id: 'proyectos', label: 'Mis proyectos', icon: FolderKanban },
    { id: 'compromisos', label: 'Compromisos', icon: CalendarClock }
  ],
  admin: [
    { id: 'panorama', label: 'Panorama', icon: BarChart3 },
    { id: 'proyectos', label: 'Proyectos', icon: Layers },
    { id: 'tutores', label: 'Tutores', icon: Users }
  ]
};

export const ROLE_LABELS = { estudiante: 'Estudiante', tutor: 'Tutor', admin: 'Coordinación' };

export function getSectionLabel(role, section) {
  return (NAV_ITEMS[role] || []).find(item => item.id === section)?.label || '';
}
