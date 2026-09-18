/**
 * OrganizacionesPage — Vista de organizaciones benéficas.
 * UI/UX moderna, sobria y profesional con soporte para Modo Claro y Modo Oscuro.
 * Integración de imágenes reales desde fotos/ con logos limpios y badges elegantes.
 */

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { organizacionesService } from '../../base-de-datos/organizacionesService';
import './OrganizacionesPage.css';

// Importación directa de logos reales desde fotos/
import amancLogo from '../../../fotos/amanc.webp';
import bamxLogo from '../../../fotos/bamx.webp';
import caritasLogo from '../../../fotos/caritas cuidad de mexico.webp';
import cruzRojaLogo from '../../../fotos/cruz roja.webp';
import juconiLogo from '../../../fotos/fundacion juconi.webp';

/**
 * Catálogo maestro de organizaciones con datos coherentes, profesionales y reales.
 */
const ORGANIZACIONES_REALES = [
  {
    id: 'org-001',
    nombre: 'AMANC',
    nombreCompleto: 'Asociación Mexicana de Ayuda a Niños con Cáncer',
    categoria: 'Salud / Medicamentos',
    descripcion: 'Institución líder en brindar acompañamiento integral, hospedaje digno, alimentación balanceada y medicamentos especializados a niñas, niños y adolescentes de escasos recursos durante su tratamiento oncológico.',
    email: 'contacto@amanc.org',
    telefono: '+52 (55) 5658 7779',
    direccion: 'Magisterio Nacional 100, Tlalpan Centro, CDMX',
    status: 'ACTIVA',
    imagen: amancLogo,
  },
  {
    id: 'org-002',
    nombre: 'BAMX',
    nombreCompleto: 'Red de Bancos de Alimentos de México',
    categoria: 'Alimentos',
    descripcion: 'Red nacional dedicada al rescate estratégico y redistribución eficiente de alimentos a comunidades vulnerables para combatir el hambre y mejorar la nutrición de miles de familias en todo México.',
    email: 'donaciones@bamx.org.mx',
    telefono: '+52 (55) 5530 0789',
    direccion: 'Prolongación Madero 245, Venustiano Carranza, CDMX',
    status: 'ACTIVA',
    imagen: bamxLogo,
  },
  {
    id: 'org-003',
    nombre: 'Cáritas Ciudad de México',
    nombreCompleto: 'Cáritas Arquidiócesis de México I.A.P.',
    categoria: 'Asistencia social / Ropa y Despensa',
    descripcion: 'Organización de asistencia social que opera comedores comunitarios, centros de distribución de ropa, calzado y paquetes de despensa básica para personas en situación de extrema vulnerabilidad y marginación.',
    email: 'ayuda@caritas-mexico.org.mx',
    telefono: '+52 (55) 5563 1770',
    direccion: 'Calle Eugenia 100, Col. Del Valle, CDMX',
    status: 'ACTIVA',
    imagen: caritasLogo,
  },
  {
    id: 'org-004',
    nombre: 'Cruz Roja Mexicana',
    nombreCompleto: 'Cruz Roja Mexicana I.A.P.',
    categoria: 'Salud / Emergencias',
    descripcion: 'Institución humanitaria que brinda atención médica de urgencia, auxilio prehospitalario gratuito, socorro en emergencias y desastres naturales, y distribución de insumos clínicos esenciales.',
    email: 'donaciones@cruzrojamexicana.org.mx',
    telefono: '+52 (55) 1084 9000',
    direccion: 'Juan Luis Vives 200, Col. Los Morales Polanco, CDMX',
    status: 'ACTIVA',
    imagen: cruzRojaLogo,
  },
  {
    id: 'org-005',
    nombre: 'Fundación JUCONI',
    nombreCompleto: 'Fundación Junto con los Niños I.A.P.',
    categoria: 'Niñez / Educación',
    descripcion: 'Organización orientada a la prevención y sanación de las secuelas de la violencia familiar y exclusión, apoyando terapéutica y educativamente a niñas, niños y jóvenes en situación de calle o riesgo social.',
    email: 'info@juconi.org.mx',
    telefono: '+52 (222) 237 8100',
    direccion: 'Calle 16 Poniente 2106, Jesús García, Puebla',
    status: 'ACTIVA',
    imagen: juconiLogo,
  },
];

// Mapa rápido por ID para enriquecer elementos si provienen del servicio
const LOGO_MAP = {
  'org-001': amancLogo,
  'org-002': bamxLogo,
  'org-003': caritasLogo,
  'org-004': cruzRojaLogo,
  'org-005': juconiLogo,
};

