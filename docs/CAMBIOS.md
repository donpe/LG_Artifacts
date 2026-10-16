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
| 2 · Identidad visual | Paleta, tipografía y estructura visual de estilo institucional | Lista para revisión |
| 3 · Que se entienda sola | Pantalla "¿Cómo funciona?", recorrido guiado, ayudas y mensajes claros | Lista para revisión |
| 4 · Navegación y estructura | Menú con una pantalla por opción, direcciones propias, ficha del proyecto como página y decisiones en ventana | En curso |
| 5 · Funcionalidad con valor | Compromisos, carga de archivos, exportación por cohorte, Supabase con inicio de sesión | Pendiente |

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

## Fase 2 · Identidad visual

Rama de integración: `fase-2/identidad-visual` (parte de `fase-1/victorias-tempranas`).

**Dirección visual.** Estilo institucional sobrio: azul marino `#000066`, azul vivo `#146AEF`, cian `#00A9E0`,
mucho blanco y negro, tipografía **Inter** con títulos de peso alto, bloques sólidos de color, esquinas casi
rectas y pie de página oscuro. No se usa ningún logo ni marca institucional.

### 2.1 Paleta y tipografía — `feat/paleta-y-tipografia`

**Problema.** La interfaz tenía una estética cálida (crema, café, títulos serif Georgia) poco
institucional. Además, los colores estaban escritos a mano en cada componente: **80 tonos distintos**
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

### 2.2 Barra lateral, cabecera y pie — `feat/barra-lateral-cabecera-y-pie`

**Problema.** Con la paleta nueva, la estructura seguía con la apariencia anterior: barra lateral
clara, cabecera translúcida y pie blanco con textos internos ("Diseño Academic Flow 2.0 · Español nativo")
que no le dicen nada a un usuario.

**Cambio.**
- **Barra lateral** en azul marino (`--brand`) con texto blanco. La opción activa se marca con una
  franja cian a la izquierda. El contador de pendientes y
  el avatar del perfil van en cian.
- **Cabecera** blanca y sólida con una línea inferior azul marino (antes era translúcida).
- **Pie de página** oscuro (`--footer-bg`) con un texto útil: "Prototipo de demostración con datos
  ficticios · 6 etapas · Gate 0 (14 criterios)".

**Pendiente de decisión.** El nombre y emblema ("LG · Academic Flow") se mantienen. Cambiarlos es una
decisión del dueño del proyecto; no se usa ningún logo institucional sin aprobación.

**Archivos.** `src/components/layout/RoleSidebar.jsx`, `src/components/layout/TopbarCompact.jsx`, `src/App.jsx`.

**Cómo comprobarlo.** `npm run dev`: barra lateral azul marino con la opción activa marcada en cian,
cabecera blanca con línea azul y pie oscuro.

### 2.3 Títulos, tarjetas y botones — `feat/titulos-tarjetas-y-botones`

**Problema.** Las tarjetas y botones tenían esquinas muy redondeadas (12–16 px) y sombras suaves, con un
aire de aplicación genérica. Los títulos de página eran pequeños para el estilo institucional, que usa
titulares grandes y contundentes.

**Cambio.**
- Esquinas casi rectas: `rounded-xl`, `rounded-2xl` y `rounded-lg` pasan a `rounded-(--radius)` (6 px,
  definido en `tokens.css`), en 75 lugares. Las pastillas de estado y los avatares siguen redondos.
- Sin sombras decorativas en tarjetas y botones (26 lugares): el diseño queda plano, con bordes.
- Títulos de página (*Mi proyecto*, *Pendientes de revisión*, *Proyectos de grado*) más grandes
  (`text-4xl`) y en azul marino.
- Cabecera móvil: el texto "LG Artifacts" se oculta en pantallas pequeñas porque se montaba sobre el
  chip "Demo" (el nombre ya aparece en el menú lateral).

**Archivos.** Todos los `.jsx` de `src/` (solo clases de forma), `src/components/layout/TopbarCompact.jsx`.

**Cómo comprobarlo.** `npm run dev` en escritorio y en ancho de celular (375 px): tarjetas planas con
esquinas casi rectas, títulos grandes en azul marino y sin desbordamiento horizontal.

