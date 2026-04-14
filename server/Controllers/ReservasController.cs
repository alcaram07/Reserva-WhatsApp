using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservaBackend.Data;

namespace ReservaBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservasController : ControllerBase
{
    private readonly ReservaDbContext _context;

    public ReservasController(ReservaDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CrearReserva([FromBody] Reserva nuevaReserva)
    {
        if (nuevaReserva == null) return BadRequest();
        
        nuevaReserva.FechaRegistro = DateTime.Now;
        _context.Reservas.Add(nuevaReserva);
        await _context.SaveChangesAsync();
        
        Console.WriteLine($"[DB] Nueva reserva guardada en SQLite: {nuevaReserva.Nombre}");
        
        return Ok(new { success = true, id = nuevaReserva.Id });
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerReservas()
    {
        var reservas = await _context.Reservas.ToListAsync();
        return Ok(reservas);
    }
}
// He eliminado la clase Reserva de aquí porque ya existe en ReservaBackend.Data
