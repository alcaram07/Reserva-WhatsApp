using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservaBackend.Data;

namespace ReservaBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfigController : ControllerBase
{
    private readonly ReservaDbContext _context;

    public ConfigController(ReservaDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetConfig()
    {
        var configs = await _context.Configuraciones.ToListAsync();
        var whatsapp = configs.FirstOrDefault(c => c.Clave == "WhatsApp")?.Valor ?? "59899097344";
        var capacidadStr = configs.FirstOrDefault(c => c.Clave == "Capacidad")?.Valor ?? "1";
        int.TryParse(capacidadStr, out int capacidad);
        
        var horarios = await _context.Horarios.OrderBy(h => h.Hora).ToListAsync();
        if (horarios.Count == 0)
        {
            var defaultHoras = new List<string> { "09:00", "10:00", "11:00", "15:00", "16:00", "17:00" };
            foreach (var h in defaultHoras) _context.Horarios.Add(new Horario { Hora = h });
            await _context.SaveChangesAsync();
            horarios = await _context.Horarios.ToListAsync();
        }

        return Ok(new { whatsapp, horarios, capacidad });
    }

    [HttpPost("capacidad")]
    public async Task<IActionResult> UpdateCapacidad([FromBody] int nuevaCapacidad)
    {
        var config = await _context.Configuraciones.FirstOrDefaultAsync(c => c.Clave == "Capacidad");
        if (config == null)
        {
            _context.Configuraciones.Add(new Configuracion { Clave = "Capacidad", Valor = nuevaCapacidad.ToString() });
        }
        else
        {
            config.Valor = nuevaCapacidad.ToString();
        }
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpPost("whatsapp")]
    public async Task<IActionResult> UpdateWhatsApp([FromBody] string nuevoNumero)
    {
        var config = await _context.Configuraciones.FirstOrDefaultAsync(c => c.Clave == "WhatsApp");
        if (config == null)
        {
            _context.Configuraciones.Add(new Configuracion { Clave = "WhatsApp", Valor = nuevoNumero });
        }
        else
        {
            config.Valor = nuevoNumero;
        }
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpPost("horarios")]
    public async Task<IActionResult> AddHorario([FromBody] string nuevaHora)
    {
        _context.Horarios.Add(new Horario { Hora = nuevaHora });
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpDelete("horarios/{id}")]
    public async Task<IActionResult> DeleteHorario(int id)
    {
        var horario = await _context.Horarios.FindAsync(id);
        if (horario == null) return NotFound();
        _context.Horarios.Remove(horario);
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }
}
