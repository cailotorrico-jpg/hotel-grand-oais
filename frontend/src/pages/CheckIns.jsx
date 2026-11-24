import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import { checkInsAPI, reservasAPI } from '../services/api';

export default function CheckIns() {
  const [checkins, setCheckins] = useState([]);
  const [reservasConfirmadas, setReservasConfirmadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [alert, setAlert] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ciRes, rcRes] = await Promise.allSettled([
        checkInsAPI.getAll(),
        checkInsAPI.getReservasConfirmadas().catch(() => reservasAPI.getAll()),
      ]);

      if (ciRes.status === 'fulfilled') {
        setCheckins(Array.isArray(ciRes.value.data) ? ciRes.value.data : ciRes.value.data.data || []);
      }

      if (rcRes.status === 'fulfilled') {
        const data = Array.isArray(rcRes.value.data) ? rcRes.value.data : rcRes.value.data.data || [];
        // Filter only confirmed reservations
        setReservasConfirmadas(data.filter ? data.filter((r) => r.estado === 'Confirmada') : data);
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Error al cargar datos de check-in' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCheckin = async (e) => {
    e.preventDefault();
    try {
      await checkInsAPI.create({
        id_reserva: Number(selectedReserva),
        observaciones,
      });
      setAlert({ type: 'success', message: 'Check-In realizado exitosamente' });
      setModalOpen(false);
      setSelectedReserva('');
      setObservaciones('');
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al realizar check-in' });
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'id_reserva',
      label: 'Reserva',
      render: (val) => `#${val}`,
    },
    {
      key: 'huesped_nombre',
      label: 'Huésped',
      render: (val, row) => val || row.huesped || `Reserva #${row.id_reserva}`,
    },
    {
      key: 'fecha_checkin',
      label: 'Fecha Check-In',
      render: (val) => val ? new Date(val).toLocaleString('es-DO') : '-',
    },
    { key: 'observaciones', label: 'Observaciones', render: (val) => val || '-' },
    {
      key: 'estado',
      label: 'Estado',
      render: (val) => <Badge text={val || 'Realizado'} variant="success" />,
    },
  ];

  const readyColumns = [
    { key: 'id', label: 'Reserva #' },
    {
      key: 'huesped_nombre',
      label: 'Huésped',
      render: (val, row) => val || `${row.nombre || ''} ${row.apellido || ''}`.trim() || `#${row.id_huesped}`,
    },
    {
      key: 'fecha_entrada',
      label: 'Fecha Entrada',
      render: (val) => val ? new Date(val).toLocaleDateString('es-DO') : '-',
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (val) => <Badge text={val} variant="success" />,
    },
    {
      key: '_action',
      label: 'Acción',
      render: (_, row) => (
        <button
          className="btn btn-success btn-sm"
          onClick={() => {
            setSelectedReserva(String(row.id));
            setObservaciones('');
            setModalOpen(true);
          }}
        >
          ✅ Realizar Check-In
        </button>
      ),
    },
  ];

  return (
    <div className="page-container">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="page-header">
        <h2 className="page-title">✅ Gestión de Check-In</h2>
      </div>

      {/* Reservations ready for check-in */}
      {reservasConfirmadas.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">📋 Reservas Listas para Check-In</h3>
            <Badge text={`${reservasConfirmadas.length} pendientes`} variant="warning" />
          </div>
          <DataTable columns={readyColumns} data={reservasConfirmadas} />
        </div>
      )}

      {/* Check-in history */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📜 Historial de Check-Ins</h3>
        </div>
        <DataTable columns={columns} data={checkins} loading={loading} />
      </div>

      {/* Check-In Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="✅ Realizar Check-In">
        <form onSubmit={handleCheckin}>
          <FormField
            label="Reserva"
            name="id_reserva"
            type="select"
            value={selectedReserva}
            onChange={(e) => setSelectedReserva(e.target.value)}
            options={reservasConfirmadas.map((r) => ({
              value: r.id,
              label: `Reserva #${r.id} - ${r.huesped_nombre || r.nombre || 'Huésped'}`,
            }))}
            required
          />
          <FormField
            label="Observaciones"
            name="observaciones"
            type="textarea"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Observaciones adicionales del check-in..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-success">✅ Confirmar Check-In</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
