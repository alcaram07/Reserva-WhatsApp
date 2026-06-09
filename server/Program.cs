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

if (!string.IsNullOrEmpty(databaseUrl) && (databaseUrl.StartsWith("postgres://") || databaseUrl.StartsWith("postgresql://")))
{
    // Asegurar que use postgres:// para el parser de Uri si viene como postgresql://
    var formattedUrl = databaseUrl.Replace("postgresql://", "postgres://");
    var databaseUri = new Uri(formattedUrl);
    var userInfo = databaseUri.UserInfo.Split(':');
    var dbName = databaseUri.AbsolutePath.TrimStart('/');
    if (string.IsNullOrEmpty(dbName)) dbName = "neondb"; // Valor por defecto en Neon
    
    var npgsqlBuilder = new NpgsqlConnectionStringBuilder
    {
        Host = databaseUri.Host,
        Port = databaseUri.Port > 0 ? databaseUri.Port : 5432,
        Database = dbName,
        Username = userInfo[0],
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "",
        SslMode = SslMode.Require,
        TrustServerCertificate = true,
        Pooling = true,
        KeepAlive = 30,
        IncludeErrorDetail = true
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
    
    // Ignorar advertencia de cambios pendientes para evitar el FATAL ERROR en .NET 9
    options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

// 3. Configurar CORS (Simplificado para máxima compatibilidad)
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

// Middleware de Logs para diagnosticar en Render
app.Use(async (context, next) => {
    Console.WriteLine($"[REQ] {context.Request.Method} {context.Request.Path}");
    await next();
});

app.UseCors("AllowAll");

// --- INICIALIZACIÓN CRÍTICA DE BASE DE DATOS ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var context = services.GetRequiredService<ReservaDbContext>();
        Console.WriteLine("[BOOT] Aplicando migraciones...");
        try {
            context.Database.Migrate();
            Console.WriteLine("[BOOT] Base de datos actualizada con éxito");
        } catch (Exception) {
            Console.WriteLine("[BOOT] Migración automática falló (probablemente tablas ya existentes). Iniciando auto-reparación...");
            
            // Lógica de auto-reparación: Crear tabla de barberos manualmente si no existe
            var conn = context.Database.GetDbConnection();
            await conn.OpenAsync();
            using var cmd = conn.CreateCommand();
            
            // 1. Crear tabla Barberos si no existe
            cmd.CommandText = @"CREATE TABLE IF NOT EXISTS ""Barberos"" (
                ""Id"" SERIAL PRIMARY KEY,
                ""Nombre"" TEXT NOT NULL,
                ""Especialidad"" TEXT NOT NULL
            );";
            await cmd.ExecuteNonQueryAsync();

            // 2. Añadir columna Barbero a Reservas si no existe
            try {
                cmd.CommandText = @"ALTER TABLE ""Reservas"" ADD COLUMN ""Barbero"" TEXT DEFAULT '';";
                await cmd.ExecuteNonQueryAsync();
            } catch { /* Ignorar si la columna ya existe */ }
            
            Console.WriteLine("[BOOT] Auto-reparación completada");
        }
        Console.WriteLine("[BOOT] Base de datos lista para operar");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[FATAL ERROR] Fallo al conectar con la DB: {ex.Message}");
    }
}

app.UseCors("AllowAll");
app.UseAuthorization();

// Endpoint de salud para evitar que Render se duerma
app.MapGet("/health", () => Results.Ok("Server is alive"));

app.MapControllers();

Console.WriteLine("[BOOT] Servidor listo para recibir clientes");
app.Run();
