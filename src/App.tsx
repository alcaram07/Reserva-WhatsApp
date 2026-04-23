import { useState, useEffect } from 'react'
import './App.css'
import { Calendar, Clock, User, Phone, Send, Plus, Trash2, Edit2, Check, X, MessageSquare, Scissors } from 'lucide-react'

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

interface Barbero {
  id: number;
  nombre: string;
  especialidad: string;
}

function App() {
  const [view, setView] = useState<'user' | 'admin'>('user');
  const [adminTab, setAdminTab] = useState<'reservas' | 'servicios' | 'barberos' | 'config'>('reservas');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [step, setStep] = useState(1);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barbero | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reservas, setReservas] = useState<any[]>([]);

  // Estados de Configuración
  const [whatsapp, setWhatsapp] = useState('');
  const [prefijoPais, setPrefijoPais] = useState('598');
  const [nombreNegocio, setNombreNegocio] = useState('Reserva Pro');
  const [capacidad, setCapacidad] = useState(1);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [newHora, setNewHora] = useState('');
  const [ocupacion, setOcupacion] = useState<{hora: string, cantidad: number}[]>([]);

  // Estados para gestión de servicios y barberos
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [newServicio, setNewServicio] = useState({ nombre: '', precio: '', duracion: '' });
  const [isAddingServicio, setIsAddingServicio] = useState(false);
  
  const [newBarbero, setNewBarbero] = useState({ nombre: '', especialidad: '' });
  const [isAddingBarbero, setIsAddingBarbero] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchServicios();
    fetchConfig();
    fetchBarberos();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/api/config`);
      const data = await response.json();
      setWhatsapp(data.whatsapp);
      setCapacidad(data.capacidad);
      setHorarios(data.horarios);
      if (data.prefijo) setPrefijoPais(data.prefijo);
      if (data.nombreNegocio) setNombreNegocio(data.nombreNegocio);
    } catch (error) {
      console.error('Error al obtener config:', error);
    }
  };

  const fetchBarberos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/barberos`);
      const data = await response.json();
      setBarberos(data);
    } catch (error) {
      console.error('Error al obtener barberos:', error);
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

  const handleUpdateNombre = async () => {
    try {
      await fetch(`${API_URL}/api/config/nombre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nombreNegocio)
      });
      alert('Nombre del negocio actualizado');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdatePrefijo = async () => {
    try {
      await fetch(`${API_URL}/api/config/prefijo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefijoPais)
      });
      alert('Prefijo de país actualizado');
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
        setIsAddingServicio(false);
      }
    } catch (error) {
      console.error('Error al crear servicio:', error);
    }
  };

  const handleCrearBarbero = async () => {
    try {
      const response = await fetch(`${API_URL}/api/barberos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBarbero)
      });
      if (response.ok) {
        fetchBarberos();
        setNewBarbero({ nombre: '', especialidad: '' });
        setIsAddingBarbero(false);
      }
    } catch (error) {
      console.error('Error al crear barbero:', error);
    }
  };

  const handleEliminarBarbero = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este barbero?')) return;
    try {
      await fetch(`${API_URL}/api/barberos/${id}`, { method: 'DELETE' });
      fetchBarberos();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedService) return;
    if (step === 2 && !selectedBarber) return;
    if (step === 3 && (!date || !time)) return;
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
      barbero: selectedBarber?.nombre,
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
        fetchOcupacion(date);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Hubo un problema al confirmar tu reserva.');
        return;
      }
    } catch (error) {
      console.error('Error en backend:', error);
    }

    const message = `Hola! Me gustaría realizar una reserva:%0A%0A*Servicio:* ${selectedService?.nombre}%0A*Barbero:* ${selectedBarber?.nombre}%0A*Fecha:* ${date}%0A*Hora:* ${time}%0A*Nombre:* ${name}%0A*Teléfono:* ${phone}%0A%0AConfirmame disponibilidad, por favor!`;
    window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
  };

  const progress = (step / 4) * 100;

  return (
    <div className="app-container">
      <nav className="admin-nav">
        <button onClick={() => { setView('user'); setStep(1); }}>Reservar</button>
        <button onClick={() => { setView('admin'); if (isLoggedIn) { fetchReservas(); fetchConfig(); fetchBarberos(); } }}>Admin</button>
      </nav>

      <header className="header">
        <div className="logo-badge">{nombreNegocio}</div>
        <h1>{view === 'user' ? 'Agenda tu cita' : 'Panel de Control'}</h1>
        <p>{view === 'user' ? 'Confirmación instantánea vía WhatsApp' : 'Gestión completa de reservas y configuración'}</p>
      </header>

      {view === 'user' ? (
        <>
          <div className="progress-container" style={{height: '6px', background: '#eee', borderRadius: '3px', marginBottom: '30px', overflow: 'hidden'}}>
            <div className="progress-bar" style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-color)', transition: '0.3s' }}></div>
          </div>

          <main className="main-content">
            <div className="stepper">
              {[1, 2, 3, 4].map((s) => (
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
                <button className="btn-primary" disabled={!selectedService} onClick={handleNextStep} style={{ opacity: !selectedService ? 0.5 : 1 }}>Continuar</button>
              </section>
            )}

            {step === 2 && (
              <section className="step-content animate-fade-in">
                <h2>¿Con quién te gustaría atenderte?</h2>
                <div className="services-grid">
                  {barberos.length === 0 ? (
                    <p>Cargando barberos...</p>
                  ) : (
                    barberos.map((barber) => (
                      <div 
                        key={barber.id} 
                        className={`service-card ${selectedBarber?.id === barber.id ? 'selected' : ''}`}
                        onClick={() => setSelectedBarber(barber)}
                      >
                        <Scissors size={32} style={{marginBottom: '10px', color: 'var(--primary-color)'}} />
                        <h3>{barber.nombre}</h3>
                        <p className="duration">{barber.especialidad}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="button-group">
                  <button className="btn-secondary" onClick={handlePrevStep}>Volver</button>
                  <button className="btn-primary" disabled={!selectedBarber} onClick={handleNextStep} style={{ opacity: !selectedBarber ? 0.5 : 1 }}>Continuar</button>
                </div>
              </section>
            )}

            {step === 3 && (
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
                  <button className="btn-primary" disabled={!date || !time} onClick={handleNextStep} style={{ opacity: (!date || !time) ? 0.5 : 1 }}>Continuar</button>
                </div>
              </section>
            )}

            {step === 4 && (
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
                  <p><strong>Negocio:</strong> {nombreNegocio}</p>
                  <p><strong>Servicio:</strong> {selectedService?.nombre}</p>
                  <p><strong>Barbero:</strong> {selectedBarber?.nombre}</p>
                  <p><strong>Fecha:</strong> {date}</p>
                  <p><strong>Hora:</strong> {time}</p>
                </div>

                <div className="button-group">
                  <button className="btn-secondary" onClick={handlePrevStep}>Volver</button>
                  <button className="btn-whatsapp" disabled={!name || !phone || name.length < 3} onClick={sendWhatsApp}>
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
                {loginError && <p className="error-message" style={{color: 'red', marginBottom: '10px'}}>{loginError}</p>}
                <button type="submit" className="btn-primary">Entrar</button>
              </form>
            </section>
          ) : (
            <>
              <div className="admin-tabs">
                <button className={adminTab === 'reservas' ? 'active' : ''} onClick={() => setAdminTab('reservas')}>Reservas</button>
                <button className={adminTab === 'servicios' ? 'active' : ''} onClick={() => setAdminTab('servicios')}>Servicios</button>
                <button className={adminTab === 'barberos' ? 'active' : ''} onClick={() => setAdminTab('barberos')}>Barberos</button>
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
                          <th>Barbero</th>
                          <th>Fecha/Hora</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservas.length === 0 ? (
                          <tr><td colSpan={6}>No hay reservas guardadas aún.</td></tr>
                        ) : (
                          reservas.map((r) => (
                            <tr key={r.id}>
                              <td>{r.nombre}</td>
                              <td>{r.telefono}</td>
                              <td>{r.servicio}</td>
                              <td>{r.barbero || 'No asignado'}</td>
                              <td>{r.fecha} {r.hora}</td>
                              <td>
                                <button 
                                  className="btn-icon" 
                                  style={{color: '#25D366', display: 'flex', alignItems: 'center', gap: '5px'}}
                                  onClick={() => {
                                    let rawPhone = r.telefono.replace(/\D/g, '');
                                    if (rawPhone.startsWith('0')) rawPhone = rawPhone.substring(1);
                                    const finalPhone = rawPhone.startsWith(prefijoPais) ? rawPhone : prefijoPais + rawPhone;
                                    const msg = `Hola ${r.nombre}! Confirmo tu reserva para *${r.servicio}* con *${r.barbero}* el día ${r.fecha} a las ${r.hora}. ¡Te esperamos!`;
                                    window.open(`https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(msg)}`, '_blank');
                                  }}
                                >
                                  <MessageSquare size={18} /> Confirmar
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {adminTab === 'servicios' && (
                <section className="servicios-admin">
                  <div className="admin-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                    <h2>Gestión de Servicios</h2>
                    <button className="btn-primary" style={{width: 'auto'}} onClick={() => setIsAddingServicio(true)}><Plus size={18} /> Nuevo</button>
                  </div>
                  <div className="table-container">
                    <table className="admin-table">
                      <thead>
                        <tr><th>Nombre</th><th>Precio</th><th>Duración</th><th>Acciones</th></tr>
                      </thead>
                      <tbody>
                        {isAddingServicio && (
                          <tr>
                            <td><input type="text" value={newServicio.nombre} onChange={e => setNewServicio({...newServicio, nombre: e.target.value})} /></td>
                            <td><input type="text" value={newServicio.precio} onChange={e => setNewServicio({...newServicio, precio: e.target.value})} /></td>
                            <td><input type="text" value={newServicio.duracion} onChange={e => setNewServicio({...newServicio, duracion: e.target.value})} /></td>
                            <td><button onClick={handleCrearServicio}><Check size={18} /></button></td>
                          </tr>
                        )}
                        {servicios.map(s => (
                          <tr key={s.id}><td>{s.nombre}</td><td>{s.precio}</td><td>{s.duracion}</td><td><button onClick={() => handleEliminarServicio(s.id)}><Trash2 size={18} /></button></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {adminTab === 'barberos' && (
                <section className="servicios-admin">
                  <div className="admin-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                    <h2>Nuestros Barberos</h2>
                    <button className="btn-primary" style={{width: 'auto'}} onClick={() => setIsAddingBarbero(true)}><Plus size={18} /> Añadir Barbero</button>
                  </div>
                  <div className="table-container">
                    <table className="admin-table">
                      <thead>
                        <tr><th>Nombre</th><th>Especialidad</th><th>Acciones</th></tr>
                      </thead>
                      <tbody>
                        {isAddingBarbero && (
                          <tr>
                            <td><input type="text" value={newBarbero.nombre} onChange={e => setNewBarbero({...newBarbero, nombre: e.target.value})} /></td>
                            <td><input type="text" value={newBarbero.especialidad} onChange={e => setNewBarbero({...newBarbero, especialidad: e.target.value})} /></td>
                            <td><button onClick={handleCrearBarbero}><Check size={18} /></button></td>
                          </tr>
                        )}
                        {barberos.map(b => (
                          <tr key={b.id}><td>{b.nombre}</td><td>{b.especialidad}</td><td><button onClick={() => handleEliminarBarbero(b.id)}><Trash2 size={18} /></button></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {adminTab === 'config' && (
                <section className="config-admin">
                   <div className="config-card">
                    <h3><User size={20} /> Nombre del Negocio</h3>
                    <div className="form-group">
                      <input type="text" value={nombreNegocio} onChange={(e) => setNombreNegocio(e.target.value)} />
                      <button onClick={handleUpdateNombre} className="btn-primary" style={{marginTop: '10px'}}>Guardar</button>
                    </div>
                  </div>
                  <div className="config-card">
                    <h3><MessageSquare size={20} /> WhatsApp</h3>
                    <div className="form-group">
                      <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                      <button onClick={handleUpdateWhatsapp} className="btn-primary" style={{marginTop: '10px'}}>Guardar</button>
                    </div>
                  </div>
                  <div className="config-card">
                    <h3><Phone size={20} /> Prefijo País</h3>
                    <div className="form-group">
                      <input type="text" value={prefijoPais} onChange={(e) => setPrefijoPais(e.target.value)} />
                      <button onClick={handleUpdatePrefijo} className="btn-primary" style={{marginTop: '10px'}}>Guardar</button>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      )}

      <footer className="footer">
        <p>&copy; 2024 {nombreNegocio} - Conexión directa vía WhatsApp</p>
      </footer>
    </div>
  );
}

export default App;
