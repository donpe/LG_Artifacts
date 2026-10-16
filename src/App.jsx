import React, { useState, useMemo, useEffect } from 'react';
import { PILOT_PROJECTS, TUTORS } from './data/pilotData.js';
import RoleSidebar from './components/layout/RoleSidebar.jsx';
import TopbarCompact from './components/layout/TopbarCompact.jsx';
import AdaptiveContextPanel from './components/layout/AdaptiveContextPanel.jsx';
import StudentWorkspace from './features/student/StudentWorkspace.jsx';
import TutorWorkspace from './features/tutor/TutorWorkspace.jsx';
import AdminWorkspace from './features/admin/AdminWorkspace.jsx';
import PageHeader from './components/PageHeader.jsx';
import StagesView from './features/projects/StagesView.jsx';
import EvidenceList from './features/projects/EvidenceList.jsx';
import ProjectLogView from './features/projects/ProjectLogView.jsx';
import ProjectTable from './features/projects/ProjectTable.jsx';
import PanoramaPage from './features/coordination/PanoramaPage.jsx';
import TutorsPage from './features/coordination/TutorsPage.jsx';
import CommitmentsPage from './features/tutor/CommitmentsPage.jsx';
import { exportProjectToCSV, downloadCSV } from './domain/csvExporter.js';
import { validateGate0 } from './domain/gate0Validator.js';
import { getStageActions } from './domain/stageMachine.js';
import { describeRisk, getCurrentStage } from './domain/progressCalculator.js';
import { loadDemoProjects, saveDemoProjects, clearDemoProjects, hasSeen, markSeen, clearSeenFlags } from './data/demoStorage.js';
import WelcomeScreen from './features/onboarding/WelcomeScreen.jsx';
import GuidedTour from './features/onboarding/GuidedTour.jsx';
import { useHashRoute, DEFAULT_SECTION } from './routing/hashRoute.js';
import { getSectionLabel, NAV_ITEMS } from './routing/navigation.js';

/**
 * App — Contenedor Principal de la Plataforma de Seguimiento Académico
 * Rediseño UX/UI "Academic Flow 2.0"
 * Inspirado en Framer (artesanía visual y tipografía), Kira Learning (guía paso a paso)
 * y Gumloop (espacio de trabajo ergonómico y paneles contextuales).
 */
