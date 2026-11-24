import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import { reservasAPI, huespedesAPI, habitacionesAPI } from '../services/api';

const statusVariant = {
  Pendiente: 'warning',
  Confirmada: 'success',
  'Check-In': 'info',
  'Check-Out': 'default',
  Cancelada: 'danger',
};

const emptyForm = {
  id_huesped: '',
  fecha_entrada: '',
  fecha_salida: '',
  estado: 'Pendiente',
  notas: '',
  habitaciones: [],
};

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRes, huesRes, habRes] = await Promise.all([
        reservasAPI.getAll(),
        huespedesAPI.getAll(),
        habitacionesAPI.getAll(),
      ]);
      setReservas(Array.isArray(resRes.data) ? resRes.data : resRes.data.data || []);
      setHuespedes(Array.isArray(huesRes.data) ? huesRes.data : huesRes.data.data || []);
      setHabitaciones(Array.isArray(habRes.data) ? habRes.data : habRes.data.data || []);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Error al cargar reservas' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleHabSelection = (e) => {
    const vals = Array.from(e.target.selectedOptions, (o) => Number(o.value));
    setForm({ ...form, habitaciones: vals });
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      id_huesped: row.id_huesped || '',
      fecha_entrada: row.fecha_entrada ? row.fecha_entrada.substring(0, 10) : '',
      fecha_salida: row.fecha_salida ? row.fecha_salida.substring(0, 10) : '',
      estado: row.estado || 'Pendiente',
      notas: row.notas || '',
      habitaciones: row.habitaciones || [],
    });
    setModalOpen(true);
  };

  const calcNights = () => {
    if (form.fecha_entrada && form.fecha_salida) {
      const diff = (new Date(form.fecha_salida) - new Date(form.fecha_entrada)) / (1000 * 60 * 60 * 24);
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        id_huesped: Number(form.id_huesped),
      };
      if (editing) {
        await reservasAPI.update(editing.id, payload);
        setAlert({ type: 'success', message: 'Reserva actualizada' });
      } else {
        await reservasAPI.create(payload);
        setAlert({ type: 'success', message: 'Reserva creada exitosamente' });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al guardar reserva' });
    }
  };

  const handleDelete = async () => {
    try {
      await reservasAPI.remove(deleteConfirm.id);
      setAlert({ type: 'success', message: 'Reserva eliminada' });
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al eliminar' });
      setDeleteConfirm(null);
    }
  };

  const getHuespedName = (id) => {
    const h = huespedes.find((h) => h.id === id);
    return h ? `${h.nombre} ${h.apellido}` : `#${id}`;
  };

  const availableRooms = habitaciones.filter((h) => h.estado === 'Disponible');

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'id_huesped',
      label: 'Huésped',
      render: (val, row) => row.huesped_nombre || getHuespedName(val),
    },
    {
      key: 'fecha_entrada',
      label: 'Fecha Entrada',
      render: (val) => val ? new Date(val).toLocaleDateString('es-DO') : '-',
    },
    {
      key: 'fecha_salida',
      label: 'Fecha Salida',
      render: (val) => val ? new Date(val).toLocaleDateString('es-DO') : '-',
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (val) => <Badge text={val || 'N/A'} variant={statusVariant[val] || 'default'} />,
    },
    {
      key: 'total',
      label: 'Total',
      render: (val) => val != null ? `RD$ ${Number(val).toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : '-',
    },
    {
      key: '_detail',
      label: 'Detalle',
      render: (_, row) => (
        <button className="btn btn-info btn-sm" onClick={() => setDetailModal(row)}>
          👁️ Ver
        </button>
      ),
    },
  ];

  return (
    <div className="page-container">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="page-header">
        <h2 className="page-title">📋 Gestión de Reservas</h2>
        <button className="btn btn-primary" onClick={openCreate}>➕ Nueva Reserva</button>
      </div>

      <DataTable columns={columns} data={reservas} loading={loading} onEdit={openEdit} onDelete={(r) => setDeleteConfirm(r)} />

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '✏️ Editar Reserva' : '➕ Nueva Reserva'} size="lg">
        <form onSubmit={handleSubmit}>
          <FormField
            label="Huésped"
            name="id_huesped"
            type="select"
            value={form.id_huesped}
            onChange={handleChange}
            options={huespedes.map((h) => ({ value: h.id, label: `${h.nombre} ${h.apellido} - ${h.documento_identidad}` }))}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Fecha de Entrada" name="fecha_entrada" type="date" value={form.fecha_entrada} onChange={handleChange} required />
            <FormField label="Fecha de Salida" name="fecha_salida" type="date" value={form.fecha_salida} onChange={handleChange} required />
          </div>
          {calcNights() > 0 && (
            <p style={{ color: 'var(--info)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              📅 Duración: <strong>{calcNights()} noche(s)</strong>
            </p>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: '600' }}>
              Habitaciones Disponibles
            </label>
            <select
              multiple
              value={form.habitaciones.map(String)}
              onChange={handleHabSelection}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', minHeight: '100px' }}
            >
              {availableRooms.map((h) => (
                <option key={h.id} value={h.id}>
                  Hab. {h.numero_habitacion} - Piso {h.piso} ({h.tipo_nombre || `Tipo #${h.id_tipo_habitacion}`})
                </option>
              ))}
            </select>
            <small style={{ color: 'var(--text-muted)' }}>Mantén Ctrl para seleccionar múltiples</small>
          </div>
          <FormField
            label="Estado"
            name="estado"
            type="select"
            value={form.estado}
            onChange={handleChange}
            options={[
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'Confirmada', label: 'Confirmada' },
              { value: 'Check-In', label: 'Check-In' },
              { value: 'Check-Out', label: 'Check-Out' },
              { value: 'Cancelada', label: 'Cancelada' },
            ]}
          />
          <FormField label="Notas" name="notas" type="textarea" value={form.notas} onChange={handleChange} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="📋 Detalle de Reserva" size="lg">
        {detailModal && (
          <div>
            <div style={detailGrid}>
              <div><strong>ID:</strong> {detailModal.id}</div>
              <div><strong>Huésped:</strong> {detailModal.huesped_nombre || getHuespedName(detailModal.id_huesped)}</div>
              <div><strong>Entrada:</strong> {detailModal.fecha_entrada ? new Date(detailModal.fecha_entrada).toLocaleDateString('es-DO') : '-'}</div>
              <div><strong>Salida:</strong> {detailModal.fecha_salida ? new Date(detailModal.fecha_salida).toLocaleDateString('es-DO') : '-'}</div>
              <div><strong>Estado:</strong> <Badge text={detailModal.estado} variant={statusVariant[detailModal.estado] || 'default'} /></div>
              <div><strong>Total:</strong> {detailModal.total != null ? `RD$ ${Number(detailModal.total).toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : '-'}</div>
            </div>
            {detailModal.notas && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Notas:</strong>
                <p style={{ marginTop: '0.25rem', color: 'var(--text-light)' }}>{detailModal.notas}</p>
              </div>
            )}
            {detailModal.detalles && detailModal.detalles.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.75rem', color: 'var(--primary)' }}>Habitaciones Reservadas</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--background)' }}>
                      <th style={thStyle}>Habitación</th>
                      <th style={thStyle}>Tipo</th>
                      <th style={thStyle}>Precio/Noche</th>
                      <th style={thStyle}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailModal.detalles.map((d, i) => (
                      <tr key={i}>
                        <td style={tdStyle}>{d.numero_habitacion || d.id_habitacion}</td>
                        <td style={tdStyle}>{d.tipo_nombre || '-'}</td>
                        <td style={tdStyle}>{d.precio_por_noche ? `RD$ ${Number(d.precio_por_noche).toFixed(2)}` : '-'}</td>
                        <td style={tdStyle}>{d.subtotal ? `RD$ ${Number(d.subtotal).toFixed(2)}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="⚠️ Confirmar Eliminación" size="sm">
        <p style={{ marginBottom: '1.5rem' }}>¿Eliminar la reserva <strong>#{deleteConfirm?.id}</strong>?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}

const detailGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.75rem',
  fontSize: '0.9rem',
};

const thStyle = {
  padding: '0.5rem 0.75rem',
  textAlign: 'left',
  fontWeight: '600',
  borderBottom: '2px solid var(--border)',
};

const tdStyle = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid var(--border-light)',
};
