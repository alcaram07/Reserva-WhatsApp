using Microsoft.EntityFrameworkCore;

namespace ReservaBackend.Data;

public class ReservaDbContext : DbContext
{
    public ReservaDbContext(DbContextOptions<ReservaDbContext> options) : base(options)
    {
    }

    public DbSet<Reserva> Reservas => Set<Reserva>();
    public DbSet<Servicio> Servicios => Set<Servicio>();
    public DbSet<Configuracion> Configuraciones => Set<Configuracion>();
    public DbSet<Horario> Horarios => Set<Horario>();
}

public class Reserva
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Servicio { get; set; } = string.Empty;
    public string Fecha { get; set; } = string.Empty;
    public string Hora { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
}

public class Servicio
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Precio { get; set; } = string.Empty;
    public string Duracion { get; set; } = string.Empty;
}

public class Configuracion
{
    public int Id { get; set; }
    public string Clave { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
}

public class Horario
{
    public int Id { get; set; }
    public string Hora { get; set; } = string.Empty;
}