export default function App() {
  // 1. Ruta actual (Fase 4): rol, sección, tutor simulado, proyecto y etapa viven en la dirección
  //    del navegador (#/tutor/por-revisar?tutor=TUT-01&proyecto=PRJ-01…). Ver src/routing/hashRoute.js.
  const [route, navigate] = useHashRoute();
  const role = route.role; // 'estudiante' | 'tutor' | 'admin'
  const activeNav = route.section;
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Pantalla "¿Cómo funciona?": se muestra la primera vez en cada navegador (Fase 3),
  // salvo que se llegue por un enlace directo a una pantalla.
  const [showWelcome, setShowWelcome] = useState(() => !hasSeen('bienvenida') && !window.location.hash);
  // Recorrido guiado: rol cuyo recorrido está abierto (o null). Se abre la primera vez en cada rol.
  const [tourRole, setTourRole] = useState(null);
  const closeTour = () => {
    if (tourRole) markSeen(`recorrido-${tourRole}`);
    setTourRole(null);
  };

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
  // Tutor simulado en el modo demo (viene de la dirección): solo ve los proyectos que tiene asignados.
  const demoTutor = TUTORS.find(t => t.id === route.tutorId) || TUTORS[0];
  const demoTutorId = demoTutor.id;
  const tutorProjects = useMemo(
    () => projects.filter(p => p.tutorId === demoTutorId),
    [projects, demoTutorId]
  );

  // Proyecto abierto: el de la dirección si existe (y, para el tutor, si es suyo); si no, uno por defecto.
  const selectedProjectId = (() => {
    const pool = role === 'tutor' ? tutorProjects : projects;
    return pool.some(p => p.id === route.projectId) ? route.projectId : (pool[0]?.id || 'PRJ-01');
  })();

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

  // Proyecto actualmente seleccionado
  const currentProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Etapa activa: la de la dirección o, si no viene, la etapa en curso del proyecto.
  const activeStageId = route.stageId || getCurrentStage(currentProject.stages).id;
  const activeStage = useMemo(() => {
    return currentProject.stages.find(s => s.id === activeStageId) || currentProject.stages[0];
  }, [currentProject, activeStageId]);

  // Completa la dirección con los valores efectivos (tutor y proyecto) sin crear historial,
  // para que siempre se pueda copiar y compartir tal cual.
  useEffect(() => {
    const validSection = NAV_ITEMS[role].some(item => item.id === route.section);
    const normalized = {
      ...route,
      section: validSection ? route.section : DEFAULT_SECTION[role],
      tutorId: role === 'tutor' ? demoTutorId : undefined,
      projectId: selectedProjectId
    };
    if (normalized.tutorId !== route.tutorId || normalized.projectId !== route.projectId || !validSection) {
      navigate(normalized, { replace: true });
    }
  }, [route, role, demoTutorId, selectedProjectId, navigate]);

  // Cambio de rol: lleva a la sección principal del rol manteniendo el mismo proyecto.
  const handleRoleChange = (newRole) => {
    if (!hasSeen(`recorrido-${newRole}`)) setTourRole(newRole);
    navigate({
      role: newRole,
      section: DEFAULT_SECTION[newRole],
      // El tutor simulado pasa a ser el tutor del proyecto abierto, para no perderlo de vista.
      tutorId: newRole === 'tutor' ? currentProject.tutorId : undefined,
      projectId: currentProject.id
    });
    setIsMobileNavOpen(false);
  };

  // Cambio de etapa vista
  const setActiveStageId = (stageId) => navigate({ ...route, stageId });

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
    // "Por revisar": proyectos con una entrega esperando la decisión del tutor.
    return tutorProjects.filter(p => p.stages.some(s => s.status === 'en_revision')).length;
  }, [tutorProjects]);

  // Manejador: Selección de proyecto (se abre en su etapa en curso)
  const handleSelectProject = (projectId) => {
    navigate({ ...route, projectId, stageId: undefined });
  };

  // Manejador: Cambio del tutor simulado (modo demo)
  const handleDemoTutorChange = (tutorId) => {
    const first = projects.find(p => p.tutorId === tutorId);
    navigate({ ...route, tutorId, projectId: first?.id, stageId: undefined });
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
    clearSeenFlags();
    setProjects(PILOT_PROJECTS);
    navigate({ role: 'tutor', section: DEFAULT_SECTION.tutor, tutorId: TUTORS[0].id, projectId: 'PRJ-01' });
    showToast('Demo reiniciada con los datos originales.');
    setShowWelcome(true);
  };

  // Manejador: elegir rol desde la pantalla de bienvenida
  const handleEnterAs = (newRole) => {
    handleRoleChange(newRole);
    markSeen('bienvenida');
    setShowWelcome(false);
    window.scrollTo(0, 0);
  };

  // Manejador: Exportación a CSV
  const handleExportCSV = () => {
    const csvContent = exportProjectToCSV(currentProject);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Ficha_Seguimiento_${currentProject.institutionalId}_${dateStr}.csv`;
    downloadCSV(filename, csvContent);
    showToast('Ficha y bitácora exportadas exitosamente en formato CSV (.csv).');
  };

  // Manejador de navegación desde la barra lateral: cada opción abre su propia pantalla (Fase 4).
  const handleSidebarNavigate = (section) => {
    navigate({ ...route, section, tab: undefined });
    setIsMobileNavOpen(false);
    window.scrollTo(0, 0);
  };

  // Acciones sobre una etapa pedidas desde las páginas (subir, aprobar, solicitar cambios).
  const handleStageAction = (kind) => {
    if (kind === 'upload') handleStudentUploadEvidence();
    else if (kind === 'approve') handleOpenDrawer('Confirmar aprobación');
    else if (kind === 'request-changes') handleOpenDrawer('Solicitar cambios');
  };

  // Abrir un proyecto: por ahora en la bandeja del tutor (la ficha como página llega en 4.6).
  const openProjectForTutor = (projectId) => {
    navigate({ ...route, section: 'por-revisar', projectId, stageId: undefined });
  };

  // Usuario simulado según el rol: el tutor elige qué tutor es y el estudiante qué proyecto es el suyo.
  const identity = role === 'tutor'
    ? {
        label: 'Tutor',
        value: demoTutorId,
        options: TUTORS.map(t => ({ value: t.id, label: t.name })),
        onChange: handleDemoTutorChange
      }
    : role === 'estudiante'
      ? {
          label: 'Estudiante',
          value: currentProject.id,
          options: projects.map(p => ({ value: p.id, label: p.student })),
          onChange: handleSelectProject
        }
      : null;

  const stageViewProps = {
    project: currentProject,
    activeStage,
    onSelectStage: setActiveStageId,
    role,
    stageActions,
    gate0Analysis,
    onToggleGateItem: handleToggleGateItem,
    onAction: handleStageAction
  };

  if (showWelcome) {
    return <WelcomeScreen onEnterAs={handleEnterAs} />;
  }

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink) flex font-sans antialiased selection:bg-(--accent-soft) selection:text-(--brand) overflow-x-clip">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md bg-(--ink) text-white px-4 py-3 rounded-(--radius) shadow-xl border border-(--ink) flex items-center gap-3 animate-fade-in-slide"
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
        onShowWelcome={() => setShowWelcome(true)}
        onStartTour={() => setTourRole(role)}
        pendingReviewCount={pendingReviewCount}
        onRoleChange={handleRoleChange}
        identity={identity}
        profileName={role === 'tutor' ? demoTutor.name : role === 'estudiante' ? currentProject.student : undefined}
      />

      {/* 2. Área de Trabajo Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-clip">
        {/* Cabecera Superior Minimalista */}
        <TopbarCompact
          activeNav={getSectionLabel(role, activeNav)}
          role={role}
          onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onOpenProjectInfo={() => handleOpenDrawer('Ficha académica completa')}
          onExportCSV={handleExportCSV}
          onResetDemo={handleResetDemo}
        />

        {/* Lienzo de Trabajo Dinámico según Rol */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Estudiante: una pantalla por opción del menú */}
          {role === 'estudiante' && activeNav === 'mi-proyecto' && (
            <StudentWorkspace
              project={currentProject}
              activeStage={activeStage}
              onSelectStage={setActiveStageId}
              onOpenDrawer={handleOpenDrawer}
              onUploadEvidence={handleStudentUploadEvidence}
              stageActions={stageActions}
              onNavigate={(section, stageId) => navigate({ ...route, section, stageId: stageId ?? route.stageId })}
            />
          )}
          {role === 'estudiante' && activeNav === 'etapas' && (
            <div className="space-y-6">
              <PageHeader eyebrow={`Estudiante · ${currentProject.student}`} title="Etapas" description="El detalle de cada etapa: entregas, criterios y observaciones del tutor." />
              <StagesView {...stageViewProps} />
            </div>
          )}
          {role === 'estudiante' && activeNav === 'entregas' && (
            <div className="space-y-6">
              <PageHeader eyebrow={`Estudiante · ${currentProject.student}`} title="Entregas" description="Todas las versiones que has entregado, por etapa. Ninguna se borra." />
              <EvidenceList project={currentProject} onOpenStage={(stageId) => navigate({ ...route, section: 'etapas', stageId })} />
            </div>
          )}
          {role === 'estudiante' && activeNav === 'bitacora' && (
            <div className="space-y-6">
              <PageHeader eyebrow={`Estudiante · ${currentProject.student}`} title="Bitácora" description="Compromisos acordados y el historial de entregas, observaciones y aprobaciones." />
              <ProjectLogView project={currentProject} />
            </div>
          )}

          {/* Tutor */}
          {role === 'tutor' && activeNav === 'por-revisar' && (
            <TutorWorkspace
              projects={tutorProjects}
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
          {role === 'tutor' && activeNav === 'proyectos' && (
            <div className="space-y-6">
              <PageHeader eyebrow={`Tutor · ${demoTutor.name}`} title="Mis proyectos" description="Todos los trabajos de grado que acompañas, con su etapa, estado y riesgo." />
              <ProjectTable projects={tutorProjects} showTutor={false} onOpen={openProjectForTutor} />
            </div>
          )}
          {role === 'tutor' && activeNav === 'compromisos' && (
            <CommitmentsPage tutorName={demoTutor.name} projects={tutorProjects} onOpenProject={openProjectForTutor} />
          )}

          {/* Coordinación */}
          {role === 'admin' && activeNav === 'panorama' && (
            <PanoramaPage
              projects={projects}
              tutorsCount={TUTORS.length}
              onOpenProject={(projectId) => {
                navigate({ ...route, section: 'proyectos', projectId });
                handleOpenDrawer('Ficha académica completa');
              }}
              onGoToProjects={() => handleSidebarNavigate('proyectos')}
            />
          )}
          {role === 'admin' && activeNav === 'proyectos' && (
            <AdminWorkspace
              projects={projects}
              onSelectProject={(projId) => {
                handleSelectProject(projId);
                handleOpenDrawer('Ficha académica completa');
              }}
              onOpenPanorama={() => handleSidebarNavigate('panorama')}
              onExportCSV={handleExportCSV}
            />
          )}
          {role === 'admin' && activeNav === 'tutores' && (
            <TutorsPage
              tutors={TUTORS}
              projects={projects}
              onOpenTutorProjects={(tutorId) => navigate({ role: 'tutor', section: 'por-revisar', tutorId })}
            />
          )}
        </main>

        {/* Pie de página institucional */}
        {/* Pie oscuro (Fase 2) */}
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

      {/* 4. Recorrido guiado del rol actual (Fase 3) */}
      {tourRole === role && <GuidedTour key={tourRole} role={tourRole} onClose={closeTour} />}
    </div>
  );
}
