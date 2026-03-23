using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using YumeTrack.Application.Interfaces;
using YumeTrack.Infrastructure.Persistence;
using YumeTrack.Infrastructure.Services;

namespace YumeTrack.Infrastructure.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserTitleService, UserTitleService>();
            services.AddScoped<FollowService>();

            services.AddHttpClient<ITranslationService, TranslationService>();
            services.AddHttpClient<IKitsuService, KitsuService>(client =>
            {
                client.BaseAddress = new Uri("https://kitsu.io/api/edge/");
            });

            return services;
        }
    }
}