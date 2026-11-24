import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import { checkOutsAPI, facturasAPI } from '../services/api';

export default function CheckOuts() {
  const [checkouts, setCheckouts] = useState([]);
  const [reservasCI, setReservasCI] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [form, setForm] = useState({ id_reserva: '', observaciones: '' });
  const [generando, setGenerando] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coRes, rRes] = await Promise.all([
        checkOutsAPI.getAll(), checkOutsAPI.getReservasCheckedIn()
      ]);
      setCheckouts(Array.isArray(coRes.data) ? coRes.data : []);
      setReservasCI(Array.isArray(rRes.data) ? rRes.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    setGenerando(true);
    try {
      // Generar factura primero
      const facturaRes = await facturasAPI.generar(form.id_reserva);
      const factura = facturaRes.data;
      // Realizar check-out
      await checkOutsAPI.create({
        id_reserva: parseInt(form.id_reserva),
        id_factura: factura.id_factura,
        observaciones: form.observaciones,
        usuario_registro: 'Sistema',
      });
      setAlert({ type: 'success', message: `Check-Out realizado. Factura ${factura.numero_factura} generada por $${Number(factura.total).toFixed(2)}` });
      setModalOpen(false);
      setForm({ id_reserva: '', observaciones: '' });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al realizar check-out' });
    } finally { setGenerando(false); }
  };

  const columns = [
    { key: 'id_checkout', label: 'ID' },
    { key: 'id_reserva', label: 'Reserva', render: (v) => `#${v}` },
    { key: 'huesped_nombre', label: 'Huésped', render: (v, r) => `${v || ''} ${r.huesped_apellido || ''}` },
    { key: 'numero_factura', label: 'Factura' },
    { key: 'total_factura', label: 'Total', render: (v) => v ? `$${Number(v).toFixed(2)}` : '-' },
    { key: 'fecha_checkout', label: 'Fecha Check-Out', render: (v) => v ? new Date(v).toLocaleString('es-DO') : '-' },
    { key: 'observaciones', label: 'Observaciones' },
    { key: 'usuario_registro', label: 'Usuario' },
  ];

  return (
    <div className="page-container">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="page-header">
        <h2 className="page-title">🚪 Check-Out</h2>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          🚪 Realizar Check-Out ({reservasCI.length} pendientes)
        </button>
      </div>
      <DataTable columns={columns} data={checkouts} loading={loading} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="🚪 Realizar Check-Out" size="md">
        <form onSubmit={handleCheckOut}>
          <FormField label="Reserva (con Check-In)" name="id_reserva" type="select" value={form.id_reserva}
            onChange={(e) => setForm({ ...form, id_reserva: e.target.value })} required
            options={reservasCI.map(r => ({
              value: r.id_reserva,
              label: `#${r.id_reserva} - ${r.huesped_nombre || ''} ${r.huesped_apellido || ''}`
            }))} />
          <FormField label="Observaciones" name="observaciones" type="textarea" value={form.observaciones}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            ⚠️ Se generará automáticamente la factura con ITBIS 18%.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={generando}>
              {generando ? 'Procesando...' : 'Confirmar Check-Out'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