export default function OrganizacionesPage() {
  const { isAdmin } = usePermissions();

  // Modo claro / oscuro sincronizado globalmente con toda la aplicación
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || localStorage.getItem('app_theme') || 'dark';
  });

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('TODAS'); // 'TODAS' | 'ACTIVAS' | 'INACTIVAS'

  // Estado de organizaciones maestras sincronizado con almacenamiento local
  const [organizaciones, setOrganizaciones] = useState(() => {
    try {
      const stored = localStorage.getItem('donaciones_organizations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ORGANIZACIONES_REALES.map(real => {
            const match = parsed.find(p => p.id === real.id);
            return match ? { ...real, status: match.status || real.status } : real;
          });
        }
      }
    } catch {
      // ignore
    }
    return ORGANIZACIONES_REALES;
  });

  // Escuchar cambios de tema globales (desde el Header u otras vistas)
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('app_theme') || 'dark';
    setTheme(currentTheme);

    const observer = new MutationObserver(() => {
      const updatedTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(updatedTheme);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Guardar preferencia y alternar tema en toda la app
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('app_theme', nextTheme);
      localStorage.setItem('theme_mode_org', nextTheme);
    } catch {
      // ignore
    }
  };

  // Sincronizar con el servicio mock para mantener integridad en el resto de la app
  useEffect(() => {
    try {
      const stored = organizacionesService.getAll();
      const needsUpdate = !stored || stored.length === 0 || stored[0]?.nombre === 'Fundación Esperanza';
      if (needsUpdate) {
        const toPersist = ORGANIZACIONES_REALES.map(({ id, nombre, descripcion, email, telefono, direccion, categoria, status }) => ({
          id,
          nombre,
          descripcion,
          email,
          telefono,
          direccion,
          categoria,
          status,
          ubicacion: { lat: 19.4326, lng: -99.1332 },
          fechaCreacion: new Date().toISOString(),
        }));
        localStorage.setItem('donaciones_organizations', JSON.stringify(toPersist));
      }
    } catch {
      // ignore
    }
  }, []);

  // Alternar estado de una organización (funcionalidad extra para ADMIN)
  const handleToggleStatus = (orgId) => {
    if (!isAdmin) return;
    const updated = organizaciones.map(org => {
      if (org.id === orgId) {
        const nextStatus = org.status === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
        try {
          organizacionesService.update(orgId, { status: nextStatus });
        } catch {
          // ignore
        }
        return { ...org, status: nextStatus };
      }
      return org;
    });
    setOrganizaciones(updated);
  };

  // Categorías disponibles
  const categories = useMemo(() => {
    const set = new Set(organizaciones.map(o => o.categoria));
    return ['Todas', ...Array.from(set)];
  }, [organizaciones]);

  // Filtrado de organizaciones
  const filteredOrgs = useMemo(() => {
    return organizaciones.filter(org => {
      // Filtro de rol: usuario normal sólo ve organizaciones activas a menos que sea admin
      if (!isAdmin && org.status !== 'ACTIVA') {
        return false;
      }

      // Filtro de estado para admin
      if (isAdmin && statusFilter !== 'TODAS') {
        if (statusFilter === 'ACTIVAS' && org.status !== 'ACTIVA') return false;
        if (statusFilter === 'INACTIVAS' && org.status !== 'INACTIVA') return false;
      }

      // Filtro de categoría
      if (selectedCategory !== 'Todas' && org.categoria !== selectedCategory) {
        return false;
      }

      // Filtro de búsqueda por texto
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchName = org.nombre.toLowerCase().includes(query) || (org.nombreCompleto && org.nombreCompleto.toLowerCase().includes(query));
        const matchCat = org.categoria.toLowerCase().includes(query);
        const matchDesc = org.descripcion.toLowerCase().includes(query);
        return matchName || matchCat || matchDesc;
      }

      return true;
    });
  }, [organizaciones, isAdmin, statusFilter, selectedCategory, search]);

  return (
    <div className={`organizaciones-view theme-${theme}`}>
      {/* ── Encabezado Principal ── */}
      <header className="org-header">
        <div className="org-header-left">
          <h1 className="org-title">Organizaciones Benéficas</h1>
          <p className="org-subtitle">
            {isAdmin
              ? 'Panel de supervisión: consulta, filtra y gestiona las organizaciones beneficiarias del sistema.'
              : 'Conoce las instituciones aliadas donde tus donaciones generan un impacto real y transparente.'}
          </p>
        </div>

        <div className="org-header-controls">
          {/* Botón Switch de Modo Claro / Modo Oscuro */}
          <button
            type="button"
            className="org-theme-toggle"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
        </div>
      </header>

      {/* ── Barra de Búsqueda y Filtros ── */}
      <section className="org-controls-bar" aria-label="Filtros de búsqueda">
        <div className="org-search-row">
          <div className="org-search-input-wrapper">
            <span className="org-search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="org-search-input"
              placeholder="Buscar por nombre, causa o palabra clave..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Buscar organizaciones"
            />
          </div>

          {/* Filtro de estado para administradores */}
          {isAdmin && (
            <div className="org-filter-pills" role="group" aria-label="Filtro por estado">
              <button
                type="button"
                className={`org-pill ${statusFilter === 'TODAS' ? 'active' : ''}`}
                onClick={() => setStatusFilter('TODAS')}
              >
                Todas ({organizaciones.length})
              </button>
              <button
                type="button"
                className={`org-pill ${statusFilter === 'ACTIVAS' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ACTIVAS')}
              >
                Activas ({organizaciones.filter(o => o.status === 'ACTIVA').length})
              </button>
              <button
                type="button"
                className={`org-pill ${statusFilter === 'INACTIVAS' ? 'active' : ''}`}
                onClick={() => setStatusFilter('INACTIVAS')}
              >
                Inactivas ({organizaciones.filter(o => o.status === 'INACTIVA').length})
              </button>
            </div>
          )}

          <div className="org-count-meta">
            Mostrando <strong>{filteredOrgs.length}</strong> {filteredOrgs.length === 1 ? 'organización' : 'organizaciones'}
          </div>
        </div>

        {/* Píldoras de Categorías */}
        <div className="org-filter-pills" role="group" aria-label="Filtro por categoría">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              className={`org-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Grid de Tarjetas ── */}
      {filteredOrgs.length === 0 ? (
        <div className="org-empty-state">
          <div className="org-empty-icon">🏢</div>
          <h2 className="org-empty-title">No se encontraron organizaciones</h2>
          <p className="org-empty-desc">Intenta ajustar tu búsqueda o limpiar los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="org-grid">
          {filteredOrgs.map(org => {
            const logoSrc = org.imagen || LOGO_MAP[org.id] || amancLogo;

            return (
              <article key={org.id} className="org-card">
                {/* Cabecera de la tarjeta: Logo + Títulos + Badge de Estado */}
                <div className="org-card-header">
                  <div className="org-logo-container" title={`Logo de ${org.nombre}`}>
                    <img
                      src={logoSrc}
                      alt={`Logo oficial de ${org.nombre}`}
                      className="org-logo-img"
                      loading="lazy"
                    />
                  </div>

                  <div className="org-card-title-group">
                    <h2 className="org-card-title">{org.nombre}</h2>
                    <span className="org-category-badge">{org.categoria}</span>
                  </div>

                  {/* Badge de estado elegante y sutil */}
                  <span
                    className={`org-status-badge ${org.status === 'ACTIVA' ? 'activa' : 'inactiva'}`}
                    title={`Estado: ${org.status}`}
                  >
                    <span className="org-status-dot" aria-hidden="true" />
                    {org.status === 'ACTIVA' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                {/* Descripción profesional */}
                <p className="org-card-description">
                  {org.descripcion}
                </p>

                {/* Información de contacto */}
                <div className="org-card-contact">
                  {org.email && (
                    <div className="org-contact-item">
                      <span className="org-contact-icon" aria-hidden="true">✉</span>
                      <a href={`mailto:${org.email}`} className="org-contact-link">
                        {org.email}
                      </a>
                    </div>
                  )}
                  {org.telefono && (
                    <div className="org-contact-item">
                      <span className="org-contact-icon" aria-hidden="true">📞</span>
                      <a href={`tel:${org.telefono.replace(/[^0-9+]/g, '')}`} className="org-contact-link">
                        {org.telefono}
                      </a>
                    </div>
                  )}
                  {org.direccion && (
                    <div className="org-contact-item" title={org.direccion}>
                      <span className="org-contact-icon" aria-hidden="true">📍</span>
                      <span>{org.direccion}</span>
                    </div>
                  )}
                </div>

                {/* Acciones de la tarjeta */}
                <div className="org-card-actions">
                  <Link
                    to="/donaciones/nueva"
                    state={{ preselectedOrgId: org.id }}
                    className="org-btn-donate"
                    title={`Realizar una donación a ${org.nombre}`}
                  >
                    <span>Donar a esta causa</span>
                    <span aria-hidden="true">→</span>
                  </Link>

                  {isAdmin && (
                    <button
                      type="button"
                      className="org-btn-toggle-status"
                      onClick={() => handleToggleStatus(org.id)}
                      title={`Cambiar estado de ${org.nombre}`}
                    >
                      {org.status === 'ACTIVA' ? 'Marcar inactiva' : 'Activar organización'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
