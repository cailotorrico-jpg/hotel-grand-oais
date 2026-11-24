import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import { tiposHabitacionAPI } from '../services/api';

const emptyForm = {
  nombre: '',
  descripcion: '',
  precio_por_noche: '',
  capacidad: '',
  estado: 'Activo',
};

export default function TiposHabitacion() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tiposHabitacionAPI.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setTipos(data);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Error al cargar tipos de habitación' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      nombre: row.nombre || '',
      descripcion: row.descripcion || '',
      precio_por_noche: row.precio_por_noche || '',
      capacidad: row.capacidad || '',
      estado: row.estado || 'Activo',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, precio_por_noche: Number(form.precio_por_noche), capacidad: Number(form.capacidad) };
      if (editing) {
        await tiposHabitacionAPI.update(editing.id, payload);
        setAlert({ type: 'success', message: 'Tipo de habitación actualizado' });
      } else {
        await tiposHabitacionAPI.create(payload);
        setAlert({ type: 'success', message: 'Tipo de habitación creado' });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al guardar' });
    }
  };

  const handleDelete = async () => {
    try {
      await tiposHabitacionAPI.remove(deleteConfirm.id);
      setAlert({ type: 'success', message: 'Tipo de habitación eliminado' });
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al eliminar' });
      setDeleteConfirm(null);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    {
      key: 'precio_por_noche',
      label: 'Precio/Noche',
      render: (val) => val != null ? `RD$ ${Number(val).toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : '-',
    },
    { key: 'capacidad', label: 'Capacidad', render: (val) => val ? `${val} personas` : '-' },
    {
      key: 'estado',
      label: 'Estado',
      render: (val) => <Badge text={val || 'Activo'} variant={val === 'Inactivo' ? 'danger' : 'success'} />,
    },
  ];

  return (
    <div className="page-container">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="page-header">
        <h2 className="page-title">🏷️ Tipos de Habitación</h2>
        <button className="btn btn-primary" onClick={openCreate}>➕ Nuevo Tipo</button>
      </div>

      <DataTable columns={columns} data={tipos} loading={loading} onEdit={openEdit} onDelete={(r) => setDeleteConfirm(r)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '✏️ Editar Tipo' : '➕ Nuevo Tipo'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          <FormField label="Descripción" name="descripcion" type="textarea" value={form.descripcion} onChange={handleChange} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Precio por Noche (RD$)" name="precio_por_noche" type="number" value={form.precio_por_noche} onChange={handleChange} required />
            <FormField label="Capacidad (personas)" name="capacidad" type="number" value={form.capacidad} onChange={handleChange} required />
          </div>
          <FormField label="Estado" name="estado" type="select" value={form.estado} onChange={handleChange} options={[{ value: 'Activo', label: 'Activo' }, { value: 'Inactivo', label: 'Inactivo' }]} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="⚠️ Confirmar Eliminación" size="sm">
        <p style={{ marginBottom: '1.5rem' }}>¿Eliminar el tipo <strong>{deleteConfirm?.nombre}</strong>?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
