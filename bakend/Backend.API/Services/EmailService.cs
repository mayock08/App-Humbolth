using MailKit.Net.Smtp;
using MimeKit;
using System.IO;
using System.Threading.Tasks;

namespace Backend.API.Services
{
    public interface IEmailService
    {
        Task SendEmailWithAttachmentAsync(string toEmail, string subject, string body, string attachmentName, byte[] attachmentData, string host, int port, string user, string password);
    }

    public class EmailService : IEmailService
    {
        public async Task SendEmailWithAttachmentAsync(string toEmail, string subject, string body, string attachmentName, byte[] attachmentData, string host, int port, string user, string password)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Colegio Humbolth", user));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = body
            };

            bodyBuilder.Attachments.Add(attachmentName, attachmentData, ContentType.Parse("application/pdf"));
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            try
            {
                // Accept all SSL certificates (in case the server supports STARTTLS/SSL)
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.Auto);
                await client.AuthenticateAsync(user, password);
                await client.SendAsync(message);
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }
    }
}
