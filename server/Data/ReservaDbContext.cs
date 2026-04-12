using Microsoft.EntityFrameworkCore;
using ReservaBackend.Controllers; // Para usar la clase Reserva

namespace ReservaBackend.Data;

public class ReservaDbContext : DbContext
{
    public ReservaDbContext(DbContextOptions<ReservaDbContext> options) : base(options)
    {
    }

    public DbSet<Reserva> Reservas => Set<Reserva>();
}
