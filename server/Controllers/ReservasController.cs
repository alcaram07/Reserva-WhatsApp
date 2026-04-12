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
        
        Console.WriteLine($"[DB] Nueva reserva guardada en SQL Server: {nuevaReserva.Nombre}");
        
        return Ok(new { success = true, id = nuevaReserva.Id });
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerReservas()
    {
        var reservas = await _context.Reservas.ToListAsync();
        return Ok(reservas);
    }
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
