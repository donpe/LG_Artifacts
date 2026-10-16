# Registro de cambios

Bitácora de los cambios hechos sobre el prototipo original de
[The-SnitchLg/LG_Artifacts](https://github.com/The-SnitchLg/LG_Artifacts), trabajados en el fork
[donpe/LG_Artifacts](https://github.com/donpe/LG_Artifacts).

Su objetivo es que el dueño del proyecto entienda **qué cambió, por qué, dónde y cómo comprobarlo**,
sin tener que leer todo el código.

## Cómo está organizado el trabajo

```
main                              ← igual al repositorio original; no se modifica
└── fase-N/<nombre-de-la-fase>    ← rama que integra todos los cambios de una fase
    └── <tipo>/<descripcion>      ← una rama por cada cambio, con su propio Pull Request
```

| Prefijo  | Uso                                                    |
|----------|--------------------------------------------------------|
| `feat/`  | Funcionalidad nueva o cambio de comportamiento         |
| `fix/`   | Corrección de un error                                 |
| `chore/` | Limpieza, datos o configuración sin cambio funcional   |
| `docs/`  | Solo documentación                                     |
| `fase-N/`| Rama de integración de una fase                        |

Cada cambio se integra a su fase mediante un Pull Request dentro del fork. Al cerrar una fase,
la rama `fase-N/...` queda lista para proponerse al repositorio original.

## Hoja de ruta

| Fase | Objetivo | Estado |
|------|----------|--------|
| 1 · Victorias tempranas | Corregir lo que se ve roto en la demo y aplicar las reglas de negocio que ya existían | Lista para revisión |
| 2 · Identidad EAFIT | Paleta, tipografía y estructura visual inspiradas en eafit.edu.co | En curso |
| 3 · Que se entienda sola | Pantalla "¿Cómo funciona?", recorrido guiado, ayudas y mensajes claros | Pendiente |
| 4 · Funcionalidad con valor | Compromisos, carga de archivos, tablero de coordinación, exportación por cohorte | Pendiente |

---

## Fase 1 · Victorias tempranas

Rama de integración: `fase-1/victorias-tempranas`

### 1.1 Criterios de Gate 0 aparecían vacíos — `fix/criterios-gate0-vacios-en-vista-tutor`

**Problema.** En la pestaña *Criterios* del tutor, en el panel lateral y en el modal de Gate 0, los
14 criterios se mostraban como casillas sin texto.

**Causa.** Las pantallas leían los campos `code`, `title` y `description`, pero el catálogo
(`src/data/gate0Catalog.js`) define `id`, `label` y `suggestedCheck`. Los valores llegaban como
`undefined` y no se pintaba nada.

**Cambio.** Las tres pantallas ahora leen los campos reales del catálogo.

**Archivos.**
- `src/features/tutor/TutorWorkspace.jsx`
- `src/components/layout/AdaptiveContextPanel.jsx`
- `src/features/gate0/Gate0Modal.jsx`

**Cómo comprobarlo.** Entrar como *Tutor*, seleccionar cualquier proyecto y abrir la pestaña
*Criterios*: cada casilla muestra su código (G0-01…G0-14), el criterio y la verificación sugerida.

### 1.2 Aplicar las reglas de etapas en la interfaz — `feat/aplicar-reglas-de-transicion-de-etapas`

**Problema.** `src/domain/stageMachine.js` ya tenía las reglas del flujo académico (`canTransition`),
pero solo las usaban los tests. En la interfaz se podía:
- entregar evidencia en una etapa futura (por ejemplo la 4 sin tener aprobada la 3);
- aprobar una etapa sin que la anterior estuviera aprobada;
- aprobar o solicitar cambios sobre una etapa sin entrega.

**Cambio.**
- Nueva función `getStageActions()` en `stageMachine.js`. Para la etapa activa y el rol actual responde
  si se puede **entregar**, **aprobar** o **solicitar cambios**, y por qué no cuando está bloqueado.
  Reutiliza `canTransition`, así que las reglas siguen en un solo lugar.
- `App.jsx` calcula `stageActions` una vez y lo pasa a las vistas. Los manejadores también lo validan
  (si algo llega por otra vía, se muestra el motivo en un aviso y no se cambia el estado).
- Tutor: *Aprobar etapa* y *Solicitar cambios* se deshabilitan cuando no aplican y se muestra el motivo.
- Estudiante: en una etapa bloqueada, el botón de entrega se reemplaza por el motivo.
- Panel lateral: el formulario de aprobación explica cualquier bloqueo, no solo el de Gate 0.
- Mensajes de las reglas corregidos con tildes.
- Nuevas pruebas en `tests/domain.test.mjs` para `getStageActions`.

**Decisión.** Mientras una etapa está *en revisión*, el estudiante puede subir una nueva versión
(reemplaza la entrega sin perder las anteriores). Las reglas originales no contemplaban este caso.

**Archivos.** `src/domain/stageMachine.js`, `src/App.jsx`, `src/features/tutor/TutorWorkspace.jsx`,
`src/features/student/StudentWorkspace.jsx`, `src/components/layout/AdaptiveContextPanel.jsx`,
`tests/domain.test.mjs`.

**Cómo comprobarlo.**
1. Rol *Tutor*, proyecto de Mateo R. (Gate 0 en 12/14): *Aprobar etapa* está deshabilitado y explica que faltan criterios.
2. Rol *Estudiante*, clic en *Etapa 4*: en lugar del botón de entrega aparece "No se puede habilitar una etapa si la anterior no está aprobada."
3. `npm test` incluye los casos nuevos.

### 1.3 Cada tutor ve solo sus proyectos — `feat/filtrar-proyectos-por-tutor`

**Problema.** La bandeja del tutor mostraba los 15 proyectos de la cohorte. Además, el nombre del tutor
en el encabezado cambiaba según el proyecto seleccionado y el perfil de la barra lateral decía siempre
"Dra. Ana Martínez", que no existe en los datos.

**Cambio.**
- `App.jsx` guarda el **tutor simulado** (`demoTutorId`) y filtra `tutorProjects` por `tutorId`.
- En el encabezado del tutor hay un selector **"Ver como:"** para cambiar de tutor en la demo.
  Al cambiar, se abre el primer proyecto de su bandeja.
- El contador de *Pendientes de revisión* cuenta solo los proyectos del tutor.
- Al entrar al rol *Tutor*, si el proyecto abierto no es suyo, se abre el primero de su bandeja.
- La barra lateral muestra el nombre real: el tutor simulado o el estudiante del proyecto abierto.

**Nota.** Esto es solo una simulación para la demo. No es control de acceso: cuando exista login,
el filtro debe venir de la base de datos (las políticas RLS de Supabase ya están pensadas para eso).

**Archivos.** `src/App.jsx`, `src/features/tutor/TutorWorkspace.jsx`, `src/components/layout/RoleSidebar.jsx`.

**Cómo comprobarlo.** Rol *Tutor* → *Ver como: Dra. Sofía Mendoza*: la bandeja muestra 5 proyectos y el
perfil de la barra lateral dice "Dra. Sofía Mendoza".

### 1.4 Semáforo de riesgo calculado automáticamente — `feat/calcular-riesgo-automaticamente`

**Problema.** El nivel de riesgo se guardaba como un dato fijo en cada proyecto y `App.jsx` lo
sobrescribía a mano (`'Medio'` al observar, `'Bajo'` al aprobar). La función `calculateRiskLevel`
existía, pero no se usaba. Además, el riesgo no se veía en la tabla de coordinación ni en la bandeja
del tutor.

**Cambio.**
- Nueva `describeRisk()` en `src/domain/progressCalculator.js`, que devuelve el nivel **y el motivo**:
  1. **Alto**: hay compromisos pendientes vencidos.
  2. **Medio**: el tutor solicitó cambios (etapa observada).
  3. **Completado**: las 6 etapas están aprobadas.
  4. **Bajo**: avance sin alertas.
- `calculateRiskLevel()` ahora usa `describeRisk()`. El vencido tiene prioridad sobre el observado.
- `App.jsx` ya no guarda el riesgo: lo calcula para cada proyecto (`riskLevel`, `riskReason`).
- El semáforo se ve en la tabla de coordinación, en la bandeja del tutor (solo si no es *Bajo*)
  y en la ficha del panel lateral. El motivo aparece al pasar el cursor.
- Nuevo estado visual *Completado* y su opción en el filtro de coordinación.
- Pruebas nuevas en `tests/domain.test.mjs`.

**Archivos.** `src/domain/progressCalculator.js`, `src/App.jsx`, `src/components/StatusBadge.jsx`,
`src/features/admin/AdminWorkspace.jsx`, `src/features/tutor/TutorWorkspace.jsx`,
`src/components/layout/AdaptiveContextPanel.jsx`, `tests/domain.test.mjs`.

**Cómo comprobarlo.** Rol *Administrador*: la tabla muestra el riesgo de cada proyecto (el de Jorge
Benavides aparece en *Medio*). Rol *Tutor*: al solicitar cambios en un proyecto, su riesgo pasa a *Medio*.
Con los datos variados de la sección 1.6 aparecen también casos *Alto* y *Completado*.

### 1.5 La demo recuerda los cambios — `feat/guardar-demo-en-navegador`

**Problema.** Todo vivía en memoria (`useState`): al recargar la página se perdían las entregas,
observaciones y aprobaciones hechas durante una demostración.

**Cambio.**
- Nuevo módulo `src/data/demoStorage.js` que guarda los proyectos en `localStorage` del navegador
  y los recupera al abrir la app. Si el navegador bloquea el almacenamiento, la demo sigue funcionando
  sin recordar cambios.
- `App.jsx` carga lo guardado al iniciar y guarda en cada cambio.
- Botón **Reiniciar demo** (ícono ↺ junto a "Modo demostración"): pide confirmación y vuelve a los
  datos semilla de `pilotData.js`.
- `DEMO_DATA_VERSION`: si se cambian los datos semilla, se sube este número y los navegadores
  descartan lo guardado con la versión anterior.

**Nota.** No es una base de datos: los cambios quedan solo en el navegador de quien usa la demo y no
se comparten con nadie. La persistencia real será Supabase (Fase 4).

**Archivos.** `src/data/demoStorage.js` (nuevo), `src/App.jsx`, `src/components/layout/TopbarCompact.jsx`.

**Cómo comprobarlo.** Rol *Estudiante* → *Subir nueva evidencia* → recargar la página: la entrega
sigue ahí. Luego ↺ *Reiniciar demo*: vuelve el estado original.

### 1.6 Datos del piloto variados y con contexto EAFIT — `chore/datos-piloto-variados-contexto-eafit`

**Problema.**
- Los 15 proyectos estaban casi todos "En revisión": la demo no mostraba proyectos completados,
  atrasados ni en riesgo.
- El contexto era de otra universidad: correos `@universidad.edu.pe`, "Dirección de Grados y Títulos",
  facultades que no existen en EAFIT y apellidos poco usuales en Colombia.
- Las fechas estaban fijas en octubre de 2026: con el paso de los días todos los compromisos
  quedarían vencidos y todo saldría en riesgo alto.
- Las 6 etapas estaban definidas dos veces (en `pilotData.js` y en `stageMachine.js`), con textos distintos.
- Un proyecto con las 6 etapas aprobadas se mostraba como "Etapa 1".

**Cambio.**
- `src/data/pilotData.js` reescrito:
  - Tutores asociados a escuelas de EAFIT (Administración; Ciencias Aplicadas e Ingeniería;
    Finanzas, Economía y Gobierno), estudiantes con nombres colombianos, cohorte `2026-1`,
    códigos `MAE-2026-…` y coordinación "Coordinación de la Maestría".
  - Correos con el dominio ficticio `@ejemplo.edu.co`, para no apuntar a buzones reales.
  - Temas ajustados a las escuelas (los de salud se reemplazaron por finanzas, economía y gobierno).
  - **Fechas relativas al día en que se abre la demo** (`isoDate(-4)`, `shortDate(8)`…), así el
    semáforo se ve igual siempre.
  - Casos cubiertos (el resumen está al inicio de la lista en el código):
    | Caso | Proyectos |
    |------|-----------|
    | Riesgo alto (compromiso vencido) | PRJ-06, PRJ-07, PRJ-08 |
    | Cambios solicitados (riesgo medio) | PRJ-03, PRJ-04, PRJ-11 |
    | Completados (6/6) | PRJ-13, PRJ-15 |
    | Listo para aprobar Etapa 1 (Gate 0 14/14) | PRJ-05 |
    | Etapa 1 con Gate 0 incompleto | PRJ-01, PRJ-09 |
  - Las etapas se construyen desde `STAGE_DEFINITIONS` de `stageMachine.js` (una sola definición).
- Descripciones de las etapas con tildes en `stageMachine.js`.
- Nueva `getCurrentStage()` en `progressCalculator.js`: si todo está aprobado, la etapa actual es la
  última aprobada. La usan la coordinación, la bandeja del tutor y `App.jsx`.
- `DEMO_DATA_VERSION` sube a 2 para descartar datos guardados con la semilla anterior.
- Nueva prueba: los datos deben tener riesgos *Alto*, *Medio*, *Bajo* y *Completado*, y 5 proyectos por tutor.

**Archivos.** `src/data/pilotData.js`, `src/data/demoStorage.js`, `src/domain/stageMachine.js`,
`src/domain/progressCalculator.js`, `src/App.jsx`, `src/features/admin/AdminWorkspace.jsx`,
`src/features/tutor/TutorWorkspace.jsx`, `tests/domain.test.mjs`.

**Cómo comprobarlo.** Rol *Administrador*: la tabla muestra los cuatro niveles de riesgo y los proyectos
completados aparecen en "Etapa 6 · Documento Final". Rol *Tutor* → *Ver como: Dra. Elena Ramos* →
proyecto de Diego Morales: Gate 0 en 14/14 y *Aprobar etapa* habilitado.

### 1.7 Eliminar componentes sin uso — `chore/eliminar-componentes-sin-uso`

**Problema.** Tras los rediseños anteriores quedaron archivos que ninguna parte de la app importaba
(entre ellos el prototipo original `FichaProyecto.jsx`, de 982 líneas). Además, tres modales se
montaban en `App.jsx`, pero ningún botón los abría. Confundían al leer el código y se seguían
"manteniendo" sin efecto, como pasó con el arreglo de la sección 1.1 en `Gate0Modal.jsx`.

**Cambio.** Se eliminan:

| Archivo | Motivo |
|---------|--------|
| `src/FichaProyecto.jsx` | Prototipo monolítico original, reemplazado por las vistas por rol |
| `src/components/ContextDrawer.jsx`, `src/components/NextStepBanner.jsx` | Versiones anteriores del panel lateral y de la tarjeta "siguiente paso" |
| `src/features/navigation/TopNav.jsx`, `DemoNoticeBanner.jsx` | Reemplazados por `TopbarCompact` |
| `src/features/portfolio/ProjectPortfolio.jsx`, `projects/ProjectHeader.jsx` | Reemplazados por `AdminWorkspace` y `TutorWorkspace` |
| `src/features/stages/StageStepper.jsx`, `StageDetail.jsx` | Reemplazados por el riel de etapas de `StudentWorkspace` |
| `src/features/bitacora/BitacoraSection.jsx`, `evidence/EvidenceManager.jsx` | Reemplazados por el panel lateral |
| `src/features/gate0/Gate0Modal.jsx`, `phase0/Phase0Modal.jsx`, `review/TutorReviewModal.jsx` | Se montaban, pero nunca se abrían; su función ya está en el panel lateral |
| `src/App.css`, `src/assets/*` | Restos de la plantilla inicial de Vite, sin referencias |

También se actualizó el `README.md`: estructura de carpetas, las pruebas usan `node:assert` (no Vitest)
y enlace a este registro.

**Resultado.** Mismo comportamiento con 18 archivos menos; el paquete de JavaScript bajó de ~339 kB a ~326 kB.

**Cómo comprobarlo.** `npm run lint`, `npm test` y `npm run build` pasan; las vistas de Estudiante,
Tutor y Administrador cargan sin errores en consola.

---

### Resumen de la Fase 1

| # | Cambio | PR en el fork |
|---|--------|---------------|
| 1.1 | Criterios de Gate 0 visibles | [#1](https://github.com/donpe/LG_Artifacts/pull/1) |
| 1.2 | Reglas de etapas aplicadas en la interfaz | [#2](https://github.com/donpe/LG_Artifacts/pull/2) |
| 1.3 | Cada tutor ve solo sus proyectos | [#3](https://github.com/donpe/LG_Artifacts/pull/3) |
| 1.4 | Semáforo de riesgo automático | [#4](https://github.com/donpe/LG_Artifacts/pull/4) |
| 1.5 | La demo recuerda los cambios | [#5](https://github.com/donpe/LG_Artifacts/pull/5) |
| 1.6 | Datos variados con contexto EAFIT | [#6](https://github.com/donpe/LG_Artifacts/pull/6) |
| 1.7 | Eliminación de código sin uso | [#7](https://github.com/donpe/LG_Artifacts/pull/7) |

**Verificación.** Lint sin errores, pruebas de dominio en verde (con casos nuevos para reglas de etapa,
riesgo y datos) y build correcto. Revisión manual de los tres roles en el navegador.
La suite E2E (`node verify-app.mjs`) no se ejecutó: necesita descargar el navegador de Playwright
(`npx playwright install chromium`).

**Pendiente para fases siguientes** (observado durante la Fase 1):
- Estudiante: al hacer clic en una etapa futura, la tarjeta dice "Entrega la evidencia formal de la
  Etapa #4" y el riel la marca "En curso", aunque está bloqueada (Fase 3: mensajes claros).
- Al aprobar una etapa, la siguiente pasa directo a "En revisión" sin entrega del estudiante; así lo
  define la regla original de negocio, pero conviene revisarlo con el dueño del producto.
- Los compromisos no se pueden crear ni cerrar desde la interfaz (Fase 4).

---

## Fase 2 · Identidad visual inspirada en EAFIT

Rama de integración: `fase-2/identidad-visual-eafit` (parte de `fase-1/victorias-tempranas`).

**Referencia.** eafit.edu.co: azul marino `#000066`, azul vivo `#146AEF`, cian `#00A9E0`, mucho blanco y
negro, tipografía **Inter** con títulos de peso alto, bloques sólidos de color, esquinas casi rectas y pie
de página oscuro. Es una *inspiración*: no se usa el logo oficial ni se presenta como sitio de la
universidad. Usar la marca requiere aprobación institucional.

### 2.1 Paleta y tipografía — `feat/paleta-y-tipografia-inspiradas-en-eafit`

**Problema.** La interfaz tenía una estética cálida (crema, café, títulos serif Georgia) que no se
relaciona con EAFIT. Además, los colores estaban escritos a mano en cada componente: **80 tonos distintos**
en 484 clases como `bg-[#6E432F]`, así que cambiar la identidad obligaba a tocar todos los archivos.

**Cambio.**
- `src/styles/tokens.css` reescrito con la paleta nueva y comentarios de uso. Es la **única fuente de colores**.
- Los 484 colores fijos de los componentes se reemplazaron por variables (`bg-(--brand)`, `text-(--muted)`…).
  Los 80 tonos se agruparon en 30 variables:

  | Antes (tonos cálidos) | Variable | Ahora |
  |---|---|---|
  | Café `#6E432F` y similares | `--brand` | Azul marino `#000066` |
  | Terracota `#8E4928` | `--accent` | Azul `#146AEF` |
  | Crema `#FBF9F5` y 12 variantes | `--bg` / `--surface-subtle` | Grises fríos `#F4F5F7` / `#F8F9FA` |
  | Arena `#E8E1D5` y similares | `--line` / `--line2` | Grises `#E3E5E8` / `#C9CDD3` |
  | Carbón cálido `#1C1917`… | `--ink` / `--muted` / `--light` | Negros y grises neutros |
  | Verde, ámbar, rojo de estados | `--green`, `--amber`, `--red`… | Sin cambio (ya cumplían contraste AA) |
- Fuente **Inter** cargada desde Google Fonts en `index.html` (antes se pedía, pero no se cargaba).
- Los títulos (`.font-editorial` en `src/index.css`) pasan de serif Georgia a Inter 800.
- El contorno de foco del teclado usa el azul `--accent`.

**Archivos.** `src/styles/tokens.css`, `src/index.css`, `index.html` y todos los `.jsx` de `src/`
(solo cambian los colores; la estructura queda igual).

**Cómo comprobarlo.** `npm run dev`: la app se ve en azul marino, blanco y grises, con títulos en Inter.
Para probar otra paleta basta con editar `src/styles/tokens.css`.
