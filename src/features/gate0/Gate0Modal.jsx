import React from 'react';

/**
 * Gate0Modal — Diálogo Modal de Auditoría de Criterios Gate 0 (14 Criterios)
 * Protocolo de verificación obligatoria para la Etapa 1.
 */
export default function Gate0Modal({
  isOpen,
  onClose,
  gate0Items,
  onToggleItem,
  role,
  onShowToast
}) {
  if (!isOpen) return null;

  const completedCount = gate0Items.filter(i => i.checked).length;
  const isAllCompleted = completedCount === 14;

  const handleCheckboxClick = (id) => {
    if (role !== 'tutor') {
      onShowToast('Solo el tutor asignado tiene potestad para certificar los criterios de Gate 0.');
      return;
    }
    onToggleItem(id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#D8CEBF] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#FBF9F5] p-5 sm:p-6 border-b border-[#D8CEBF] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E432F] bg-[#F5F1EA] px-2.5 py-0.5 rounded-full border border-[#D8CEBF]">
                Protocolo de Calidad
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border font-mono ${
                isAllCompleted
                  ? 'bg-[#EDF7F2] text-[#059669] border-[#9CD5BE]'
                  : 'bg-[#FFFBEB] text-[#D97706] border-[#FCD34D]'
              }`}>
                {completedCount}/14 Conformes
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#1C1917] mt-1 tracking-tight">
              Auditoría de Salida Gate 0 — Etapa 1
            </h3>
            <p className="text-xs text-[#57534E] mt-0.5">
              Verificación metodológica y formal obligatoria antes de habilitar la aprobación del Protocolo de Tesis.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F1EA] transition-colors"
            title="Cerrar ventana"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Business Rule Notice Banner */}
        <div className="bg-[#FBF9F5] px-6 py-3 border-b border-[#E8E1D5] text-xs text-[#6E432F] flex items-center gap-2.5">
          <span className="font-bold text-sm">ℹ️</span>
          <span>
            <strong>Regla de Negocio:</strong> Completar los 14 criterios es una condición técnica necesaria que habilita la aprobación, pero <strong>no aprueba automáticamente la etapa</strong>. El tutor debe dictaminar la decisión por separado.
          </span>
        </div>

        {/* Criteria Checklist */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {gate0Items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCheckboxClick(item.id)}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                item.checked
                  ? 'bg-[#EDF7F2]/40 border-[#9CD5BE]'
                  : 'bg-white border-[#D8CEBF] hover:border-[#6E432F]/50'
              }`}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => {}} // Controlled by parent onClick
                className="mt-1 h-4 w-4 rounded text-[#059669] focus:ring-0 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-[#6E432F] bg-[#F5F1EA] px-1.5 py-0.2 rounded">
                    {item.id}
                  </span>
                  <span className="font-bold text-[#1C1917] text-xs">
                    {item.label}
                  </span>
                </div>
                <p className="text-[#57534E] text-[11px] leading-relaxed">
                  {item.suggestedCheck}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FBF9F5] p-4 border-t border-[#D8CEBF] flex items-center justify-between">
          <span className="text-xs text-[#57534E]">
            {role === 'tutor'
              ? 'Haga clic en cada criterio para certificar su conformidad.'
              : 'Solo el tutor asignado puede certificar los criterios. Modo consulta.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#1E293B] text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors shadow-xs"
          >
            Cerrar Auditoría
          </button>
        </div>
      </div>
    </div>
  );
}
