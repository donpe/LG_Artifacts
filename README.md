# Plataforma de Seguimiento Académico de Trabajos de Grado (LG_Artifacts)

Plataforma web académica para el seguimiento, supervisión y trazabilidad de trabajos de grado y tesis universitarias, basada en un ciclo riguroso de **6 etapas académicas**, la guía metodológica **Fase 0 (17 actividades)** y el protocolo de aseguramiento de calidad **Gate 0 (14 criterios)**.

Diseñada bajo el sistema visual **Academic Flow 2.0** (inspirado en Framer, Kira Learning y Gumloop): cálido, intuitivo, accesible (WCAG 2.2 AA) y optimizado tanto para estaciones de trabajo institucionales como para dispositivos móviles.

🌐 **Demo Desplegada en Vivo:** [https://the-snitchlg.github.io/LG_Artifacts/](https://the-snitchlg.github.io/LG_Artifacts/)

📝 **Registro de cambios del fork:** ver [`docs/CAMBIOS.md`](docs/CAMBIOS.md) (qué cambió, por qué y cómo comprobarlo).

🎬 **Guion para presentar la demo:** ver [`docs/GUION_DEMO.md`](docs/GUION_DEMO.md).

---

## 1. Experiencia de Usuario "Academic Flow 2.0"

La plataforma proporciona espacios de trabajo especializados y adaptados a las responsabilidades de cada rol:

### 1.1 Estructura Global
* **Barra Lateral de Navegación (`RoleSidebar`):** Emblema institucional `LG`, navegación por rol, contador en tiempo real de pendientes de revisión, acceso a ayuda contextual y perfil simulado. En dispositivos móviles (<768px), se convierte en un cajón deslizable táctil (*off-canvas*) accesible mediante el menú hamburguesa.
* **Cabecera de Control (`TopbarCompact`):** Breadcrumb dinámico de ubicación, insignia de modo demostración responsiva, acceso rápido a la ficha técnica del proyecto, exportador CSV compatible con Excel y selector de rol simulado (*Estudiante*, *Tutor*, *Administrador*).
* **Panel Contextual Adaptable (`AdaptiveContextPanel`):** Cajón lateral deslizable (*slide-over drawer*) con trampa de foco accesible y cierre mediante tecla Escape o clic fuera. Permite consultar la ficha Dublin Core, la lista de 14 criterios de Gate 0, los 17 pasos de Fase 0, la bitácora inmutable de acuerdos y emitir dictámenes formales de aprobación u observación sin bloquear el espacio central.

### 1.2 Espacios de Trabajo Especializados
* **Espacio del Estudiante (`StudentWorkspace`):**
  * Visualización clara del proyecto con metadatos Dublin Core (asesor, cohorte, línea temática).
  * **Track de 6 Etapas:** Visualización de nodos en escritorio y banner táctil compacto en móvil (`Etapa N de 6`).
  * **Tarjeta "Tu Siguiente Paso" (Kira Learning):** Orientación inmediata sobre la acción prioritaria requerida (preparar entrega, subsanar observaciones o continuar con la siguiente etapa).
  * **Caja de Última Observación:** Cita directa con la retroalimentación y fecha límite fijada por el tutor.
  * **Evidencia Actual y Próximos Compromisos:** Enlaces contextuales directos para agilizar el trabajo.
* **Espacio del Tutor (`TutorWorkspace`):**
  * **Bandeja Maestro-Detalle:** Columna izquierda con la cola de tesis asignadas, buscador instantáneo y badges de estado; columna derecha con el detalle completo de la entrega activa.
  * **Pestañas de Revisión:** *Evidencia* (datos del archivo y botón de descarga), *Criterios* (checklist de los 14 criterios de Gate 0), *Observaciones* e *Historial*.
  * **Barra Inferior de Dictamen Formal:** Botones de acción directa con confirmación en panel lateral: *"Solicitar cambios"* (con motivo obligatorio y fecha pactada) y *"Aprobar etapa"* (bloqueado en Etapa 1 si Gate 0 < 14).
* **Espacio del Administrador (`AdminWorkspace`):**
  * **Franja de Indicadores Clave:** Total de proyectos de grado (15), tutores activos (3) y porcentaje promedio de avance de la cohorte.
  * **Controles de Filtrado:** Búsqueda en vivo por título, estudiante, ID o tutor, más filtros colapsables por etapa activa (1 a 6) y nivel de riesgo (Bajo, Medio, Alto).
  * **Tabla Responsiva:** Cuadrícula con métricas en pantallas grandes (≥1024px) y tarjetas condensadas en pantallas medianas y móviles (<1024px) con navegación a la ficha completa.

---

## 2. Alcance del Piloto Institucional (Cohorte 2026-I)

* **Capacidad del Piloto:** 15 estudiantes investigadores, 15 proyectos de tesis y 3 tutores principales, más coordinación académica.
* **Ciclo de 6 Etapas Académicas Obligatorias:**
  1. *Propuesta / Protocolo (Gate 0)*
  2. *Marco Teórico*
  3. *Metodología*
  4. *Recolección de Información*
  5. *Análisis y Resultados*
  6. *Documento Final y Sustentación*
* **Cálculo de Progreso:** `Progreso = (etapasAprobadas / 6) * 100` (valores normalizados: 0%, 17%, 33%, 50%, 67%, 83%, 100%).
* **Regla Mandatoria de Gate 0:** La conformidad de los 14 criterios de Gate 0 es un prerrequisito indispensable para que el tutor pueda aprobar la Etapa 1, pero **14/14 criterios nunca aprueban automáticamente** la etapa. El dictamen es siempre un acto explícito, documentado y motivado por el tutor.
* **Trazabilidad Inmutable:** Cada decisión, observación o entrega se registra cronológicamente en la bitácora con autor, fecha, notas y compromisos acordados.

---

## 3. Pila Tecnológica (Stack)

* **Frontend:** React 19.2.8, React DOM, Vite 8.3.4.
* **Transiciones y Motion:** `motion` 14.3.0 para transiciones de diseño fluidas.
* **Iconografía:** `lucide-react` 1.55.0.
* **Estilos y Tokens:** Tailwind CSS 4.3.3 con variables de diseño institucional (`tokens.css`) inspiradas en papel de archivo, tipografía editorial (`Georgia`, `font-editorial`) y números tabulares (`tabular-nums`).
* **Calidad y Linter:** Oxlint 1.81.0 con soporte de hooks de React y validaciones de pureza de React Compiler (**0 errores, 0 advertencias**).
* **Pruebas de Calidad:**
  * *Unitarias / Dominio:* script de Node con `node:assert` (`npm test`) validando reglas de etapa, progreso, Gate 0 y sanitización CSV.
  * *End-to-End y Responsive:* Playwright 1.64.0 (`verify-app.mjs`) validando resoluciones en 1440px, 1024px, 768px y 390px sin desbordamiento horizontal y con 0 errores de consola.
* **Persistencia y Backend:** Supabase / PostgreSQL 15+ (migraciones versionadas, 12 tablas relacionales, triggers de auditoría y RLS restrictivo).
* **Despliegue Continuo:** GitHub Pages mediante GitHub Actions (`.github/workflows/deploy.yml`) con base relativa (`base: './'`).

---

## 4. Instalación y Ejecución Local

### Prerrequisitos
* Node.js v20 o superior.
* npm v10 o superior.

### Comandos de Desarrollo
```bash
# 1. Clonar el repositorio
git clone https://github.com/The-SnitchLg/LG_Artifacts.git
cd LG_Artifacts

# 2. Instalar dependencias exactas
npm ci

# 3. Iniciar el servidor de desarrollo local
npm run dev

# 4. Ejecutar el análisis estático de código (linter)
npm run lint

# 5. Ejecutar pruebas unitarias de dominio
npm test

# 6. Compilar para producción
npm run build

# 7. Vista previa de la compilación de producción
npm run preview

# 8. Ejecutar pruebas E2E y capturas multi-dispositivo con Playwright
node verify-app.mjs
```

---

## 5. Estructura del Repositorio

```
├── docs/                     # Documentación arquitectónica, técnica y de UX
│   ├── architecture/         # Informes de auditoría y rediseño Academic Flow 2.0
│   ├── database/             # Esquema relacional y especificaciones de base de datos
│   └── ux/                   # Guías visuales y flujos de usuario
├── screenshots/              # Capturas automáticas multi-dispositivo (1440px, 1024px, 768px, 390px)
├── src/
│   ├── components/           # Componentes base y diseño accesible
│   │   ├── layout/           # RoleSidebar, TopbarCompact, AdaptiveContextPanel
│   │   └── StatusBadge.jsx   # Pastillas semánticas accesibles WCAG 2.2 AA
│   ├── data/                 # Datos del piloto (15 proyectos, Gate 0, Fase 0)
│   ├── domain/               # Lógica pura de negocio (etapas, cálculo, Gate 0, CSV)
│   ├── features/             # Módulos por responsabilidad
│   │   ├── admin/            # AdminWorkspace (Cohorte, métricas, filtros)
│   │   ├── student/          # StudentWorkspace (Avance, siguiente paso, evidencias)
│   │   └── tutor/            # TutorWorkspace (Bandeja maestro-detalle, dictámenes)
│   ├── styles/               # Tokens de diseño editorial y Tailwind CSS
│   ├── App.jsx               # Orquestador del espacio de trabajo por rol
│   └── main.jsx              # Punto de entrada de React
├── tests/                    # Pruebas unitarias de dominio (node:assert)
├── verify-app.mjs            # Suite de verificación Playwright E2E y multi-resolución
└── package.json              # Configuración de dependencias y scripts
```

---

## 6. Verificación de Accesibilidad (WCAG 2.2 AA)

* **Contraste de Color:** Todas las combinaciones de texto y fondo cumplen con el ratio mínimo de 4.5:1 para texto normal y 3:1 para elementos de interfaz gráfica.
* **Navegación por Teclado:** Trampas de foco en paneles modulares y soporte nativo de la tecla `Escape` para cerrar diálogos y cajones.
* **Modo de Movimiento Reducido:** Implementación de `@media (prefers-reduced-motion: reduce)` en `index.css` que desactiva transiciones y animaciones para usuarios con sensibilidad vestibular.
* **Semántica y Lectores de Pantalla:** Atributos `aria-label`, `aria-modal`, `aria-expanded`, `aria-current` y roles ARIA semánticos en todos los elementos interactivos.

---

## 7. Licencia y Créditos

Proyecto desarrollado como plataforma de seguimiento académico institucional para trabajos de grado de pregrado y posgrado.

* **Desarrollo y Arquitectura:** The-SnitchLg / Antigravity AI
* **Diseño UI/UX:** Inspirado en las directrices de diseño de Framer, Kira Learning y Gumloop.
