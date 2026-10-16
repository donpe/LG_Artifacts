import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, BarChart3 } from 'lucide-react';
import ProjectTable from '../projects/ProjectTable.jsx';
import Term from '../../components/Term.jsx';
import { getCurrentStage } from '../../domain/progressCalculator.js';

/**
 * AdminWorkspace — Panel de Supervisión y Cohorte para Administradores (Academic Flow 2.0)
 * Visualización compacta, búsqueda instantánea, filtros y métricas institucionales.
 */
export default function AdminWorkspace({
  projects,
  onSelectProject,
  onOpenPanorama,
  onExportCSV
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Aggregated indicators
  const totalProjects = projects.length;
  const avgProgress = Math.round(
    projects.reduce((acc, p) => {
      const approved = p.stages.filter(s => s.status === 'aprobado').length;
      return acc + (approved / 6) * 100;
    }, 0) / (totalProjects || 1)
  );

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchText = (p.title + ' ' + p.student + ' ' + p.institutionalId + ' ' + p.tutor).toLowerCase();
      const matchSearch = matchText.includes(searchTerm.toLowerCase());

      const activeSt = getCurrentStage(p.stages);
      const matchStage = stageFilter === 'all' || String(activeSt.id) === stageFilter;
      const matchRisk = riskFilter === 'all' || p.riskLevel === riskFilter;

      return matchSearch && matchStage && matchRisk;
    });
  }, [projects, searchTerm, stageFilter, riskFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Eyebrow & View Header */}
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-(--light) mb-1">
          SEGUIMIENTO INSTITUCIONAL &bull; PILOTO DEMO
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-(--brand) tracking-tight">
              Proyectos de grado
            </h1>
            <p className="text-xs text-(--muted) mt-0.5">
              Consulta el estado de la cohorte y los responsables de seguimiento.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPanorama}
            className="text-xs font-bold text-(--brand) hover:underline self-start sm:self-auto flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4 text-(--brand)" />
            <span>Ver panorama &rarr;</span>
          </button>
        </div>
      </div>

      {/* Overview Strip */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="px-3.5 py-2 bg-white border border-(--line) rounded-(--radius) text-xs text-(--light)">
          <strong className="font-editorial font-bold text-sm text-(--brand) mr-1">{totalProjects}</strong>
          proyectos del piloto
        </div>
        <div className="px-3.5 py-2 bg-white border border-(--line) rounded-(--radius) text-xs text-(--light)">
          <strong className="font-editorial font-bold text-sm text-(--brand) mr-1">3</strong>
          tutores asignados
        </div>
        <div className="px-3.5 py-2 bg-white border border-(--line) rounded-(--radius) text-xs text-(--light)">
          Cohorte <strong className="font-editorial font-bold text-sm text-(--brand) ml-1">2026-1</strong>
        </div>
        <div className="px-3.5 py-2 bg-white border border-(--line) rounded-(--radius) text-xs text-(--light)">
          Avance promedio: <strong className="font-editorial font-bold text-sm text-(--green) ml-1">{avgProgress}%</strong>
        </div>
      </div>

      {/* Admin Tools Bar */}
      <div data-tour="filtros" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-(--light) absolute left-3 top-2.5" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar proyecto, estudiante o tutor..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-(--radius) border border-(--line2) bg-white text-(--ink) focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-3.5 py-2 text-xs font-bold text-(--brand) bg-white border border-(--line2) hover:bg-(--sand) rounded-(--radius) transition-colors flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{showFilters ? 'Ocultar filtros' : 'Filtros'}</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="px-3.5 py-2 text-xs font-bold text-(--green) bg-(--green-bg) border border-(--green-line) hover:bg-(--green-line) rounded-(--radius) transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-white rounded-(--radius) border border-(--line) grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fade-in">
          <div>
            <label className="block text-[11px] font-bold text-(--muted) mb-1">Filtrar por Etapa Activa:</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full p-2 rounded-(--radius) border border-(--line2) bg-(--bg) text-(--ink)"
            >
              <option value="all">Todas las etapas (1 a 6)</option>
              <option value="1">Etapa 1: Propuesta / Protocolo</option>
              <option value="2">Etapa 2: Marco Teórico</option>
              <option value="3">Etapa 3: Metodología</option>
              <option value="4">Etapa 4: Recolección</option>
              <option value="5">Etapa 5: Análisis</option>
              <option value="6">Etapa 6: Documento Final</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-(--muted) mb-1">Filtrar por <Term id="riesgo">riesgo</Term> académico:</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full p-2 rounded-(--radius) border border-(--line2) bg-(--bg) text-(--ink)"
            >
              <option value="all">Todos los niveles</option>
              <option value="Bajo">Riesgo Bajo</option>
              <option value="Medio">Riesgo Medio</option>
              <option value="Alto">Riesgo Alto</option>
              <option value="Completado">Completado</option>
            </select>
          </div>
        </div>
      )}

      <ProjectTable
        projects={filteredProjects}
        onOpen={onSelectProject}
        emptyText="No se encontraron proyectos con los filtros aplicados."
      />

      <p className="text-[11px] text-(--light)">
        Datos ficticios para supervisión y demostración académica. No equivalen al seguimiento real de la cohorte.
      </p>
    </div>
  );
}
