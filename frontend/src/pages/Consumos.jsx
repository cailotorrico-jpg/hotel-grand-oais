import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import { consumosAPI, reservasAPI, serviciosAPI } from '../services/api';

export default function Consumos() {
  const [consumos, setConsumos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [form, setForm] = useState({ id_reserva: '', id_servicio: '', cantidad: 1, notas: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, rRes, sRes] = await Promise.all([
        consumosAPI.getAll(), reservasAPI.getAll(), serviciosAPI.getAll()
      ]);
      setConsumos(Array.isArray(cRes.data) ? cRes.data : []);
      setReservas((Array.isArray(rRes.data) ? rRes.data : []).filter(r => r.estado === 'CheckIn' || r.estado === 'Confirmada'));
      setServicios(Array.isArray(sRes.data) ? sRes.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const servicio = servicios.find(s => s.id_servicio == form.id_servicio);
      const precio_unitario = servicio ? servicio.precio : 0;
      const cantidad = parseInt(form.cantidad) || 1;
      await consumosAPI.create({
        ...form,
        precio_unitario,
        subtotal: precio_unitario * cantidad,
        cantidad,
      });
      setAlert({ type: 'success', message: 'Consumo registrado exitosamente' });
      setModalOpen(false);
      setForm({ id_reserva: '', id_servicio: '', cantidad: 1, notas: '' });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al registrar consumo' });
    }
  };

  const handleDelete = async (row) => {
    if (!confirm('¿Eliminar este consumo?')) return;
    try {
      await consumosAPI.remove(row.id_consumo);
      setAlert({ type: 'success', message: 'Consumo eliminado' });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al eliminar consumo' });
    }
  };

  const columns = [
    { key: 'id_consumo', label: 'ID' },
    { key: 'huesped_nombre', label: 'Huésped', render: (v, r) => `${v || ''} ${r.huesped_apellido || ''}`.trim() || `Reserva #${r.id_reserva}` },
    { key: 'servicio_nombre', label: 'Servicio' },
    { key: 'categoria', label: 'Categoría', render: (v) => <Badge text={v || '-'} variant="info" /> },
    { key: 'cantidad', label: 'Cant.' },
    { key: 'precio_unitario', label: 'P. Unit.', render: (v) => `$${Number(v).toFixed(2)}` },
    { key: 'subtotal', label: 'Subtotal', render: (v) => `$${Number(v).toFixed(2)}` },
    { key: 'fecha_consumo', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleString('es-DO') : '-' },
  ];

  return (
    <div className="page-container">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="page-header">
        <h2 className="page-title">🛒 Consumos de Huéspedes</h2>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>➕ Registrar Consumo</button>
      </div>
      <DataTable columns={columns} data={consumos} loading={loading} onDelete={handleDelete} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="➕ Registrar Consumo" size="md">
        <form onSubmit={handleSubmit}>
          <FormField label="Reserva" name="id_reserva" type="select" value={form.id_reserva}
            onChange={handleChange} required
            options={reservas.map(r => ({ value: r.id_reserva, label: `#${r.id_reserva} - ${r.huesped_nombre || ''} ${r.huesped_apellido || ''}` }))} />
          <FormField label="Servicio" name="id_servicio" type="select" value={form.id_servicio}
            onChange={handleChange} required
            options={servicios.map(s => ({ value: s.id_servicio, label: `${s.nombre} - $${s.precio}` }))} />
          <FormField label="Cantidad" name="cantidad" type="number" value={form.cantidad} onChange={handleChange} required />
          <FormField label="Notas" name="notas" type="textarea" value={form.notas} onChange={handleChange} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
