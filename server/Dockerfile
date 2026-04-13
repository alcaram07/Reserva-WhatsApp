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

# Asegurar que SQLite tenga permisos de escritura
RUN touch reservas.db && chmod 666 reservas.db

# Exponer el puerto que usa Render (habitualmente 8080 o 10000)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ReservaBackend.dll"]
