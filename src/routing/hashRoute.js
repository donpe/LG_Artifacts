import { useCallback, useEffect, useState } from 'react';

/**
 * Rutas con dirección propia (Fase 4 · feat/rutas-con-direccion-propia).
 *
 * Cada pantalla tiene una dirección en la barra del navegador, por ejemplo:
 *   #/tutor/por-revisar?tutor=TUT-02&proyecto=PRJ-05&etapa=1
 *   #/estudiante/etapas?proyecto=PRJ-01&etapa=2
 *   #/coordinacion/proyecto/bitacora?proyecto=PRJ-07
 *
 * Así funcionan el botón Atrás, los enlaces compartidos y la recarga de la página.
 * Se usa el "hash" (#) porque GitHub Pages sirve archivos estáticos y no reescribe rutas.
 * Es un enrutador mínimo hecho a mano: no hace falta instalar ninguna librería.
 *
 * Forma de la ruta:
 *   { role: 'estudiante' | 'tutor' | 'admin', section, tab?, projectId?, stageId?, tutorId? }
 */

// En la dirección se muestra "coordinacion"; internamente el rol se llama 'admin'.
const ROLE_TO_SLUG = { estudiante: 'estudiante', tutor: 'tutor', admin: 'coordinacion' };
const SLUG_TO_ROLE = { estudiante: 'estudiante', tutor: 'tutor', coordinacion: 'admin' };

export const DEFAULT_SECTION = {
  estudiante: 'mi-proyecto',
  tutor: 'por-revisar',
  admin: 'panorama'
};

export const DEFAULT_ROUTE = {
  role: 'tutor',
  section: DEFAULT_SECTION.tutor,
  tutorId: 'TUT-01',
  projectId: 'PRJ-01'
};

export function parseHash(hash = '') {
  const raw = hash.replace(/^#\/?/, '');
  if (!raw) return { ...DEFAULT_ROUTE };

  const [path, query = ''] = raw.split('?');
  const [roleSlug, section, tab] = path.split('/').filter(Boolean);
  const role = SLUG_TO_ROLE[roleSlug];
  if (!role) return { ...DEFAULT_ROUTE };

  const params = new URLSearchParams(query);
  const etapa = Number(params.get('etapa'));
  return {
    role,
    section: section || DEFAULT_SECTION[role],
    tab: tab || undefined,
    projectId: params.get('proyecto') || undefined,
    stageId: Number.isInteger(etapa) && etapa >= 1 && etapa <= 6 ? etapa : undefined,
    tutorId: params.get('tutor') || undefined
  };
}

export function buildHash({ role, section, tab, projectId, stageId, tutorId }) {
  const path = [ROLE_TO_SLUG[role] || 'tutor', section || DEFAULT_SECTION[role], tab].filter(Boolean).join('/');
  const params = new URLSearchParams();
  if (tutorId) params.set('tutor', tutorId);
  if (projectId) params.set('proyecto', projectId);
  if (stageId) params.set('etapa', String(stageId));
  const query = params.toString();
  return `#/${path}${query ? `?${query}` : ''}`;
}

/**
 * Hook: devuelve la ruta actual y una función navigate(ruta, { replace }) que actualiza la dirección.
 * replace: true cambia la dirección sin crear una entrada nueva en el historial (útil para correcciones).
 */
export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next, { replace = false } = {}) => {
    const hash = buildHash(next);
    if (hash === window.location.hash) return;
    if (replace) {
      window.history.replaceState(null, '', hash);
      setRoute(parseHash(hash));
    } else {
      window.location.hash = hash;
    }
  }, []);

  return [route, navigate];
}
