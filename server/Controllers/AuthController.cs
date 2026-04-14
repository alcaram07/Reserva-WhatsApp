using Microsoft.AspNetCore.Mvc;

namespace ReservaBackend.Controllers;

[ApiController]
[Route("api/auth")] // Ruta fija para evitar confusiones
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        Console.WriteLine($"[AUTH] Intento de login para usuario: {request?.User}");
        
        if (request?.User?.ToLower() == "admin" && request?.Password == "admin123")
        {
            Console.WriteLine("[AUTH] Login exitoso");
            return Ok(new { success = true, token = "fake-jwt-token-para-demo" });
        }
        
        Console.WriteLine("[AUTH] Credenciales incorrectas");
        return Unauthorized(new { success = false, message = "Credenciales incorrectas" });
    }
}

public class LoginRequest
{
    public string? User { get; set; }
    public string? Password { get; set; }
}
