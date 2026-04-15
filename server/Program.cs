using Microsoft.EntityFrameworkCore;
using ReservaBackend.Data;
using Npgsql;

Console.WriteLine("[BOOT] Iniciando aplicación...");

var builder = WebApplication.CreateBuilder(args);

// 1. Agregar controladores
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// 2. Configurar Base de Datos
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
string connectionString;

if (!string.IsNullOrEmpty(databaseUrl) && databaseUrl.StartsWith("postgres://"))
{
    // Convertir URL de Postgres a Connection String de .NET de forma profesional
    var databaseUri = new Uri(databaseUrl);
    var userInfo = databaseUri.UserInfo.Split(':');
    
    var npgsqlBuilder = new NpgsqlConnectionStringBuilder
    {
        Host = databaseUri.Host,
        Port = databaseUri.Port > 0 ? databaseUri.Port : 5432,
        Database = databaseUri.AbsolutePath.TrimStart('/'),
        Username = userInfo[0],
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "",
        SslMode = SslMode.Require,
        TrustServerCertificate = true,
        Pooling = true,
        KeepAlive = 30
    };
    connectionString = npgsqlBuilder.ToString();
    Console.WriteLine("[BOOT] Usando PostgreSQL (Neon)");
}
else
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=barberia.db";
    Console.WriteLine("[BOOT] Usando SQLite local");
}

builder.Services.AddDbContext<ReservaDbContext>(options =>
{
    if (connectionString.Contains("Host="))
    {
        options.UseNpgsql(connectionString);
    }
    else
    {
        options.UseSqlite(connectionString);
    }
});

// 3. Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// --- INICIALIZACIÓN CRÍTICA DE BASE DE DATOS ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var context = services.GetRequiredService<ReservaDbContext>();
        Console.WriteLine("[BOOT] Aplicando migraciones...");
        context.Database.Migrate();
        Console.WriteLine("[BOOT] Base de datos conectada y lista");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[FATAL ERROR] Fallo al conectar con la DB: {ex.Message}");
    }
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("[BOOT] Servidor listo para recibir clientes");
app.Run();
