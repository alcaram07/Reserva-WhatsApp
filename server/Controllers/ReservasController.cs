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

        // 1. Obtener capacidad configurada
        var capacidadStr = await _context.Configuraciones
            .Where(c => c.Clave == "Capacidad")
            .Select(c => c.Valor)
            .FirstOrDefaultAsync() ?? "1";
        int.TryParse(capacidadStr, out int capacidad);

        // 2. Contar reservas existentes para esa fecha y hora
        var ocupados = await _context.Reservas
            .CountAsync(r => r.Fecha == nuevaReserva.Fecha && r.Hora == nuevaReserva.Hora);

        if (ocupados >= capacidad)
        {
            return BadRequest(new { error = "Lo sentimos, este horario acaba de completarse." });
        }
        
        nuevaReserva.FechaRegistro = DateTime.Now;
        _context.Reservas.Add(nuevaReserva);
        await _context.SaveChangesAsync();
        
        Console.WriteLine($"[DB] Nueva reserva guardada: {nuevaReserva.Nombre}");
        
        return Ok(new { success = true, id = nuevaReserva.Id });
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerReservas()
    {
        var reservas = await _context.Reservas.ToListAsync();
        return Ok(reservas);
    }

    [HttpGet("ocupacion")]
    public async Task<IActionResult> GetOcupacion([FromQuery] string fecha)
    {
        var ocupacion = await _context.Reservas
            .Where(r => r.Fecha == fecha)
            .GroupBy(r => r.Hora)
            .Select(g => new { Hora = g.Key, Cantidad = g.Count() })
            .ToListAsync();
            
        return Ok(ocupacion);
    }
}
// He eliminado la clase Reserva de aquí porque ya existe en ReservaBackend.Data
