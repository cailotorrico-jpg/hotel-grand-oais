import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import { facturasAPI } from '../services/api';

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await facturasAPI.getAll();
      setFacturas(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const estadoVariant = (e) => ({ Pendiente: 'warning', Pagada: 'success', Anulada: 'danger' }[e] || 'default');

  const columns = [
    { key: 'numero_factura', label: 'N° Factura' },
    { key: 'id_reserva', label: 'Reserva', render: (v) => `#${v}` },
    { key: 'huesped_nombre', label: 'Huésped', render: (v, r) => `${v || ''} ${r.huesped_apellido || ''}` },
    { key: 'subtotal', label: 'Subtotal', render: (v) => `$${Number(v).toFixed(2)}` },
    { key: 'impuestos', label: 'ITBIS (18%)', render: (v) => `$${Number(v).toFixed(2)}` },
    { key: 'total', label: 'Total', render: (v) => <strong style={{ color: 'var(--success)' }}>${Number(v).toFixed(2)}</strong> },
    { key: 'metodo_pago', label: 'Método Pago' },
    { key: 'estado', label: 'Estado', render: (v) => <Badge text={v} variant={estadoVariant(v)} /> },
    { key: 'fecha_factura', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleDateString('es-DO') : '-' },
  ];

  return (
    <div className="page-container">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="page-header">
        <h2 className="page-title">💰 Facturación</h2>
      </div>
      <DataTable columns={columns} data={facturas} loading={loading} />
    </div>
  );
}
