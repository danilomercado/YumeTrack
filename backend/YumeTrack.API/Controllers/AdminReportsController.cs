using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.API.Controllers;

// Revisión de denuncias. Solo para correos listados en Admin:Emails.
[ApiController]
[Authorize(Roles = "admin")]
[Route("api/admin/reports")]
public class AdminReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminReportsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string status = "open")
    {
        var reports = await _context.ContentReports
            .Where(r => r.Status == status)
            .OrderBy(r => r.CreatedAt)
            .Take(100)
            .Select(r => new
            {
                r.Id,
                r.TargetType,
                r.TargetId,
                r.Reason,
                r.Details,
                r.CreatedAt,
                ReporterName = r.Reporter.UserName
            })
            .ToListAsync();

        var result = new List<object>();

        foreach (var report in reports)
        {
            string? preview = null;
            string? ownerName = null;

            if (report.TargetType == "review")
            {
                var review = await _context.UserTitles
                    .Where(x => x.Id == report.TargetId)
                    .Select(x => new { x.Notes, Owner = x.User.UserName, Title = x.Title.CanonicalTitle })
                    .FirstOrDefaultAsync();

                preview = review is null ? null : $"[{review.Title}] {review.Notes}";
                ownerName = review?.Owner;
            }
            else if (report.TargetType == "comment")
            {
                var comment = await _context.ReviewComments
                    .Where(x => x.Id == report.TargetId)
                    .Select(x => new { x.Content, Owner = x.User.UserName })
                    .FirstOrDefaultAsync();

                preview = comment?.Content;
                ownerName = comment?.Owner;
            }
            else
            {
                ownerName = await _context.Users
                    .Where(x => x.Id == report.TargetId)
                    .Select(x => x.UserName)
                    .FirstOrDefaultAsync();
            }

            var sameTarget = await _context.ContentReports
                .CountAsync(x => x.TargetType == report.TargetType && x.TargetId == report.TargetId && x.Status == status);

            result.Add(new
            {
                report.Id,
                report.TargetType,
                report.TargetId,
                report.Reason,
                report.Details,
                report.CreatedAt,
                report.ReporterName,
                Preview = preview,
                OwnerName = ownerName,
                ReportsOnSameTarget = sameTarget,
                ContentExists = ownerName is not null
            });
        }

        return Ok(result);
    }

    // Cierra la denuncia sin tocar el contenido.
    [HttpPost("{id:int}/dismiss")]
    public Task<IActionResult> Dismiss(int id) => Close(id, "dismissed", removeContent: false);

    // Elimina el contenido denunciado (comentario o texto de la reseña) y cierra.
    [HttpPost("{id:int}/remove-content")]
    public Task<IActionResult> RemoveContent(int id) => Close(id, "resolved", removeContent: true);

    private async Task<IActionResult> Close(int id, string status, bool removeContent)
    {
        var report = await _context.ContentReports.FirstOrDefaultAsync(r => r.Id == id);

        if (report is null)
            return NotFound();

        if (removeContent)
        {
            if (report.TargetType == "comment")
            {
                var comment = await _context.ReviewComments.FirstOrDefaultAsync(c => c.Id == report.TargetId);

                if (comment is not null)
                {
                    var replies = await _context.ReviewComments.Where(c => c.ParentCommentId == comment.Id).ToListAsync();
                    _context.ReviewComments.RemoveRange(replies);
                    _context.ReviewComments.Remove(comment);
                }
            }
            else if (report.TargetType == "review")
            {
                var review = await _context.UserTitles.FirstOrDefaultAsync(ut => ut.Id == report.TargetId);

                if (review is not null)
                {
                    review.Notes = null;
                    review.ReviewUpdatedAt = null;
                }
            }
            else
            {
                return BadRequest(new { message = "Un usuario no se elimina desde acá." });
            }
        }

        // Todas las denuncias sobre lo mismo se cierran juntas.
        var related = await _context.ContentReports
            .Where(r => r.TargetType == report.TargetType && r.TargetId == report.TargetId && r.Status == "open")
            .ToListAsync();

        foreach (var item in related)
            item.Status = status;

        await _context.SaveChangesAsync();

        return Ok(new { closed = related.Count });
    }
}
