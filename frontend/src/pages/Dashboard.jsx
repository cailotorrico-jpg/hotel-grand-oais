import { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardAPI, reservasAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, resRes] = await Promise.allSettled([
        dashboardAPI.getData(),
        reservasAPI.getAll(),
      ]);

      if (dashRes.status === 'fulfilled') {
        setStats(dashRes.value.data);
      } else {
        // Fallback stats
        setStats({
          total_habitaciones: 0,
          habitaciones_ocupadas: 0,
          habitaciones_disponibles: 0,
          reservas_activas: 0,
          checkins_hoy: 0,
          ingresos_mes: 0,
        });
      }

      if (resRes.status === 'fulfilled') {
        const reservas = resRes.value.data;
        const arr = Array.isArray(reservas) ? reservas : reservas.data || [];
        setRecentReservations(arr.slice(0, 10));
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando dashboard..." />;

  const s = stats || {};

  const statusVariant = (estado) => {
    const map = {
      Confirmada: 'success',
      Pendiente: 'warning',
      Cancelada: 'danger',
      'Check-In': 'info',
      'Check-Out': 'default',
    };
    return map[estado] || 'default';
  };

  const reservationColumns = [
    { key: 'id', label: 'ID' },
    {
      key: 'huesped_nombre',
      label: 'Huésped',
      render: (val, row) => val || `${row.nombre || ''} ${row.apellido || ''}`.trim() || `Huésped #${row.id_huesped || '-'}`,
    },
    { key: 'fecha_entrada', label: 'Entrada', render: (val) => val ? new Date(val).toLocaleDateString('es-DO') : '-' },
    { key: 'fecha_salida', label: 'Salida', render: (val) => val ? new Date(val).toLocaleDateString('es-DO') : '-' },
    {
      key: 'estado',
      label: 'Estado',
      render: (val) => <Badge text={val || 'N/A'} variant={statusVariant(val)} />,
    },
    {
      key: 'total',
      label: 'Total',
      render: (val) => val != null ? `RD$ ${Number(val).toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : '-',
    },
  ];

  return (
    <div className="page-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Total Habitaciones"
          value={s.total_habitaciones}
          icon="🛏️"
          color="var(--primary)"
          subtitle="Capacidad total"
        />
        <StatsCard
          title="Ocupadas"
          value={s.habitaciones_ocupadas}
          icon="🔑"
          color="var(--danger)"
          subtitle="Actualmente en uso"
        />
        <StatsCard
          title="Disponibles"
          value={s.habitaciones_disponibles}
          icon="✅"
          color="var(--success)"
          subtitle="Listas para reservar"
        />
        <StatsCard
          title="Reservas Activas"
          value={s.reservas_activas}
          icon="📋"
          color="var(--info)"
          subtitle="En proceso"
        />
        <StatsCard
          title="Check-Ins Hoy"
          value={s.checkins_hoy}
          icon="📥"
          color="var(--warning)"
          subtitle="Llegadas del día"
        />
        <StatsCard
          title="Ingresos del Mes"
          value={s.ingresos_mes != null ? `RD$ ${Number(s.ingresos_mes).toLocaleString('es-DO')}` : 'RD$ 0'}
          icon="💰"
          color="var(--secondary)"
          subtitle="Facturación mensual"
        />
      </div>

      {/* Recent Reservations */}
      <div className="card" style={{ marginTop: '0.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">📋 Reservas Recientes</h3>
          <span className="text-muted text-sm">{recentReservations.length} registros</span>
        </div>
        <DataTable columns={reservationColumns} data={recentReservations} />
      </div>
    </div>
  );
}
