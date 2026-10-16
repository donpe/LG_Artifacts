import React, { useState, useMemo, useEffect } from 'react';
import { PILOT_PROJECTS, TUTORS } from './data/pilotData.js';
import RoleSidebar from './components/layout/RoleSidebar.jsx';
import TopbarCompact from './components/layout/TopbarCompact.jsx';
import AdaptiveContextPanel from './components/layout/AdaptiveContextPanel.jsx';
import StudentWorkspace from './features/student/StudentWorkspace.jsx';
import TutorWorkspace from './features/tutor/TutorWorkspace.jsx';
import AdminWorkspace from './features/admin/AdminWorkspace.jsx';
import { exportProjectToCSV, downloadCSV } from './domain/csvExporter.js';
import { validateGate0 } from './domain/gate0Validator.js';
import { getStageActions } from './domain/stageMachine.js';
import { describeRisk, getCurrentStage } from './domain/progressCalculator.js';
import { loadDemoProjects, saveDemoProjects, clearDemoProjects } from './data/demoStorage.js';

/**
 * App — Contenedor Principal de la Plataforma de Seguimiento Académico
 * Rediseño UX/UI "Academic Flow 2.0"
 * Inspirado en Framer (artesanía visual y tipografía), Kira Learning (guía paso a paso)
 * y Gumloop (espacio de trabajo ergonómico y paneles contextuales).
 */
