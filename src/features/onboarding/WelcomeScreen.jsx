import React from 'react';
import { GraduationCap, UserCheck, LayoutDashboard, ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';
import { STAGE_DEFINITIONS } from '../../domain/stageMachine.js';

/**
 * WelcomeScreen — Pantalla "¿Cómo funciona?" (Fase 3 · feat/pantalla-de-bienvenida-como-funciona).
 *
 * Se muestra la primera vez que alguien abre la demo y cada vez que se elige "¿Cómo funciona?"
 * en la barra lateral. Explica en una sola pantalla:
 *   1. qué resuelve la plataforma,
 *   2. el ciclo de una etapa (entrega → revisión → aprobación o cambios),
 *   3. las 6 etapas y la regla de Gate 0,
 *   4. qué hace cada rol, con un botón para entrar como ese rol.
 */

const ROLES = [
  {
    id: 'estudiante',
    icon: GraduationCap,
    title: 'Estudiante',
    summary: 'Avanza su trabajo de grado etapa por etapa.',
    can: ['Ver en qué etapa va y qué le falta', 'Entregar evidencias (documentos)', 'Leer las observaciones del tutor y corregir']
  },
  {
    id: 'tutor',
    icon: UserCheck,
    title: 'Tutor',
    summary: 'Revisa las entregas de sus estudiantes.',
    can: ['Ver su bandeja de pendientes', 'Verificar los 14 criterios de Gate 0', 'Aprobar la etapa o solicitar cambios']
  },
  {
    id: 'admin',
    icon: LayoutDashboard,
    title: 'Coordinación',
    summary: 'Ve el estado de toda la cohorte.',
    can: ['Consultar los 15 proyectos del piloto', 'Filtrar por etapa y por riesgo', 'Exportar la información a Excel']
  }
];

const CYCLE = [
  { label: 'El estudiante entrega', detail: 'Sube la evidencia de la etapa' },
  { label: 'El tutor revisa', detail: 'Compara con los criterios' },
  { label: 'Aprueba o pide cambios', detail: 'Siempre con una nota en la bitácora' },
  { label: 'Sigue la próxima etapa', detail: 'El avance sube 1 de 6' }
];

export default function WelcomeScreen({ onEnterAs }) {
  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      {/* Franja superior institucional */}
      <header className="bg-(--brand) text-(--on-brand)">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
          <p className="text-[11px] uppercase tracking-widest font-bold text-(--cyan)">
            Prototipo de demostración · Maestría · Cohorte 2026-1
          </p>
          <h1 className="font-editorial text-4xl sm:text-6xl tracking-tight mt-3 max-w-3xl leading-[1.05]">
            Seguimiento de trabajos de grado
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/85 leading-relaxed">
            Un solo lugar para acompañar cada trabajo de grado desde la propuesta hasta el documento final:
            el estudiante entrega, el tutor revisa y la coordinación ve el avance de toda la cohorte.
            Reemplaza el seguimiento en un Excel compartido.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-12">
        {/* 1. Ciclo de cada etapa */}
        <section aria-labelledby="ciclo-titulo" className="space-y-4">
          <h2 id="ciclo-titulo" className="font-editorial text-2xl text-(--brand)">Así avanza cada etapa</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CYCLE.map((step, i) => (
              <li key={step.label} className="bg-white border border-(--line) rounded-(--radius) p-4 flex gap-3">
                <span className="w-8 h-8 shrink-0 rounded-full bg-(--brand) text-(--on-brand) grid place-items-center text-sm font-bold">
                  {i + 1}
                </span>
                <div>
                  <strong className="block text-sm">{step.label}</strong>
                  <span className="text-xs text-(--muted)">{step.detail}</span>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-xs text-(--muted)">
            Si el tutor pide cambios, la etapa queda en <strong className="text-(--red)">Cambios solicitados</strong> y
            el estudiante vuelve a entregar una nueva versión. Las versiones anteriores no se borran.
          </p>
        </section>

        {/* 2. Las 6 etapas y Gate 0 */}
        <section aria-labelledby="etapas-titulo" className="space-y-4">
          <h2 id="etapas-titulo" className="font-editorial text-2xl text-(--brand)">Las 6 etapas del trabajo de grado</h2>
          <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {STAGE_DEFINITIONS.map(stage => (
              <li key={stage.id} className="bg-white border border-(--line) border-t-4 border-t-(--accent) rounded-(--radius) p-3">
                <span className="text-[11px] font-bold text-(--accent)">Etapa {stage.id}</span>
                <strong className="block text-sm leading-tight mt-0.5">{stage.name.replace(' (Gate 0)', '')}</strong>
              </li>
            ))}
          </ol>
          <div className="flex gap-3 items-start bg-(--accent-soft) border border-(--line) rounded-(--radius) p-4">
            <ShieldCheck className="w-5 h-5 text-(--brand) shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-(--ink) leading-relaxed">
              <strong>Gate 0:</strong> antes de aprobar la etapa 1, el tutor verifica <strong>14 criterios de calidad</strong> del
              protocolo (pregunta, objetivos, alcance…). Cumplirlos habilita la aprobación, pero no la hace
              automática: el tutor siempre decide.
            </p>
          </div>
        </section>

        {/* 3. Roles */}
        <section aria-labelledby="roles-titulo" className="space-y-4">
          <div>
            <h2 id="roles-titulo" className="font-editorial text-2xl text-(--brand)">¿Con qué rol quieres empezar?</h2>
            <p className="text-xs text-(--muted) mt-1">Puedes cambiar de rol en cualquier momento desde el selector de la parte superior.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLES.map(role => {
              const Icon = role.icon;
              return (
                <article key={role.id} className="bg-white border border-(--line) rounded-(--radius) p-5 flex flex-col">
                  <Icon className="w-7 h-7 text-(--accent)" />
                  <h3 className="font-editorial text-xl mt-3">{role.title}</h3>
                  <p className="text-xs text-(--muted) mt-1">{role.summary}</p>
                  <ul className="mt-3 space-y-1.5 text-xs text-(--ink) flex-1">
                    {role.can.map(item => (
                      <li key={item} className="flex gap-2">
                        <span className="text-(--accent) font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => onEnterAs(role.id)}
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-(--radius) bg-(--brand) text-(--on-brand) text-sm font-bold hover:bg-(--brand-hover) transition-colors"
                  >
                    Entrar como {role.title.toLowerCase()}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <p className="flex items-start gap-2 text-[11px] text-(--muted) border-t border-(--line) pt-4">
          <RotateCcw className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Demo con datos ficticios. Lo que hagas se guarda solo en este navegador; puedes volver al estado
          original con el botón ↺ de la cabecera.
        </p>
      </main>
    </div>
  );
}
