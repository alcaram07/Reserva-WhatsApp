# Etapa de compilación
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /app

# Copiar csproj y restaurar dependencias
COPY ReservaBackend.csproj ./
RUN dotnet restore ReservaBackend.csproj

# Copiar el resto y compilar
COPY . ./
RUN dotnet publish ReservaBackend.csproj -c Release -o out

# Etapa de ejecución
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app
COPY --from=build /app/out .

# Configuración de globalización para Alpine (mucho más estable en Render)
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
RUN apk add --no-cache icu-libs icu-data-full

# Asegurar que SQLite tenga permisos de escritura (fallback)
RUN touch reservas.db && chmod 666 reservas.db

# Exponer el puerto
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ReservaBackend.dll"]
