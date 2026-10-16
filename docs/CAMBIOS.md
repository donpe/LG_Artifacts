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
