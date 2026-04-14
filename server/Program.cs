using Microsoft.EntityFrameworkCore;
using ReservaBackend.Data;
using Npgsql;

Console.WriteLine("[BOOT] Iniciando aplicación...");

var builder = WebApplication.CreateBuilder(args);

// 1. Agregar controladores
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// 2. Configurar Base de Datos
var rawConnectionString = Environment.GetEnvironmentVariable("DATABASE_URL") 
                         ?? builder.Configuration.GetConnectionString("DefaultConnection");

string? connectionString = rawConnectionString;

// Traducción segura de URL de Neon/Postgres a formato .NET
if (rawConnectionString != null && rawConnectionString.StartsWith("postgres://"))
{
    try 
    {
        var uri = new Uri(rawConnectionString);
        var userInfo = uri.UserInfo.Split(':');
        var npgsqlBuilder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port,
            Database = uri.AbsolutePath.TrimStart('/'),
            Username = userInfo[0],
            Password = userInfo[1],
            SslMode = SslMode.Require,
            TrustServerCertificate = true
        };
        connectionString = npgsqlBuilder.ToString();
        Console.WriteLine("[BOOT] Configurada conexión PostgreSQL (Neon)");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[BOOT ERROR] Error parseando DATABASE_URL: {ex.Message}");
    }
}

builder.Services.AddDbContext<ReservaDbContext>(options =>
{
    if (connectionString != null && (connectionString.Contains("Host=") || connectionString.Contains("Port=")))
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
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// --- FORZAR CREACIÓN DE BASE DE DATOS Y TABLAS ---
using (var scope = app.Services.CreateScope())
{
    try 
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ReservaDbContext>();
        Console.WriteLine("[BOOT] Verificando base de datos...");
        dbContext.Database.EnsureCreated();
        Console.WriteLine("[BOOT] Base de datos lista");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[BOOT ERROR] Error en base de datos: {ex.Message}");
    }
}

// 4. Configurar el pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("[BOOT] Aplicación lista para recibir peticiones");
app.Run();
