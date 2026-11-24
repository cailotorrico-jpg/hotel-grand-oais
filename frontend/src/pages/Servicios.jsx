import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import { serviciosAPI } from '../services/api';

const categoriaVariant = {
  'Alimentación': 'success',
  'Spa': 'info',
  'Lavandería': 'warning',
  'Transporte': 'default',
  'Entretenimiento': 'info',
  'Otros': 'default',
};

const emptyForm = {
  nombre: '',
  descripcion: '',
  categoria: '',
  precio: '',
  estado: 'Activo',
};

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategoria, setFilterCategoria] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await serviciosAPI.getAll();
      setServicios(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Error al cargar servicios' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const categorias = [...new Set(servicios.map((s) => s.categoria).filter(Boolean))];

  const filtered = filterCategoria
    ? servicios.filter((s) => s.categoria === filterCategoria)
    : servicios;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      nombre: row.nombre || '',
      descripcion: row.descripcion || '',
      categoria: row.categoria || '',
      precio: row.precio || '',
      estado: row.estado || 'Activo',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, precio: Number(form.precio) };
      if (editing) {
        await serviciosAPI.update(editing.id, payload);
        setAlert({ type: 'success', message: 'Servicio actualizado' });
      } else {
        await serviciosAPI.create(payload);
        setAlert({ type: 'success', message: 'Servicio creado' });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al guardar' });
    }
  };

  const handleDelete = async () => {
    try {
      await serviciosAPI.remove(deleteConfirm.id);
      setAlert({ type: 'success', message: 'Servicio eliminado' });
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
    {
      key: 'categoria',
      label: 'Categoría',
      render: (val) => <Badge text={val || 'Sin categoría'} variant={categoriaVariant[val] || 'default'} />,
    },
    {
      key: 'precio',
      label: 'Precio',
      render: (val) => val != null ? `RD$ ${Number(val).toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : '-',
    },
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
        <h2 className="page-title">🍽️ Catálogo de Servicios</h2>
        <div className="page-actions">
          <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)} style={selectStyle}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openCreate}>➕ Nuevo Servicio</button>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} onEdit={openEdit} onDelete={(r) => setDeleteConfirm(r)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '✏️ Editar Servicio' : '➕ Nuevo Servicio'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          <FormField label="Descripción" name="descripcion" type="textarea" value={form.descripcion} onChange={handleChange} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField
              label="Categoría"
              name="categoria"
              type="select"
              value={form.categoria}
              onChange={handleChange}
              options={[
                { value: 'Alimentación', label: 'Alimentación' },
                { value: 'Spa', label: 'Spa' },
                { value: 'Lavandería', label: 'Lavandería' },
                { value: 'Transporte', label: 'Transporte' },
                { value: 'Entretenimiento', label: 'Entretenimiento' },
                { value: 'Otros', label: 'Otros' },
              ]}
              required
            />
            <FormField label="Precio (RD$)" name="precio" type="number" value={form.precio} onChange={handleChange} required />
          </div>
          <FormField
            label="Estado"
            name="estado"
            type="select"
            value={form.estado}
            onChange={handleChange}
            options={[{ value: 'Activo', label: 'Activo' }, { value: 'Inactivo', label: 'Inactivo' }]}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="⚠️ Confirmar Eliminación" size="sm">
        <p style={{ marginBottom: '1.5rem' }}>¿Eliminar el servicio <strong>{deleteConfirm?.nombre}</strong>?</p>
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
