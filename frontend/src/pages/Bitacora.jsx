import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import SearchBar from '../components/SearchBar';
import { bitacoraAPI } from '../services/api';

export default function Bitacora() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTabla, setFilterTabla] = useState('');
  const [filterAccion, setFilterAccion] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await bitacoraAPI.getAll();
      setRegistros(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const accionVariant = (a) => ({ INSERT: 'success', UPDATE: 'warning', DELETE: 'danger' }[a] || 'default');

  const filtered = registros.filter(r => {
    if (filterTabla && !(r.tabla_afectada || '').toLowerCase().includes(filterTabla.toLowerCase())) return false;
    if (filterAccion && r.accion !== filterAccion) return false;
    return true;
  });

  const columns = [
    { key: 'id_registro', label: 'ID' },
    { key: 'fecha', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleString('es-DO') : '-' },
    { key: 'tabla_afectada', label: 'Tabla' },
    { key: 'accion', label: 'Acción', render: (v) => <Badge text={v} variant={accionVariant(v)} /> },
    { key: 'id_referencia', label: 'Ref. ID' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'usuario', label: 'Usuario' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">📜 Bitácora del Sistema</h2>
        <div className="page-actions">
          <SearchBar placeholder="Filtrar por tabla..." value={filterTabla} onChange={setFilterTabla} />
          <select className="btn btn-outline" value={filterAccion}
            onChange={(e) => setFilterAccion(e.target.value)}
            style={{ padding: '0.5rem 1rem' }}>
            <option value="">Todas las acciones</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>
      <DataTable columns={columns} data={filtered} loading={loading} />
    </div>
  );
}