---

### Resumen de la Fase 2

| # | Cambio | PR en el fork |
|---|--------|---------------|
| 2.1 | Paleta y tipografía con tokens centralizados | [#8](https://github.com/donpe/LG_Artifacts/pull/8) |
| 2.2 | Barra lateral, cabecera y pie | [#9](https://github.com/donpe/LG_Artifacts/pull/9) |
| 2.3 | Títulos, tarjetas y botones | [#10](https://github.com/donpe/LG_Artifacts/pull/10) |

**Verificación.** Lint y pruebas en verde, build correcto y revisión visual de Estudiante, Tutor y
Administrador en escritorio y en 375 px (sin desbordamiento horizontal).

**Decisiones abiertas para el dueño del proyecto.**
- Nombre y emblema de la plataforma ("LG · Academic Flow").
- Si se usará algún logo o marca institucional (requiere aprobación). Mientras tanto, ninguno.
- Las capturas de `screenshots/` y de la raíz son del diseño anterior. Se regeneran con
  `node verify-app.mjs` (requiere `npx playwright install chromium`).

---

## Fase 3 · Que se entienda sola

Rama de integración: `fase-3/que-se-entienda-sola` (parte de `fase-2/identidad-visual`).

**Objetivo.** Que alguien que nunca ha visto la plataforma (un tutor, la coordinación, el dueño del
proyecto) entienda en pocos minutos para qué sirve y cómo se usa, sin que nadie se la explique.

### 3.1 Pantalla "¿Cómo funciona?" — `feat/pantalla-de-bienvenida-como-funciona`

**Problema.** La app abría directamente en la bandeja del tutor, sin contexto. No se explicaba qué
problema resuelve, cómo avanza una etapa, qué es Gate 0 ni qué hace cada rol, y el cambio de rol estaba
escondido en un desplegable.

**Cambio.**
- Nueva `src/features/onboarding/WelcomeScreen.jsx`, que se muestra **la primera vez** que se abre la demo:
  1. Qué es: "Seguimiento de trabajos de grado", con una frase sobre el problema (reemplaza el Excel compartido).
  2. **Así avanza cada etapa**: entrega → revisión → aprobación o cambios → siguiente etapa.
  3. **Las 6 etapas** y la regla de **Gate 0** en lenguaje simple.
  4. **¿Con qué rol quieres empezar?**: tres tarjetas (Estudiante, Tutor, Coordinación) con lo que puede
     hacer cada rol y un botón *Entrar como…*.
- Opción **¿Cómo funciona?** en la barra lateral para volver a verla.
- *Reiniciar demo* (↺) también vuelve a mostrarla, útil antes de una presentación.
- `demoStorage.js` incorpora `hasSeen` / `markSeen` / `clearSeenFlags` para recordar qué se ha visto
  en este navegador.

**Archivos.** `src/features/onboarding/WelcomeScreen.jsx` (nuevo), `src/App.jsx`,
`src/components/layout/RoleSidebar.jsx`, `src/data/demoStorage.js`.

**Cómo comprobarlo.** Abrir la demo en una ventana privada (o tras ↺ *Reiniciar demo*): aparece la
pantalla de bienvenida. *Entrar como tutor* lleva a la bandeja. *¿Cómo funciona?* en la barra lateral
vuelve a mostrarla.

### 3.2 Glosario y ayudas de términos — `feat/glosario-y-ayudas-de-terminos`

**Problema.** La interfaz usa términos propios (Gate 0, Fase 0, evidencia, bitácora, compromiso,
"Cambios solicitados", riesgo) sin explicarlos. El panel *Ayuda contextual* mostraba una lista técnica
("Cálculo exacto: (etapas aprobadas / 6) × 100", "Trazabilidad inmutable") pensada para desarrolladores.

**Cambio.**
- Nuevo `src/data/glossary.js` con 11 definiciones cortas en lenguaje simple.
- Nuevo componente `src/components/Term.jsx`: la palabra aparece con subrayado punteado y, al pasar el
  cursor **o al enfocarla con el teclado**, muestra la definición en un recuadro azul marino.
  Se usa en *Gate 0* (tutor), *Evidencia*, *compromiso* y *Bitácora* (estudiante) y *riesgo* (coordinación).
- `StatusBadge`: cada pastilla de estado o de riesgo muestra su significado al pasar el cursor.
- *Ayuda contextual* (barra lateral) ahora muestra el **glosario completo**.

**Archivos.** `src/data/glossary.js` (nuevo), `src/components/Term.jsx` (nuevo), `src/components/StatusBadge.jsx`,
`src/components/layout/AdaptiveContextPanel.jsx`, `src/features/tutor/TutorWorkspace.jsx`,
`src/features/student/StudentWorkspace.jsx`, `src/features/admin/AdminWorkspace.jsx`.

**Cómo comprobarlo.** Rol *Tutor*: pasar el cursor sobre "Gate 0" en *Auditoría Gate 0*. Pasar el cursor
sobre cualquier pastilla ("En revisión", "Riesgo Alto"). Barra lateral → *Ayuda contextual* → glosario.

### 3.3 Mensajes claros según el estado de la etapa — `fix/mensajes-claros-segun-estado-de-la-etapa`

**Problema.** En la vista del estudiante:
- Al hacer clic en una etapa futura, la tarjeta decía "Entrega la evidencia formal de la Etapa #4" aunque
  estaba bloqueada, y el riel la marcaba como "En curso" solo por estar seleccionada.
- El riel mostraba "Pendiente" para todo lo que no estuviera aprobado, sin distinguir entre la etapa
  que sigue y las que aún están lejos.
- En celular, el texto de cambios solicitados mostraba literalmente `&bull;`.
- Algunos textos eran rebuscados ("Has culminado con éxito esta etapa académica", "dictamen").

**Cambio.**
- El riel muestra el estado real de cada etapa: *Aprobada*, *En revisión*, *Cambios solicitados*,
  *Por entregar* (la siguiente habilitada) o *Bloqueada*. La que se está mirando se marca "· viendo".
- La tarjeta *Tu siguiente paso* explica cada caso en lenguaje simple:
  - **Bloqueada**: "La Etapa 4 aún no está habilitada. Se habilita cuando el tutor apruebe la Etapa 3.
    Por ahora tu trabajo está en la Etapa 1", con el botón **Ir a mi etapa actual**.
  - **Aprobada**: "La Etapa N ya está aprobada… No necesitas hacer nada más", con el mismo botón.
  - **En revisión**: explica que el tutor está revisando y que se puede subir una nueva versión
    (botón *Subir nueva versión*).
- Corregido el `&bull;` literal en la vista móvil.

**Archivos.** `src/features/student/StudentWorkspace.jsx`.

**Cómo comprobarlo.** Rol *Estudiante* (Mateo Restrepo) → clic en la Etapa 4: el riel dice "Bloqueada · viendo"
y la tarjeta explica por qué, con *Ir a mi etapa actual (Etapa 1)*.

### 3.4 Recorrido guiado por rol — `feat/recorrido-guiado-por-rol`

**Problema.** Aun sabiendo qué hace cada rol, al entrar a su pantalla no era obvio dónde mirar
primero ni dónde estaban las acciones importantes.

**Cambio.**
- Nuevo `src/features/onboarding/GuidedTour.jsx`: oscurece la pantalla, resalta un elemento con un marco
  cian y muestra una tarjeta con *Anterior / Siguiente / Saltar recorrido* (Escape también cierra).
  La tarjeta se ubica debajo o encima del elemento según el espacio.
- Nuevo `src/data/tourSteps.js` con los pasos de cada rol:
  - **Estudiante (4):** riel de etapas → tu siguiente paso → compromisos y observaciones → cambiar de rol.
  - **Tutor (4):** bandeja → *Ver como* → pestañas de revisión → botones de decisión.
  - **Coordinación (3):** indicadores → buscar y filtrar → tabla con semáforo.
- Los elementos señalados llevan un atributo `data-tour="…"` en `StudentWorkspace`, `TutorWorkspace`,
  `AdminWorkspace` y `TopbarCompact`.
- El recorrido se abre **la primera vez que se entra a cada rol** (desde la bienvenida o el selector) y
  desde la nueva opción **Ver recorrido** de la barra lateral. *Reiniciar demo* lo vuelve a habilitar.

**Detalle técnico.** El oscurecido se arma con cuatro paneles alrededor del elemento, no con una sombra
gigante, porque esta última no se dibuja de forma fiable en todos los navegadores.

**Limitación conocida.** Si el elemento es muy alto (por ejemplo, el riel de etapas en pantallas bajas),
la tarjeta puede tapar su parte inferior.

**Archivos.** `src/features/onboarding/GuidedTour.jsx` (nuevo), `src/data/tourSteps.js` (nuevo), `src/App.jsx`,
`src/components/layout/RoleSidebar.jsx`, `src/components/layout/TopbarCompact.jsx`,
`src/features/student/StudentWorkspace.jsx`, `src/features/tutor/TutorWorkspace.jsx`,
`src/features/admin/AdminWorkspace.jsx`.

**Cómo comprobarlo.** Ventana privada → bienvenida → *Entrar como estudiante*: arranca el recorrido de 4 pasos.
Luego cambiar a *Tutor* en el selector: arranca el recorrido del tutor. *Ver recorrido* en la barra lateral lo repite.

### 3.5 Guion de demostración — `docs/guion-de-demostracion-y-cierre-fase-3`

**Cambio.** Nuevo `docs/GUION_DEMO.md`: recorrido de unos 3 minutos para presentar la plataforma
(bienvenida → coordinación → tutor aprueba → tutor pide cambios → estudiante corrige → exportar), con
qué hacer y qué decir en cada paso, usando casos reales de los datos del piloto. Enlazado desde el `README.md`.

**Verificación.** El flujo completo del guion se ejecutó en el navegador: Dra. Elena Ramos aprueba la
Etapa 1 de Diego Morales (pasa a Etapa 2), el Dr. Carlos Gutiérrez solicita cambios a Mateo Restrepo
(*Cambios solicitados*) y Mateo entrega una nueva versión (vuelve a *En revisión*, con 3 evidencias).

---

### Resumen de la Fase 3

| # | Cambio | PR en el fork |
|---|--------|---------------|
| 3.1 | Pantalla "¿Cómo funciona?" | [#11](https://github.com/donpe/LG_Artifacts/pull/11) |
| 3.2 | Glosario y ayudas de términos | [#12](https://github.com/donpe/LG_Artifacts/pull/12) |
| 3.3 | Mensajes claros según el estado de la etapa | [#13](https://github.com/donpe/LG_Artifacts/pull/13) |
| 3.4 | Recorrido guiado por rol | [#14](https://github.com/donpe/LG_Artifacts/pull/14) |
| 3.5 | Guion de demostración | [#15](https://github.com/donpe/LG_Artifacts/pull/15) |

**Verificación.** Lint y pruebas en verde, build correcto y guion completo ejecutado en el navegador.

**Pendiente observado (para la Fase 4 o para decidir con el dueño del proyecto).**
- Al aprobar una etapa, la siguiente pasa directo a *En revisión* sin entrega del estudiante (regla
  original). Con los mensajes nuevos, el estudiante lee "Tu entrega está en revisión del tutor" sin haber
  entregado. Propuesta: que la siguiente etapa quede *Por entregar*.
- El rol elegido no se recuerda al recargar la página (siempre vuelve a *Tutor*).
- Las marcas de tiempo nuevas de la bitácora usan un formato distinto al de los datos semilla
  (`16/10/26, 16:08` frente a `16/10/2026 16:08`).
- El recorrido no se abre solo para el rol inicial si se recarga la página sin pasar por la bienvenida
  (se puede abrir con *Ver recorrido*).

---

## Fase 4 · Navegación y estructura

Rama de integración: `fase-4/navegacion-y-estructura` (parte de `fase-3/que-se-entienda-sola`).

**Origen.** En la revisión de las fases 2 y 3 aparecieron estos problemas:
- El menú lateral se cortaba al bajar y dejaba una franja gris debajo.
- La mayoría de las opciones del menú no cambiaba la pantalla (*Etapas*, *Proyectos asignados*,
  *Asignaciones*…).
- El panel lateral ("medio pop-up") mezclaba 9 usos distintos: leer la ficha, la bitácora, los criterios,
  aprobar, pedir cambios, subir archivos…

**Regla de diseño adoptada.**

| Tipo | Para qué | Ejemplos |
|---|---|---|
| **Página** | El trabajo principal: lo que se lee y se recorre | Ficha del proyecto, etapas, bitácora, tabla de la cohorte |
| **Panel lateral** | Consultar algo rápido sin perder el lugar | Glosario, guía de Fase 0 |
| **Ventana de confirmación** | Una decisión corta e importante | Aprobar etapa, solicitar cambios, subir entrega |

### 4.1 El menú lateral se cortaba al bajar — `fix/menu-lateral-fijo-al-bajar`

**Causa.** El menú usa `position: sticky` para quedarse fijo, pero el contenedor principal tenía
`overflow-x-hidden`. Eso lo convierte en un contenedor con desplazamiento propio y anula el `sticky`:
al bajar, el menú se iba con la página y debajo quedaba el fondo gris.

**Cambio.** `overflow-x-hidden` → `overflow-x-clip` en `src/App.jsx`. Sigue evitando el desplazamiento
horizontal, pero sin romper el menú fijo.

**Cómo comprobarlo.** Bajar hasta el final de cualquier pantalla: el menú azul ocupa siempre toda la altura.

### 4.2 Fase 2 sin referencias a marcas — `docs/quitar-referencias-de-marca-en-fase-2`

**Pedido.** La Fase 2 no debe mencionar a ninguna institución en particular: es una identidad visual de
estilo institucional, no la de una marca concreta.

**Cambio.**
- Textos de la Fase 2 en este documento, comentarios de `src/styles/tokens.css`, `src/index.css`,
  `src/components/layout/RoleSidebar.jsx`, `src/App.jsx` e `index.html` reescritos sin nombres de marca.
- Ramas renombradas en el fork:

  | Antes | Ahora |
  |---|---|
  | `fase-2/identidad-visual-…` | `fase-2/identidad-visual` |
  | `feat/paleta-y-tipografia-inspiradas-en-…` | `feat/paleta-y-tipografia` |
  | `feat/barra-lateral-cabecera-y-pie-estilo-…` | `feat/barra-lateral-cabecera-y-pie` |
  | `feat/titulos-tarjetas-y-botones-estilo-…` | `feat/titulos-tarjetas-y-botones` |

- Títulos y descripciones de los PR #8, #9 y #10 actualizados.

**Límite.** Los mensajes de *merge* ya publicados en el historial de git conservan los nombres de rama
anteriores; reescribir el historial rompería las ramas de las fases 3 y 4, así que no se tocó.

### 4.3 Evidencia de otra etapa — `fix/evidencia-de-otra-etapa`

**Problema.** Si la etapa que se estaba viendo no tenía entregas, la tarjeta *Evidencia actual* mostraba la
primera evidencia del proyecto, aunque fuera de otra etapa (por ejemplo, el protocolo de la etapa 1 en la
etapa 6), o un archivo inventado.

**Cambio.**
- Nuevo `src/domain/evidence.js` con `getStageEvidences()` y `getLatestEvidence()`: solo entregas de la
  etapa indicada, de la más reciente a la más antigua; `null` si no hay ninguna.
- Estudiante y tutor muestran "Aún no hay entregas en esta etapa" cuando corresponde.
- Prueba nueva en `tests/domain.test.mjs`.

**Archivos.** `src/domain/evidence.js` (nuevo), `src/features/student/StudentWorkspace.jsx`,
`src/features/tutor/TutorWorkspace.jsx`, `tests/domain.test.mjs`.

**Cómo comprobarlo.** Rol *Estudiante* → clic en la Etapa 6: *Evidencia actual* dice que aún no hay entregas.

### 4.4 Rutas con dirección propia — `feat/rutas-con-direccion-propia`

**Problema.** Toda la app vivía en una sola dirección. El botón *Atrás* del navegador sacaba de la app,
no se podía compartir el enlace a un proyecto o etapa y al recargar se perdía el rol, el tutor simulado
y el proyecto abierto (siempre volvía a *Tutor*).

**Cambio.**
- Nuevo `src/routing/hashRoute.js`: enrutador mínimo hecho a mano (sin librerías) con `parseHash`,
  `buildHash` y el hook `useHashRoute()`. Formato de las direcciones:

  | Ejemplo | Qué abre |
  |---|---|
  | `#/tutor/por-revisar?tutor=TUT-02&proyecto=PRJ-05` | Bandeja de la Dra. Elena Ramos con el proyecto de Diego Morales |
  | `#/estudiante/mi-proyecto?proyecto=PRJ-01&etapa=3` | Vista del estudiante de Mateo Restrepo, mirando la Etapa 3 |
  | `#/coordinacion/proyectos` | Tabla de la cohorte |

  Se usa `#` porque GitHub Pages solo sirve archivos estáticos.
- `App.jsx` ya no guarda en estado el rol, la sección, el tutor simulado, el proyecto ni la etapa: los
  lee de la dirección. Cada acción (cambiar de rol, de proyecto, de etapa o de tutor) cambia la dirección.
  Si falta un dato, se completa sin crear historial, para que la dirección siempre se pueda compartir.
- Al cambiar de rol se mantiene el mismo proyecto (y el tutor simulado pasa a ser el de ese proyecto).
- Nuevo `src/routing/navigation.js` con las opciones del menú por rol: una sola fuente para el menú y la
  ruta de navegación de la cabecera.
- La bienvenida no se muestra si se llega por un enlace directo a una pantalla.
- Pruebas nuevas para leer y reconstruir direcciones.

**Archivos.** `src/routing/hashRoute.js` (nuevo), `src/routing/navigation.js` (nuevo), `src/App.jsx`,
`src/components/layout/RoleSidebar.jsx`, `tests/domain.test.mjs`.

**Cómo comprobarlo.** Abrir `#/tutor/por-revisar?tutor=TUT-02&proyecto=PRJ-05`: aparece la Dra. Elena Ramos
con el proyecto de Diego. Cambiar a *Estudiante*, hacer clic en una etapa y usar *Atrás* del navegador:
se vuelve paso a paso. Recargar en cualquier punto mantiene la pantalla.

### 4.5 Menú con una pantalla por opción — `feat/menu-con-pantalla-por-opcion`

**Problema.** La mayoría de las opciones del menú no cambiaba la pantalla, y el rol se elegía en un desplegable escondido en la cabecera.

**Cambio.**
- Menú nuevo (`src/routing/navigation.js`), con una pantalla real por opción:
  - **Estudiante:** Mi proyecto · Etapas · Entregas · Bitácora.
  - **Tutor:** Por revisar · Mis proyectos · Compromisos.
  - **Coordinación:** Panorama (nueva pantalla de inicio) · Proyectos · Tutores.
- Componentes nuevos: `StagesView` (riel y detalle de cada etapa: entregas, Gate 0 y observaciones de esa etapa, acciones según el rol), `EvidenceList`, `ProjectLogView`, `ProjectTable`, `PanoramaPage`, `TutorsPage`, `CommitmentsPage` y `PageHeader`.
- `src/domain/projectLog.js`: bitácora por etapa y compromisos clasificados como vencidos, próximos o a tiempo (con pruebas).
- **El rol y el usuario simulado se eligen en la barra lateral** ("Ver la demo como"). La cabecera solo muestra la ubicación.
- Los accesos del estudiante llevan a las pantallas en lugar de abrir el panel lateral. Los recorridos guiados se ajustaron.

**Pendiente (siguientes cambios de la Fase 4).** La ficha del proyecto como página con pestañas, las decisiones en ventana de confirmación y la simplificación del panel lateral.

**Cómo comprobarlo.** En cada rol, recorrer todas las opciones del menú: cada una abre su pantalla con su propia dirección.
