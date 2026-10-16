/**
 * Persistencia local del modo demo (Fase 1 · feat/guardar-demo-en-navegador).
 *
 * Guarda el estado de los proyectos en localStorage para que los cambios hechos durante una
 * demostración (entregas, observaciones, aprobaciones) no se pierdan al recargar la página.
 * Solo vive en el navegador de quien usa la demo: no es una base de datos ni se comparte.
 *
 * Si cambia la estructura o el contenido de src/data/pilotData.js, subir DEMO_DATA_VERSION
 * para que los navegadores descarten los datos guardados con la versión anterior.
 */
export const DEMO_DATA_VERSION = 2;
const STORAGE_KEY = 'lg-artifacts:demo-projects';

export function loadDemoProjects(fallback) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw);
    if (saved?.version !== DEMO_DATA_VERSION || !Array.isArray(saved.projects)) return fallback;
    return saved.projects;
  } catch {
    // Almacenamiento bloqueado (modo privado, permisos) o dato corrupto: se usa la semilla.
    return fallback;
  }
}

export function saveDemoProjects(projects) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: DEMO_DATA_VERSION, savedAt: new Date().toISOString(), projects })
    );
  } catch {
    // Sin almacenamiento disponible la demo sigue funcionando, solo que sin recordar cambios.
  }
}

export function clearDemoProjects() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que limpiar.
  }
}

/**
 * Marcas simples de "ya visto" por navegador (pantalla de bienvenida, recorridos guiados).
 * Fase 3 · ver docs/CAMBIOS.md.
 */
const FLAG_PREFIX = 'lg-artifacts:visto:';

export function hasSeen(flag) {
  try {
    return window.localStorage.getItem(FLAG_PREFIX + flag) === '1';
  } catch {
    return false;
  }
}

export function markSeen(flag) {
  try {
    window.localStorage.setItem(FLAG_PREFIX + flag, '1');
  } catch {
    // Sin almacenamiento: se volverá a mostrar la próxima vez, sin más efecto.
  }
}

export function clearSeenFlags() {
  try {
    Object.keys(window.localStorage)
      .filter(k => k.startsWith(FLAG_PREFIX))
      .forEach(k => window.localStorage.removeItem(k));
  } catch {
    // Nada que limpiar.
  }
}
