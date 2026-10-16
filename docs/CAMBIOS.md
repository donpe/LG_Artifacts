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
| 1 · Victorias tempranas | Corregir lo que se ve roto en la demo y aplicar las reglas de negocio que ya existían | En curso |
| 2 · Identidad EAFIT | Paleta, tipografía y estructura visual inspiradas en eafit.edu.co | Pendiente |
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
