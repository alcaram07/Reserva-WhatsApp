import { useState } from 'react'
import './App.css'
import { Calendar, Clock, User, Phone, Send } from 'lucide-react'

interface Service {
  id: number;
  name: string;
  price: string;
  duration: string;
}

const SERVICES: Service[] = [
  { id: 1, name: 'Corte de Cabello', price: '$2000', duration: '45 min' },
  { id: 2, name: 'Barba y Perfilado', price: '$1500', duration: '30 min' },
  { id: 3, name: 'Combo Corte + Barba', price: '$3000', duration: '75 min' },
  { id: 4, name: 'Tratamiento Capilar', price: '$2500', duration: '60 min' },
];

function App() {
  const [view, setView] = useState<'user' | 'admin'>('user');
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reservas, setReservas] = useState<any[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const businessPhone = '59899097344'; 

  const progress = (step / 3) * 100;

  const fetchReservas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reservas`);
      const data = await response.json();
      setReservas(data);
    } catch (error) {
      console.error('Error al obtener reservas:', error);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedService) return;
    if (step === 2 && (!date || !time)) return;
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const sendWhatsApp = async () => {
    const reservaData = {
      nombre: name,
      telefono: phone,
      servicio: selectedService?.name,
      fecha: date,
      hora: time
    };

    try {
      const response = await fetch(`${API_URL}/api/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservaData)
      });
      if (response.ok) console.log('Guardado en base de datos SQLite');
    } catch (error) {
      console.error('Error en backend:', error);
    }

    const message = `Hola! Me gustaría realizar una reserva:%0A%0A*Servicio:* ${selectedService?.name}%0A*Fecha:* ${date}%0A*Hora:* ${time}%0A*Nombre:* ${name}%0A*Teléfono:* ${phone}%0A%0AConfirmame disponibilidad, por favor!`;
    window.open(`https://wa.me/${businessPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="app-container">
      <nav className="admin-nav">
        <button onClick={() => { setView('user'); setStep(1); }}>Reservar</button>
        <button onClick={() => { setView('admin'); fetchReservas(); }}>Admin</button>
      </nav>

      <header className="header">
        <div className="logo-badge">Reserva Pro</div>
        <h1>{view === 'user' ? 'Agenda tu cita' : 'Panel de Control'}</h1>
        <p>{view === 'user' ? 'Confirmación instantánea vía WhatsApp' : 'Listado de reservas en SQL Server'}</p>
      </header>

      {view === 'user' ? (
        <>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          <main className="main-content">
            <div className="stepper">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`}>
                  {s}
                </div>
              ))}
            </div>

            {step === 1 && (
              <section className="step-content animate-fade-in">
                <h2>Selecciona un Servicio</h2>
                <div className="services-grid">
                  {SERVICES.map((service) => (
                    <div 
                      key={service.id} 
                      className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                      onClick={() => setSelectedService(service)}
                    >
                      <h3>{service.name}</h3>
                      <p className="price">{service.price}</p>
                      <p className="duration">{service.duration}</p>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" disabled={!selectedService} onClick={handleNextStep}>Continuar</button>
              </section>
            )}

            {step === 2 && (
              <section className="step-content animate-fade-in">
                <h2>Elige Fecha y Hora</h2>
                <div className="form-group">
                  <label><Calendar size={18} /> Fecha</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label><Clock size={18} /> Hora</label>
                  <select value={time} onChange={(e) => setTime(e.target.value)}>
                    <option value="">Seleccionar hora</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                </div>
                <div className="button-group">
                  <button className="btn-secondary" onClick={handlePrevStep}>Volver</button>
                  <button className="btn-primary" disabled={!date || !time} onClick={handleNextStep}>Continuar</button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="step-content animate-fade-in">
                <h2>Tus Datos</h2>
                <div className="form-group">
                  <label><User size={18} /> Nombre Completo</label>
                  <input type="text" placeholder="Ej: Juan Pérez" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label><Phone size={18} /> Teléfono de Contacto</label>
                  <input type="tel" placeholder="Ej: 099 123 456" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                
                <div className="summary-card">
                  <h3>Resumen de Reserva</h3>
                  <p><strong>Servicio:</strong> {selectedService?.name}</p>
                  <p><strong>Fecha:</strong> {date}</p>
                  <p><strong>Hora:</strong> {time}</p>
                </div>

                <div className="button-group">
                  <button className="btn-secondary" onClick={handlePrevStep}>Volver</button>
                  <button className="btn-whatsapp" disabled={!name || !phone} onClick={sendWhatsApp}>
                    <Send size={18} /> Confirmar por WhatsApp
                  </button>
                </div>
              </section>
            )}
          </main>
        </>
      ) : (
        <main className="main-content admin-view animate-fade-in">
          <h2>Reservas Registradas</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Servicio</th>
                  <th>Fecha/Hora</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {reservas.length === 0 ? (
                  <tr><td colSpan={5}>No hay reservas guardadas aún.</td></tr>
                ) : (
                  reservas.map((r) => (
                    <tr key={r.id}>
                      <td>{r.nombre}</td>
                      <td>{r.telefono}</td>
                      <td>{r.servicio}</td>
                      <td>{r.fecha} {r.hora}</td>
                      <td>{new Date(r.fechaRegistro).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <button className="btn-secondary" onClick={fetchReservas} style={{ marginTop: '20px' }}>Actualizar Lista</button>
        </main>
      )}

      <footer className="footer">
        <p>&copy; 2024 Reserva Pro - Conexión directa vía WhatsApp</p>
      </footer>
    </div>
  );
}

export default App;
