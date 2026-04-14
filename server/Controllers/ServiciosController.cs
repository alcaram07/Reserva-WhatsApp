using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservaBackend.Data;

namespace ReservaBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiciosController : ControllerBase
{
    private readonly ReservaDbContext _context;

    public ServiciosController(ReservaDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetServicios()
    {
        Console.WriteLine("[API] Recibida petición GET /api/servicios");
        try 
        {
            // Forzar creación si no existe por alguna razón
            _context.Database.EnsureCreated();
            
            var servicios = await _context.Servicios.ToListAsync();
            
            // Si no hay servicios, añadir los iniciales para la demo
            if (servicios.Count == 0)
            {
                Console.WriteLine("[API] Tabla Servicios vacía, añadiendo servicios iniciales...");
                var iniciales = new List<Servicio>
                {
                    new Servicio { Nombre = "Corte de Cabello", Precio = "$2000", Duracion = "45 min" },
                    new Servicio { Nombre = "Barba y Perfilado", Precio = "$1500", Duracion = "30 min" },
                    new Servicio { Nombre = "Combo Corte + Barba", Precio = "$3000", Duracion = "75 min" },
                    new Servicio { Nombre = "Tratamiento Capilar", Precio = "$2500", Duracion = "60 min" }
                };
                _context.Servicios.AddRange(iniciales);
                await _context.SaveChangesAsync();
                servicios = await _context.Servicios.ToListAsync();
            }
            
            Console.WriteLine($"[API] Enviando {servicios.Count} servicios");
            return Ok(servicios);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[API ERROR] Error en GetServicios: {ex.Message}");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CrearServicio([FromBody] Servicio nuevoServicio)
    {
        _context.Servicios.Add(nuevoServicio);
        await _context.SaveChangesAsync();
        return Ok(nuevoServicio);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> EditarServicio(int id, [FromBody] Servicio servicioActualizado)
    {
        var servicio = await _context.Servicios.FindAsync(id);
        if (servicio == null) return NotFound();

        servicio.Nombre = servicioActualizado.Nombre;
        servicio.Precio = servicioActualizado.Precio;
        servicio.Duracion = servicioActualizado.Duracion;

        await _context.SaveChangesAsync();
        return Ok(servicio);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarServicio(int id)
    {
        var servicio = await _context.Servicios.FindAsync(id);
        if (servicio == null) return NotFound();

        _context.Servicios.Remove(servicio);
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }
}
