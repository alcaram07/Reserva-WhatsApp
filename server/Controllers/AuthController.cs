using Microsoft.AspNetCore.Mvc;

namespace ReservaBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // Esto es para la demo, usuario y contraseña fijos
        if (request.User == "admin" && request.Password == "admin123")
        {
            return Ok(new { success = true, token = "fake-jwt-token-para-demo" });
        }
        
        return Unauthorized(new { success = false, message = "Credenciales incorrectas" });
    }
}

public class LoginRequest
{
    public string User { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
