using Microsoft.EntityFrameworkCore;
using ReservaBackend.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Agregar controladores
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// 2. Configurar SQLite
builder.Services.AddDbContext<ReservaDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

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
    dbContext.Database.EnsureCreated(); // Esto crea las tablas si no existen
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
