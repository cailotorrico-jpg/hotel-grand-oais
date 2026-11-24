import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import SearchBar from '../components/SearchBar';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import { huespedesAPI } from '../services/api';

const emptyForm = {
  nombre: '',
  apellido: '',
  tipo_documento: 'Cédula',
  documento_identidad: '',
  telefono: '',
  email: '',
  direccion: '',
  pais: 'República Dominicana',
};

export default function Huespedes() {
  const [huespedes, setHuespedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await huespedesAPI.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setHuespedes(data);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Error al cargar huéspedes' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = huespedes.filter((h) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (h.nombre || '').toLowerCase().includes(q) ||
      (h.apellido || '').toLowerCase().includes(q) ||
      (h.documento_identidad || '').toLowerCase().includes(q) ||
      (h.email || '').toLowerCase().includes(q) ||
      (h.telefono || '').toLowerCase().includes(q)
    );
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      nombre: row.nombre || '',
      apellido: row.apellido || '',
      tipo_documento: row.tipo_documento || 'Cédula',
      documento_identidad: row.documento_identidad || '',
      telefono: row.telefono || '',
      email: row.email || '',
      direccion: row.direccion || '',
      pais: row.pais || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await huespedesAPI.update(editing.id, form);
        setAlert({ type: 'success', message: 'Huésped actualizado exitosamente' });
      } else {
        await huespedesAPI.create(form);
        setAlert({ type: 'success', message: 'Huésped creado exitosamente' });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al guardar huésped' });
    }
  };

  const handleDelete = async () => {
    try {
      await huespedesAPI.remove(deleteConfirm.id);
      setAlert({ type: 'success', message: 'Huésped eliminado exitosamente' });
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al eliminar huésped' });
      setDeleteConfirm(null);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'documento_identidad', label: 'Documento' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    { key: 'pais', label: 'País' },
    {
      key: 'estado',
      label: 'Estado',
      render: (val) => (
        <Badge
          text={val || 'Activo'}
          variant={val === 'Inactivo' ? 'danger' : 'success'}
        />
      ),
    },
  ];

  return (
    <div className="page-container">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="page-header">
        <h2 className="page-title">👥 Gestión de Huéspedes</h2>
        <div className="page-actions">
          <SearchBar
            placeholder="Buscar huésped..."
            value={search}
            onChange={setSearch}
          />
          <button className="btn btn-primary" onClick={openCreate}>
            ➕ Nuevo Huésped
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        onEdit={openEdit}
        onDelete={(row) => setDeleteConfirm(row)}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? '✏️ Editar Huésped' : '➕ Nuevo Huésped'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            <FormField label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
            <FormField
              label="Tipo Documento"
              name="tipo_documento"
              type="select"
              value={form.tipo_documento}
              onChange={handleChange}
              options={[
                { value: 'Cédula', label: 'Cédula' },
                { value: 'Pasaporte', label: 'Pasaporte' },
                { value: 'Licencia', label: 'Licencia de Conducir' },
              ]}
              required
            />
            <FormField label="Documento de Identidad" name="documento_identidad" value={form.documento_identidad} onChange={handleChange} required />
            <FormField label="Teléfono" name="telefono" type="tel" value={form.telefono} onChange={handleChange} />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            <FormField label="País" name="pais" value={form.pais} onChange={handleChange} />
            <FormField label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="⚠️ Confirmar Eliminación"
        size="sm"
      >
        <p style={{ marginBottom: '1.5rem' }}>
          ¿Está seguro que desea eliminar al huésped{' '}
          <strong>{deleteConfirm?.nombre} {deleteConfirm?.apellido}</strong>?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
