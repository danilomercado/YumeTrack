FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY YumeTrack.Domain/YumeTrack.Domain.csproj YumeTrack.Domain/
COPY YumeTrack.Application/YumeTrack.Application.csproj YumeTrack.Application/
COPY YumeTrack.Infrastructure/YumeTrack.Infrastructure.csproj YumeTrack.Infrastructure/
COPY YumeTrack.API/YumeTrack.API.csproj YumeTrack.API/
RUN dotnet restore YumeTrack.API/YumeTrack.API.csproj

COPY YumeTrack.Domain/ YumeTrack.Domain/
COPY YumeTrack.Application/ YumeTrack.Application/
COPY YumeTrack.Infrastructure/ YumeTrack.Infrastructure/
COPY YumeTrack.API/ YumeTrack.API/
RUN dotnet publish YumeTrack.API/YumeTrack.API.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["dotnet", "YumeTrack.API.dll"]