export default function App() {
  // 1. Estado de rol y navegación
  const [role, setRole] = useState('tutor'); // 'estudiante' | 'tutor' | 'admin'
  const [activeNav, setActiveNav] = useState('Pendientes de revisión');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // 2. Estado de proyectos y selección
  // Se parte de lo guardado en el navegador (si existe) y se guarda cada cambio (demoStorage.js).
  const [rawProjects, setProjects] = useState(() => loadDemoProjects(PILOT_PROJECTS));
  useEffect(() => {
    saveDemoProjects(rawProjects);
  }, [rawProjects]);
  // El riesgo no se guarda: se calcula siempre a partir de etapas y compromisos (progressCalculator.js).
  const projects = useMemo(
    () => rawProjects.map(p => {
      const risk = describeRisk(p);
      return { ...p, riskLevel: risk.level, riskReason: risk.reason };
    }),
    [rawProjects]
  );
  const [selectedProjectId, setSelectedProjectId] = useState('PRJ-01');
  const [activeStageId, setActiveStageId] = useState(1);

  // Tutor simulado en el modo demo: el tutor solo ve los proyectos que tiene asignados.
  const [demoTutorId, setDemoTutorId] = useState(TUTORS[0].id);
  const demoTutor = TUTORS.find(t => t.id === demoTutorId) || TUTORS[0];
  const tutorProjects = useMemo(
    () => projects.filter(p => p.tutorId === demoTutorId),
    [projects, demoTutorId]
  );

  // 3. Panel contextual adaptable (Drawer) y avisos
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('Observaciones del tutor');
  const [toastMessage, setToastMessage] = useState(null);

  // Helper para notificaciones Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Cambio de rol con sincronización de navegación por defecto
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'estudiante') setActiveNav('Mi proyecto');
    else if (newRole === 'tutor') {
      setActiveNav('Pendientes de revisión');
      // Si el proyecto abierto no es de este tutor, abrir el primero de su bandeja.
      if (!tutorProjects.some(p => p.id === selectedProjectId) && tutorProjects[0]) {
        handleSelectProject(tutorProjects[0].id);
      }
    }
    else if (newRole === 'admin') setActiveNav('Proyectos');
  };

  // Proyecto actualmente seleccionado
  const currentProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Etapa activa del proyecto seleccionado
  const activeStage = useMemo(() => {
    return currentProject.stages.find(s => s.id === activeStageId) || currentProject.stages[0];
  }, [currentProject, activeStageId]);

  // Validación de Gate 0 (14 criterios)
  const gate0Analysis = useMemo(() => {
    return validateGate0(currentProject.gate0Items);
  }, [currentProject.gate0Items]);

  // Acciones permitidas sobre la etapa activa según rol y reglas de negocio (stageMachine.js).
  // Se usa tanto para habilitar botones como para validar en los manejadores.
  const stageActions = useMemo(() => getStageActions({
    stages: currentProject.stages,
    stageId: activeStage.id,
    role,
    isGate0Compliant: gate0Analysis.isFullyCompliant
  }), [currentProject.stages, activeStage.id, role, gate0Analysis.isFullyCompliant]);

  // Conteo de proyectos pendientes de revisión para el tutor
  const pendingReviewCount = useMemo(() => {
    return tutorProjects.filter(p => p.stages.some(s => s.status === 'en_revision' || s.status === 'observado')).length;
  }, [tutorProjects]);

  // Manejador: Selección de proyecto
  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      setActiveStageId(getCurrentStage(proj.stages).id);
    }
  };

  // Manejador: Cambio del tutor simulado (modo demo)
  const handleDemoTutorChange = (tutorId) => {
    setDemoTutorId(tutorId);
    const first = projects.find(p => p.tutorId === tutorId);
    if (first) handleSelectProject(first.id);
  };

  // Manejador: Apertura de cajón contextual
  const handleOpenDrawer = (title) => {
    setDrawerTitle(title);
    setIsContextPanelOpen(true);
  };

  // Manejador: Certificación de criterios Gate 0 (Solo tutor)
  const handleToggleGateItem = (itemId) => {
    if (role !== 'tutor') {
      showToast('Acceso restringido: Solo el tutor asignado puede certificar los criterios de Gate 0.');
      return;
    }

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== currentProject.id) return p;
        const updatedItems = p.gate0Items.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        return { ...p, gate0Items: updatedItems };
      })
    );
  };

  // Manejador: Verificación de pasos de Fase 0 (Metodológica)
  const handleTogglePhase0Step = (stepNumber) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== currentProject.id) return p;
        const updatedSteps = p.phase0Steps.map(step =>
          step.number === stepNumber ? { ...step, completed: !step.completed } : step
        );
        return { ...p, phase0Steps: updatedSteps };
      })
    );
  };

  // Manejador: Entrega de evidencia por el estudiante
  const handleStudentUploadEvidence = () => {
    if (!stageActions.upload.allowed) {
      showToast(stageActions.upload.reason);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const newVersion = `v1.${(currentProject.evidences || []).length + 1}`;
    const newFilename = `Evidencia_Etapa_${activeStage.id}_${newVersion}.pdf`;

    const newEvidence = {
      id: `EV-${Date.now()}`,
      version: newVersion,
      filename: newFilename,
      stageId: activeStage.id,
      uploadedBy: currentProject.student,
      date: today,
      size: '2.5 MB'
    };

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
      author: `${currentProject.student} (Estudiante)`,
      action: `Entrega de Evidencia: ${activeStage.name.split('(')[0]}`,
      notes: `Se cargó el archivo '${newFilename}' para revisión formal del tutor. El estado pasa a 'En Revisión'.`,
      milestone: `Revisión de avance por ${currentProject.tutor}`,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== currentProject.id) return p;
        const updatedStages = p.stages.map(s =>
          s.id === activeStage.id ? { ...s, status: 'en_revision' } : s
        );
        return {
          ...p,
          stages: updatedStages,
          evidences: [newEvidence, ...(p.evidences || [])],
          decisionLog: [newLog, ...(p.decisionLog || [])]
        };
      })
    );

    showToast(`Archivo '${newFilename}' entregado con éxito. Estado actualizado a 'En Revisión'.`);
  };

  // Manejador: Registro formal de observaciones del tutor
  const handleTutorRequestChanges = ({ notes, milestone, deadline }) => {
    if (!stageActions.requestChanges.allowed) {
      showToast(stageActions.requestChanges.reason);
      return;
    }
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
      author: `${currentProject.tutor} (Tutor)`,
      action: `Observación Registrada: ${activeStage.name.split('(')[0]}`,
      notes,
      milestone,
      deadline
    };

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== currentProject.id) return p;
        const updatedStages = p.stages.map(s =>
          s.id === activeStage.id ? { ...s, status: 'observado' } : s
        );
        return {
          ...p,
          stages: updatedStages,
          decisionLog: [newLog, ...(p.decisionLog || [])]
        };
      })
    );

    showToast('Observaciones registradas formalmente. Notificación emitida al estudiante.');
  };

  // Manejador: Aprobación formal de etapa por el tutor
  const handleTutorApproveStage = ({ notes, milestone, deadline }) => {
    // Incluye Gate 0 (etapa 1), no saltar etapas y que exista una entrega.
    if (!stageActions.approve.allowed) {
      showToast(stageActions.approve.reason);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
      author: `${currentProject.tutor} (Tutor)`,
      action: `Aprobación Formal: ${activeStage.name.split('(')[0]}`,
      notes,
      milestone,
      deadline
    };

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== currentProject.id) return p;

        const updatedStages = p.stages.map(s => {
          if (s.id === activeStage.id) {
            return { ...s, status: 'aprobado', date: today };
          }
          if (s.id === activeStage.id + 1 && s.status === 'pendiente') {
            return { ...s, status: 'en_revision' };
          }
          return s;
        });

        return {
          ...p,
          stages: updatedStages,
          decisionLog: [newLog, ...(p.decisionLog || [])]
        };
      })
    );

    showToast(`Etapa #${activeStage.id} "${activeStage.name.split('(')[0]}" aprobada formalmente.`);
  };

  // Manejador: Reiniciar la demo a los datos semilla de pilotData.js
  const handleResetDemo = () => {
    if (!window.confirm('¿Reiniciar la demo? Se perderán las entregas, observaciones y aprobaciones hechas en este navegador.')) return;
    clearDemoProjects();
    setProjects(PILOT_PROJECTS);
    handleSelectProject(role === 'tutor' ? (PILOT_PROJECTS.find(p => p.tutorId === demoTutorId)?.id || 'PRJ-01') : 'PRJ-01');
    showToast('Demo reiniciada con los datos originales.');
  };

  // Manejador: Exportación a CSV
  const handleExportCSV = () => {
    const csvContent = exportProjectToCSV(currentProject);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Ficha_Seguimiento_${currentProject.institutionalId}_${dateStr}.csv`;
    downloadCSV(filename, csvContent);
    showToast('Ficha y bitácora exportadas exitosamente en formato CSV (.csv).');
  };

  // Manejador de navegación desde la barra lateral
  const handleSidebarNavigate = (navId) => {
    setActiveNav(navId);
    if (navId === 'Evidencias') {
      handleOpenDrawer('Evidencias del proyecto');
    } else if (navId === 'Bitácora') {
      handleOpenDrawer('Bitácora y compromisos');
    } else if (navId === 'Seguimiento' || navId === 'Seguimiento general') {
      handleOpenDrawer('Ficha académica completa');
    }
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink) flex font-sans antialiased selection:bg-(--accent-soft) selection:text-(--brand) overflow-x-hidden">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md bg-(--ink) text-white px-4 py-3 rounded-2xl shadow-xl border border-(--ink) flex items-center gap-3 animate-fade-in-slide"
        >
          <span className="w-5 h-5 rounded-full bg-(--green) text-white flex items-center justify-center font-bold text-xs shrink-0">
            ✓
          </span>
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. Barra Lateral de Navegación por Rol (RoleSidebar) */}
      <RoleSidebar
        role={role}
        activeNav={activeNav}
        onNavigate={handleSidebarNavigate}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenDrawer={handleOpenDrawer}
        pendingReviewCount={pendingReviewCount}
        profileName={role === 'tutor' ? demoTutor.name : role === 'estudiante' ? currentProject.student : undefined}
      />

      {/* 2. Área de Trabajo Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Cabecera Superior Minimalista */}
        <TopbarCompact
          activeNav={activeNav}
          role={role}
          onRoleChange={handleRoleChange}
          onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onOpenProjectInfo={() => handleOpenDrawer('Ficha académica completa')}
          onExportCSV={handleExportCSV}
          onResetDemo={handleResetDemo}
        />

        {/* Lienzo de Trabajo Dinámico según Rol */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {role === 'estudiante' && (
            <StudentWorkspace
              project={currentProject}
              activeStage={activeStage}
              onSelectStage={setActiveStageId}
              onOpenDrawer={handleOpenDrawer}
              onUploadEvidence={handleStudentUploadEvidence}
              stageActions={stageActions}
            />
          )}

          {role === 'tutor' && (
            <TutorWorkspace
              projects={tutorProjects}
              tutors={TUTORS}
              demoTutorId={demoTutorId}
              onDemoTutorChange={handleDemoTutorChange}
              selectedProjectId={selectedProjectId}
              onSelectProject={handleSelectProject}
              activeStageId={activeStageId}
              gate0Analysis={gate0Analysis}
              onToggleGateItem={handleToggleGateItem}
              onOpenDrawer={handleOpenDrawer}
              tutorName={demoTutor.name}
              stageActions={stageActions}
            />
          )}

          {role === 'admin' && (
            <AdminWorkspace
              projects={projects}
              onSelectProject={(projId) => {
                handleSelectProject(projId);
                handleOpenDrawer('Ficha académica completa');
              }}
              onOpenDrawer={handleOpenDrawer}
              onExportCSV={handleExportCSV}
            />
          )}
        </main>

        {/* Pie de página institucional */}
        {/* Pie oscuro, como el sitio institucional (Fase 2) */}
        <footer className="bg-(--footer-bg) py-5 px-6 text-center text-xs text-(--footer-ink)">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              Plataforma de Seguimiento Académico &bull; <strong className="text-white">LG Artifacts</strong>
            </p>
            <p className="text-[11px]">
              Prototipo de demostración con datos ficticios &bull; 6 etapas &bull; Gate 0 (14 criterios)
            </p>
          </div>
        </footer>
      </div>

      {/* 3. Panel Contextual Deslizable Adaptable (AdaptiveContextPanel) */}
      <AdaptiveContextPanel
        isOpen={isContextPanelOpen}
        onClose={() => setIsContextPanelOpen(false)}
        title={drawerTitle}
        project={currentProject}
        role={role}
        activeStage={activeStage}
        gate0Analysis={gate0Analysis}
        onToggleGateItem={handleToggleGateItem}
        onTogglePhase0Step={handleTogglePhase0Step}
        onStudentUploadEvidence={handleStudentUploadEvidence}
        onTutorRequestChanges={handleTutorRequestChanges}
        onTutorApproveStage={handleTutorApproveStage}
        onOpenDrawer={handleOpenDrawer}
        stageActions={stageActions}
      />
    </div>
  );
}
