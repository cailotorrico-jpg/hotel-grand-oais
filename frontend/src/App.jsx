import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Huespedes from './pages/Huespedes.jsx';
import TiposHabitacion from './pages/TiposHabitacion.jsx';
import Habitaciones from './pages/Habitaciones.jsx';
import Reservas from './pages/Reservas.jsx';
import CheckIns from './pages/CheckIns.jsx';
import Servicios from './pages/Servicios.jsx';
import Consumos from './pages/Consumos.jsx';
import Facturas from './pages/Facturas.jsx';
import CheckOuts from './pages/CheckOuts.jsx';
import Bitacora from './pages/Bitacora.jsx';
import LabJoins from './pages/LabJoins.jsx';
import LabTransacciones from './pages/LabTransacciones.jsx';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/huespedes" element={<Huespedes />} />
          <Route path="/tipos-habitacion" element={<TiposHabitacion />} />
          <Route path="/habitaciones" element={<Habitaciones />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/checkins" element={<CheckIns />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/consumos" element={<Consumos />} />
          <Route path="/facturas" element={<Facturas />} />
          <Route path="/checkouts" element={<CheckOuts />} />
          <Route path="/bitacora" element={<Bitacora />} />
          <Route path="/lab-joins" element={<LabJoins />} />
          <Route path="/lab-transacciones" element={<LabTransacciones />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
