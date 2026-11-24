import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import { habitacionesAPI, tiposHabitacionAPI } from '../services/api';

const emptyForm = {
  numero_habitacion: '',
  id_tipo_habitacion: '',
  piso: '',
  estado: 'Disponible',
  notas: '',
};

const estadoVariant = {
  Disponible: 'success',
  Ocupada: 'danger',
  Mantenimiento: 'warning',
  Limpieza: 'info',
};

export default function Habitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [habRes, tipRes] = await Promise.all([
        habitacionesAPI.getAll(),
        tiposHabitacionAPI.getAll(),
      ]);
      setHabitaciones(Array.isArray(habRes.data) ? habRes.data : habRes.data.data || []);
      setTipos(Array.isArray(tipRes.data) ? tipRes.data : tipRes.data.data || []);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Error al cargar habitaciones' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = filterEstado
    ? habitaciones.filter((h) => h.estado === filterEstado)
    : habitaciones;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      numero_habitacion: row.numero_habitacion || '',
      id_tipo_habitacion: row.id_tipo_habitacion || '',
      piso: row.piso || '',
      estado: row.estado || 'Disponible',
      notas: row.notas || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, piso: Number(form.piso), id_tipo_habitacion: Number(form.id_tipo_habitacion) };
      if (editing) {
        await habitacionesAPI.update(editing.id, payload);
        setAlert({ type: 'success', message: 'Habitación actualizada' });
      } else {
        await habitacionesAPI.create(payload);
        setAlert({ type: 'success', message: 'Habitación creada' });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al guardar' });
    }
  };

  const handleDelete = async () => {
    try {
      await habitacionesAPI.remove(deleteConfirm.id);
      setAlert({ type: 'success', message: 'Habitación eliminada' });
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al eliminar' });
      setDeleteConfirm(null);
    }
  };

  const changeEstado = async (hab, nuevoEstado) => {
    try {
      await habitacionesAPI.cambiarEstado(hab.id, nuevoEstado);
      setAlert({ type: 'success', message: `Estado cambiado a ${nuevoEstado}` });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al cambiar estado' });
    }
  };

  const tipoNombre = (id) => {
    const t = tipos.find((t) => t.id === id);
    return t ? t.nombre : id;
  };

  const columns = [
    { key: 'numero_habitacion', label: 'Número' },
    { key: 'id_tipo_habitacion', label: 'Tipo', render: (val, row) => row.tipo_nombre || tipoNombre(val) },
    { key: 'piso', label: 'Piso' },
    {
      key: 'estado',
      label: 'Estado',
      render: (val) => <Badge text={val || 'N/A'} variant={estadoVariant[val] || 'default'} />,
    },
    { key: 'notas', label: 'Notas', render: (val) => val || '-' },
    {
      key: '_quick',
      label: 'Cambiar Estado',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {['Disponible', 'Ocupada', 'Mantenimiento', 'Limpieza']
            .filter((e) => e !== row.estado)
            .map((e) => (
              <button
                key={e}
                className="btn btn-outline btn-sm"
                onClick={() => changeEstado(row, e)}
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
              >
                {e}
              </button>
            ))}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="page-header">
        <h2 className="page-title">🛏️ Gestión de Habitaciones</h2>
        <div className="page-actions">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            style={selectStyle}
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupada">Ocupada</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Limpieza">Limpieza</option>
          </select>
          <button className="btn btn-primary" onClick={openCreate}>➕ Nueva Habitación</button>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} onEdit={openEdit} onDelete={(r) => setDeleteConfirm(r)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '✏️ Editar Habitación' : '➕ Nueva Habitación'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Número de Habitación" name="numero_habitacion" value={form.numero_habitacion} onChange={handleChange} required />
          <FormField
            label="Tipo de Habitación"
            name="id_tipo_habitacion"
            type="select"
            value={form.id_tipo_habitacion}
            onChange={handleChange}
            options={tipos.map((t) => ({ value: t.id, label: t.nombre }))}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Piso" name="piso" type="number" value={form.piso} onChange={handleChange} required />
            <FormField
              label="Estado"
              name="estado"
              type="select"
              value={form.estado}
              onChange={handleChange}
              options={[
                { value: 'Disponible', label: 'Disponible' },
                { value: 'Ocupada', label: 'Ocupada' },
                { value: 'Mantenimiento', label: 'Mantenimiento' },
                { value: 'Limpieza', label: 'Limpieza' },
              ]}
            />
          </div>
          <FormField label="Notas" name="notas" type="textarea" value={form.notas} onChange={handleChange} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="⚠️ Confirmar Eliminación" size="sm">
        <p style={{ marginBottom: '1.5rem' }}>¿Eliminar la habitación <strong>{deleteConfirm?.numero_habitacion}</strong>?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}

const selectStyle = {
  padding: '0.5rem 1rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.9rem',
  background: '#fff',
  color: 'var(--text)',
};
