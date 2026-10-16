import { Home, Layers, FileText, Clock, Inbox, Users, BarChart3 } from 'lucide-react';

/**
 * Opciones del menú lateral por rol (Fase 4). El `id` es la sección de la dirección (#/rol/<id>).
 * Una sola fuente para el menú y para la ruta de navegación de la cabecera.
 */
export const NAV_ITEMS = {
  estudiante: [
    { id: 'mi-proyecto', label: 'Mi proyecto', icon: Home },
    { id: 'etapas', label: 'Etapas', icon: Layers },
    { id: 'entregas', label: 'Evidencias', icon: FileText },
    { id: 'bitacora', label: 'Bitácora', icon: Clock }
  ],
  tutor: [
    { id: 'por-revisar', label: 'Pendientes de revisión', icon: Inbox, showPendingCount: true },
    { id: 'proyectos', label: 'Proyectos asignados', icon: Layers },
    { id: 'seguimiento', label: 'Seguimiento', icon: Clock }
  ],
  admin: [
    { id: 'proyectos', label: 'Proyectos', icon: Layers },
    { id: 'asignaciones', label: 'Asignaciones', icon: Users },
    { id: 'seguimiento-general', label: 'Seguimiento general', icon: BarChart3 }
  ]
};

export function getSectionLabel(role, section) {
  return (NAV_ITEMS[role] || []).find(item => item.id === section)?.label || '';
}
