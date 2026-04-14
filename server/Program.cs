using Microsoft.EntityFrameworkCore;
using ReservaBackend.Data;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// 1. Agregar controladores
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// 2. Configurar Base de Datos (PostgreSQL para producción, SQLite para local)
var rawConnectionString = Environment.GetEnvironmentVariable("DATABASE_URL") 
                         ?? builder.Configuration.GetConnectionString("DefaultConnection");

string? connectionString = rawConnectionString;

// Si es una URL de Neon (postgres://), la traducimos al formato de .NET
if (rawConnectionString != null && rawConnectionString.StartsWith("postgres://"))
{
    var databaseUri = new Uri(rawConnectionString);
    var userInfo = databaseUri.UserInfo.Split(':');

    connectionString = $"Host={databaseUri.Host};" +
                       $"Port={databaseUri.Port};" +
                       $"Database={databaseUri.AbsolutePath.TrimStart('/')};" +
                       $"Username={userInfo[0]};" +
                       $"Password={userInfo[1]};" +
                       $"SslMode=Require;" +
                       $"Trust Server Certificate=true;";
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
    var dbContext = scope.ServiceProvider.GetRequiredService<ReservaDbContext>();
    dbContext.Database.EnsureCreated();
}

// 4. Configurar el pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
