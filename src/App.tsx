import { useState, useEffect } from 'react'
import './App.css'
import { Calendar, Clock, User, Phone, Send, Plus, Trash2, Edit2, Check, X, MessageSquare } from 'lucide-react'

interface Servicio {
  id: number;
  nombre: string;
  precio: string;
  duracion: string;
}

interface Horario {
  id: number;
  hora: string;
}

function App() {
  const [view, setView] = useState<'user' | 'admin'>('user');
  const [adminTab, setAdminTab] = useState<'reservas' | 'servicios' | 'config'>('reservas');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [step, setStep] = useState(1);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reservas, setReservas] = useState<any[]>([]);

  // Estados de Configuración
  const [whatsapp, setWhatsapp] = useState('');
  const [capacidad, setCapacidad] = useState(1);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [newHora, setNewHora] = useState('');
  const [ocupacion, setOcupacion] = useState<{hora: string, cantidad: number}[]>([]);

  // Estados para gestión de servicios
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [newServicio, setNewServicio] = useState({ nombre: '', precio: '', duracion: '' });
  const [isAdding, setIsAdding] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchServicios();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/api/config`);
      const data = await response.json();
      setWhatsapp(data.whatsapp);
      setCapacidad(data.capacidad);
      setHorarios(data.horarios);
    } catch (error) {
      console.error('Error al obtener config:', error);
    }
  };

  const fetchOcupacion = async (fecha: string) => {
    try {
      const response = await fetch(`${API_URL}/api/reservas/ocupacion?fecha=${fecha}`);
      const data = await response.json();
      setOcupacion(data);
    } catch (error) {
      console.error('Error al obtener ocupación:', error);
    }
  };

  useEffect(() => {
    if (date) {
      fetchOcupacion(date);
    }
  }, [date]);

  const fetchServicios = async () => {
    try {
      const response = await fetch(`${API_URL}/api/servicios`);
      const data = await response.json();
      setServicios(data);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
    }
  };

  const fetchReservas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reservas`);
      const data = await response.json();
      setReservas(data);
    } catch (error) {
      console.error('Error al obtener reservas:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, password })
      });
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true);
        fetchReservas();
      } else {
        setLoginError('Credenciales incorrectas');
      }
    } catch (error) {
      setLoginError('Error al conectar con el servidor');
    }
  };

  const handleUpdateWhatsapp = async () => {
    try {
      await fetch(`${API_URL}/api/config/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whatsapp)
      });
      alert('Número de WhatsApp actualizado');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateCapacidad = async () => {
    try {
      await fetch(`${API_URL}/api/config/capacidad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capacidad)
      });
      alert('Capacidad actualizada');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddHorario = async () => {
    if (!newHora) return;
    try {
      await fetch(`${API_URL}/api/config/horarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHora)
      });
      setNewHora('');
      fetchConfig();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteHorario = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/config/horarios/${id}`, { method: 'DELETE' });
      fetchConfig();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCrearServicio = async () => {
    try {
      const response = await fetch(`${API_URL}/api/servicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newServicio)
      });
      if (response.ok) {
        fetchServicios();
        setNewServicio({ nombre: '', precio: '', duracion: '' });
        setIsAdding(false);
      }
    } catch (error) {
      console.error('Error al crear servicio:', error);
    }
  };

  const handleEditarServicio = async () => {
    if (!editingServicio) return;
    try {
      const response = await fetch(`${API_URL}/api/servicios/${editingServicio.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingServicio)
      });
      if (response.ok) {
        fetchServicios();
        setEditingServicio(null);
      }
    } catch (error) {
      console.error('Error al editar servicio:', error);
    }
  };

  const handleEliminarServicio = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este servicio?')) return;
    try {
      const response = await fetch(`${API_URL}/api/servicios/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchServicios();
      }
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
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
      servicio: selectedService?.nombre,
      fecha: date,
      hora: time
    };

    try {
      const response = await fetch(`${API_URL}/api/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservaData)
      });
      if (response.ok) {
        console.log('Guardado en base de datos');
        fetchOcupacion(date); // Actualizar cupos inmediatamente
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Hubo un problema al confirmar tu reserva.');
        return; // Detener flujo de WhatsApp si falló el guardado
      }
    } catch (error) {
      console.error('Error en backend:', error);
    }

    const message = `Hola! Me gustaría realizar una reserva:%0A%0A*Servicio:* ${selectedService?.nombre}%0A*Fecha:* ${date}%0A*Hora:* ${time}%0A*Nombre:* ${name}%0A*Teléfono:* ${phone}%0A%0AConfirmame disponibilidad, por favor!`;
    window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
  };

  const progress = (step / 3) * 100;

  return (
    <div className="app-container">
      <nav className="admin-nav">
        <button onClick={() => { setView('user'); setStep(1); }}>Reservar</button>
        <button onClick={() => { setView('admin'); if (isLoggedIn) { fetchReservas(); fetchConfig(); } }}>Admin</button>
      </nav>

      <header className="header">
        <div className="logo-badge">Reserva Pro</div>
        <h1>{view === 'user' ? 'Agenda tu cita' : 'Panel de Control'}</h1>
        <p>{view === 'user' ? 'Confirmación instantánea vía WhatsApp' : 'Gestión completa de reservas y configuración'}</p>
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
                  {servicios.map((service) => (
                    <div 
                      key={service.id} 
                      className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                      onClick={() => setSelectedService(service)}
                    >
                      <h3>{service.nombre}</h3>
                      <p className="price">{service.precio}</p>
                      <p className="duration">{service.duracion}</p>
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
                    {horarios.map(h => {
                      const ocupado = ocupacion.find(o => o.hora === h.hora)?.cantidad || 0;
                      if (ocupado >= capacidad) return null;
                      return (
                        <option key={h.id} value={h.hora}>
                          {h.hora} {ocupado > 0 ? `(${capacidad - ocupado} libres)` : ''}
                        </option>
                      );
                    })}
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
                  <p><strong>Servicio:</strong> {selectedService?.nombre}</p>
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
          {!isLoggedIn ? (
            <section className="login-container">
              <h2>Acceso Administrador</h2>
              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label>Usuario</label>
                  <input type="text" value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin" />
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                {loginError && <p className="error-message">{loginError}</p>}
                <button type="submit" className="btn-primary">Entrar</button>
              </form>
            </section>
          ) : (
            <>
              <div className="admin-tabs">
                <button className={adminTab === 'reservas' ? 'active' : ''} onClick={() => setAdminTab('reservas')}>Reservas</button>
                <button className={adminTab === 'servicios' ? 'active' : ''} onClick={() => setAdminTab('servicios')}>Servicios</button>
                <button className={adminTab === 'config' ? 'active' : ''} onClick={() => setAdminTab('config')}>Configuración</button>
              </div>

              {adminTab === 'reservas' && (
                <>
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
                </>
              )}

              {adminTab === 'servicios' && (
                <section className="servicios-admin">
                  <div className="admin-header">
                    <h2>Gestión de Servicios</h2>
                    <button className="btn-add" onClick={() => setIsAdding(true)}><Plus size={18} /> Nuevo Servicio</button>
                  </div>

                  <div className="table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Precio</th>
                          <th>Duración</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isAdding && (
                          <tr className="adding-row">
                            <td><input type="text" placeholder="Nombre" value={newServicio.nombre} onChange={e => setNewServicio({...newServicio, nombre: e.target.value})} /></td>
                            <td><input type="text" placeholder="Precio" value={newServicio.precio} onChange={e => setNewServicio({...newServicio, precio: e.target.value})} /></td>
                            <td><input type="text" placeholder="Duración" value={newServicio.duracion} onChange={e => setNewServicio({...newServicio, duracion: e.target.value})} /></td>
                            <td className="actions">
                              <button onClick={handleCrearServicio} className="btn-icon save"><Check size={18} /></button>
                              <button onClick={() => setIsAdding(false)} className="btn-icon cancel"><X size={18} /></button>
                            </td>
                          </tr>
                        )}
                        {servicios.map((s) => (
                          <tr key={s.id}>
                            {editingServicio?.id === s.id ? (
                              <>
                                <td><input type="text" value={editingServicio.nombre} onChange={e => setEditingServicio({...editingServicio, nombre: e.target.value})} /></td>
                                <td><input type="text" value={editingServicio.precio} onChange={e => setEditingServicio({...editingServicio, precio: e.target.value})} /></td>
                                <td><input type="text" value={editingServicio.duracion} onChange={e => setEditingServicio({...editingServicio, duracion: e.target.value})} /></td>
                                <td className="actions">
                                  <button onClick={handleEditarServicio} className="btn-icon save"><Check size={18} /></button>
                                  <button onClick={() => setEditingServicio(null)} className="btn-icon cancel"><X size={18} /></button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>{s.nombre}</td>
                                <td>{s.precio}</td>
                                <td>{s.duracion}</td>
                                <td className="actions">
                                  <button onClick={() => setEditingServicio(s)} className="btn-icon"><Edit2 size={18} /></button>
                                  <button onClick={() => handleEliminarServicio(s.id)} className="btn-icon delete"><Trash2 size={18} /></button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {adminTab === 'config' && (
                <section className="config-admin animate-fade-in">
                  <div className="config-card">
                    <h3><MessageSquare size={20} /> WhatsApp</h3>
                    <p>Número para recibir reservas.</p>
                    <div className="form-group">
                      <input 
                        type="text" 
                        value={whatsapp} 
                        onChange={(e) => setWhatsapp(e.target.value)} 
                        placeholder="Ej: 59899097344"
                      />
                      <button onClick={handleUpdateWhatsapp} className="btn-primary" style={{marginTop: '10px'}}>Guardar Número</button>
                    </div>
                  </div>

                  <div className="config-card">
                    <h3><User size={20} /> Capacidad</h3>
                    <p>Cupos por cada horario.</p>
                    <div className="form-group">
                      <input 
                        type="number" 
                        value={capacidad} 
                        min="1"
                        onChange={(e) => setCapacidad(parseInt(e.target.value))} 
                      />
                      <button onClick={handleUpdateCapacidad} className="btn-primary" style={{marginTop: '10px'}}>Actualizar Cupos</button>
                    </div>
                  </div>

                  <div className="config-card">
                    <h3><Clock size={20} /> Horarios</h3>
                    <p>Gestiona las horas disponibles.</p>
                    <div className="horarios-manager">
                      <div className="form-group">
                        <input 
                          type="text" 
                          value={newHora} 
                          onChange={(e) => setNewHora(e.target.value)} 
                          placeholder="Ej: 18:30"
                        />
                        <button onClick={handleAddHorario} className="btn-primary" style={{marginTop: '10px'}}>Añadir Hora</button>
                      </div>
                      <div className="horarios-tags">
                        {horarios.map(h => (
                          <span key={h.id} className="horario-tag">
                            {h.hora}
                            <button onClick={() => handleDeleteHorario(h.id)}><X size={14} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      )}

      <footer className="footer">
        <p>&copy; 2024 Reserva Pro - Conexión directa vía WhatsApp</p>
      </footer>
    </div>
  );
}

export default App;
