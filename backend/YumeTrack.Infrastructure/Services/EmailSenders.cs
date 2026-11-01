using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using YumeTrack.Application.Interfaces;

namespace YumeTrack.Infrastructure.Services
{
    // Envío real por SMTP (cualquier proveedor: Brevo, Resend SMTP, Gmail, etc.).
    public class SmtpEmailSender : IEmailSender
    {
        private readonly IConfiguration _configuration;

        public SmtpEmailSender(IConfiguration configuration) => _configuration = configuration;

        public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
        {
            var host = _configuration["Email:Host"]!;
            var port = int.Parse(_configuration["Email:Port"] ?? "587");
            var user = _configuration["Email:User"];
            var password = _configuration["Email:Password"];
            var from = _configuration["Email:From"] ?? user ?? "no-reply@yumetrack.local";

            using var client = new SmtpClient(host, port)
            {
                EnableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true"),
                Credentials = string.IsNullOrWhiteSpace(user) ? null : new NetworkCredential(user, password)
            };

            using var message = new MailMessage(from, to, subject, htmlBody) { IsBodyHtml = true };
            await client.SendMailAsync(message, cancellationToken);
        }
    }

    // Sin SMTP configurado (desarrollo): el correo se escribe en el log para
    // poder copiar el enlace de recuperación.
    public class LogEmailSender : IEmailSender
    {
        private readonly ILogger<LogEmailSender> _logger;

        public LogEmailSender(ILogger<LogEmailSender> logger) => _logger = logger;

        public Task SendAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
        {
            _logger.LogWarning("EMAIL (sin SMTP configurado) para {To} | {Subject}\n{Body}", to, subject, htmlBody);
            return Task.CompletedTask;
        }
    }
}
