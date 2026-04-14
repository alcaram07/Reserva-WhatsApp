using Microsoft.EntityFrameworkCore;
using ReservaBackend.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Agregar controladores
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// 2. Configurar Base de Datos (PostgreSQL para producción, SQLite para local)
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") 
                      ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ReservaDbContext>(options =>
{
    if (connectionString != null && connectionString.Contains("postgres://") || connectionString != null && connectionString.Contains("Host="))
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
