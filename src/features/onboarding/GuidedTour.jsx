import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { TOUR_STEPS } from '../../data/tourSteps.js';

/**
 * GuidedTour — Recorrido guiado de 3–4 pasos por rol (Fase 3 · feat/recorrido-guiado-por-rol).
 *
 * Resalta un elemento de la pantalla (marcado con data-tour) oscureciendo el resto y muestra una
 * tarjeta con la explicación. Se abre la primera vez que se entra a cada rol y desde
 * "Ver recorrido" en la barra lateral. Escape o "Saltar" lo cierran.
 */
export default function GuidedTour({ role, onClose }) {
  const steps = TOUR_STEPS[role] || [];
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const step = steps[index];

  // Ubica y resalta el elemento del paso actual; se recalcula al hacer scroll o cambiar el tamaño.
  useEffect(() => {
    if (!step) return undefined;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    const measure = () => {
      const r = el?.getBoundingClientRect();
      setRect(r && r.width > 0 ? { top: r.top, left: r.left, width: r.width, height: r.height } : null);
    };
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const timer = setTimeout(measure, 350);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [step]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!step) return null;
  const isLast = index === steps.length - 1;
  const pad = 6;

  // La tarjeta se ubica debajo del elemento resaltado si cabe, si no encima, y si no al pie.
  const CARD_SPACE = 230;
  const viewportH = window.innerHeight;
  let cardPosition = { bottom: 24 };
  if (rect && rect.top + rect.height + pad + CARD_SPACE < viewportH) {
    cardPosition = { top: rect.top + rect.height + pad + 12 };
  } else if (rect && rect.top - pad > CARD_SPACE) {
    cardPosition = { bottom: viewportH - rect.top + pad + 12 };
  }

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {/* Resalte: cuatro paneles oscuros alrededor del elemento y un marco cian.
          (Una sombra gigante no se dibuja de forma fiable en todos los navegadores.) */}
      {rect ? (
        <>
          {[
            { top: 0, left: 0, right: 0, height: Math.max(0, rect.top - pad) },
            { top: rect.top + rect.height + pad, left: 0, right: 0, bottom: 0 },
            { top: rect.top - pad, left: 0, width: Math.max(0, rect.left - pad), height: rect.height + pad * 2 },
            { top: rect.top - pad, left: rect.left + rect.width + pad, right: 0, height: rect.height + pad * 2 }
          ].map((style, i) => (
            <div key={i} aria-hidden="true" className="fixed bg-[rgba(0,0,40,0.55)]" style={style} />
          ))}
          <div
            aria-hidden="true"
            className="fixed rounded-(--radius) border-2 border-(--cyan) pointer-events-none"
            style={{
              top: rect.top - pad,
              left: rect.left - pad,
              width: rect.width + pad * 2,
              height: rect.height + pad * 2
            }}
          />
        </>
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-[rgba(0,0,40,0.55)]" />
      )}

      {/* Tarjeta del paso */}
      <div
        style={cardPosition}
        className="fixed left-1/2 -translate-x-1/2 w-[min(92vw,420px)] bg-white rounded-(--radius) border-t-4 border-(--brand) p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-(--accent)">
            Recorrido · paso {index + 1} de {steps.length}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-(--light) hover:text-(--ink)"
            aria-label="Cerrar recorrido"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h2 id="tour-title" className="font-editorial text-lg text-(--brand) mt-1">{step.title}</h2>
        <p className="text-sm text-(--muted) mt-1 leading-relaxed">{step.text}</p>

        <div className="flex items-center justify-between gap-2 mt-4">
          <button type="button" onClick={onClose} className="text-xs font-semibold text-(--light) hover:text-(--ink)">
            Saltar recorrido
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex(i => i - 1)}
                className="px-3 py-2 text-xs font-bold rounded-(--radius) border border-(--line2) text-(--brand) hover:bg-(--surface-subtle)"
              >
                Anterior
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? onClose() : setIndex(i => i + 1))}
              className="px-4 py-2 text-xs font-bold rounded-(--radius) bg-(--brand) text-(--on-brand) hover:bg-(--brand-hover)"
              autoFocus
            >
              {isLast ? 'Terminar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
