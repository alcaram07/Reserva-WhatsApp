using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservaBackend.Data;

namespace ReservaBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BarberosController : ControllerBase
{
    private readonly ReservaDbContext _context;

    public BarberosController(ReservaDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBarberos()
    {
        var barberos = await _context.Barberos.ToListAsync();
        return Ok(barberos);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBarbero([FromBody] Barbero barbero)
    {
        _context.Barberos.Add(barbero);
        await _context.SaveChangesAsync();
        return Ok(barbero);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBarbero(int id)
    {
        var barbero = await _context.Barberos.FindAsync(id);
        if (barbero == null) return NotFound();
        _context.Barberos.Remove(barbero);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
