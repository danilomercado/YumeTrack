using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using YumeTrack.Application.Interfaces;
using YumeTrack.Infrastructure.Persistence;
using YumeTrack.Infrastructure.Security;
using YumeTrack.Infrastructure.Services;

namespace YumeTrack.Infrastructure.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(PostgresConnectionString.Normalize(configuration.GetConnectionString("DefaultConnection"))));

            services.AddMemoryCache(options => options.SizeLimit = 500);

            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddSingleton<SecretProtector>();
            services.AddScoped<MfaService>();
            services.AddScoped<AccountService>();
            services.AddScoped<TitleResolver>();

            // Sin Email:Host el correo solo se escribe en el log (desarrollo).
            if (!string.IsNullOrWhiteSpace(configuration["Email:Host"]))
                services.AddScoped<IEmailSender, SmtpEmailSender>();
            else
                services.AddScoped<IEmailSender, LogEmailSender>();
            services.AddScoped<IUserTitleService, UserTitleService>();
            services.AddScoped<FollowService>();
            services.AddScoped<NotificationService>();

            services.AddHttpClient<ITranslationService, TranslationService>();
            services.AddHttpClient<IKitsuService, KitsuService>(client =>
            {
                client.BaseAddress = new Uri("https://kitsu.io/api/edge/");
            });


            return services;
        }
    }
}
