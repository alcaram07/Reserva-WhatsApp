# Etapa de compilación
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copiar csproj y restaurar dependencias
COPY ReservaBackend.csproj ./
RUN dotnet restore ReservaBackend.csproj

# Copiar el resto y compilar
COPY . ./
RUN dotnet publish ReservaBackend.csproj -c Release -o out

# Etapa de ejecución
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .

# INSTALAR LIBRERÍAS DE GLOBALIZACIÓN (Corrige el error 139 en Render)
USER root
RUN apt-get update && apt-get install -y libicu-dev && rm -rf /var/lib/apt/lists/*
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Asegurar que SQLite tenga permisos de escritura (por si se usa local)
RUN touch reservas.db && chmod 666 reservas.db

# Exponer el puerto que usa Render
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ReservaBackend.dll"]
