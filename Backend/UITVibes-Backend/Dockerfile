# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["UITVibes-Backend/UITVibes-Backend.csproj", "UITVibes-Backend/"]
RUN dotnet restore "UITVibes-Backend/UITVibes-Backend.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/UITVibes-Backend"
RUN dotnet build "UITVibes-Backend.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "UITVibes-Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "UITVibes-Backend.dll"]