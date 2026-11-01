using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;
using YumeTrack.Infrastructure.Services;

namespace YumeTrack.API.Controllers;

[ApiController]
[Route("api/lists")]
[EnableRateLimiting("social")]
public class ListsController : ControllerBase
{
    private const int MaxListsPerUser = 50;
    private const int MaxItemsPerList = 100;

    private readonly AppDbContext _context;
    private readonly TitleResolver _titles;

    public ListsController(AppDbContext context, TitleResolver titles)
    {
        _context = context;
        _titles = titles;
    }

    private int? CurrentUserId =>
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;

    private int RequireUserId() => CurrentUserId ?? throw new UnauthorizedAccessException("Token inválido.");

    private static string NewToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(8))
            .Replace('+', 'a').Replace('/', 'b').TrimEnd('=').ToLowerInvariant();

    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> Mine()
    {
        var me = RequireUserId();

        var lists = await _context.UserLists
            .Where(l => l.UserId == me)
            .OrderByDescending(l => l.UpdatedAt)
            .Select(l => new
            {
                l.Token,
                l.Title,
                l.Description,
                l.IsPublic,
                l.UpdatedAt,
                ItemsCount = l.Items.Count(),
                Covers = l.Items
                    .OrderBy(i => i.Position)
                    .Select(i => i.Title.PosterImageUrl)
                    .Take(4)
                    .ToList()
            })
            .ToListAsync();

        return Ok(lists);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ListInputDto dto)
    {
        var me = RequireUserId();

        if (await _context.UserLists.CountAsync(l => l.UserId == me) >= MaxListsPerUser)
            return BadRequest(new { message = "Llegaste al máximo de listas." });

        var list = new UserList
        {
            UserId = me,
            Token = NewToken(),
            Title = dto.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            IsPublic = dto.IsPublic
        };

        _context.UserLists.Add(list);
        await _context.SaveChangesAsync();

        return Ok(new { list.Token });
    }

    // Pública si IsPublic; si no, solo la ve su dueño.
    [HttpGet("{token}")]
    public async Task<IActionResult> Get(string token)
    {
        var me = CurrentUserId;

        var list = await _context.UserLists
            .Where(l => l.Token == token)
            .Select(l => new
            {
                l.Id,
                l.UserId,
                l.Token,
                l.Title,
                l.Description,
                l.IsPublic,
                OwnerName = l.User.UserName,
                l.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (list is null || (!list.IsPublic && list.UserId != me))
            return NotFound(new { message = "Esta lista no existe o es privada." });

        var items = await _context.UserListItems
            .Where(i => i.ListId == list.Id)
            .OrderBy(i => i.Position)
            .Select(i => new
            {
                i.Id,
                KitsuId = i.Title.ExternalId,
                i.Title.CanonicalTitle,
                i.Title.PosterImageUrl,
                i.Title.MediaType,
                i.Note
            })
            .ToListAsync();

        return Ok(new
        {
            list.Token,
            list.Title,
            list.Description,
            list.IsPublic,
            list.OwnerName,
            list.UpdatedAt,
            IsOwner = me.HasValue && list.UserId == me.Value,
            Items = items
        });
    }

    [Authorize]
    [HttpPut("{token}")]
    public async Task<IActionResult> Update(string token, [FromBody] ListInputDto dto)
    {
        var list = await OwnedAsync(token);
        if (list is null) return NotFound();

        list.Title = dto.Title.Trim();
        list.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        list.IsPublic = dto.IsPublic;
        list.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok();
    }

    [Authorize]
    [HttpDelete("{token}")]
    public async Task<IActionResult> Delete(string token)
    {
        var list = await OwnedAsync(token);
        if (list is null) return NotFound();

        _context.UserLists.Remove(list);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpPost("{token}/items")]
    public async Task<IActionResult> AddItem(string token, [FromBody] ListItemInputDto dto)
    {
        var list = await OwnedAsync(token);
        if (list is null) return NotFound();

        if (await _context.UserListItems.CountAsync(i => i.ListId == list.Id) >= MaxItemsPerList)
            return BadRequest(new { message = "La lista llegó al máximo de títulos." });

        Title title;
        try
        {
            title = await _titles.GetOrCreateAsync(dto.KitsuId, dto.MediaType);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        if (await _context.UserListItems.AnyAsync(i => i.ListId == list.Id && i.TitleId == title.Id))
            return BadRequest(new { message = "Ese título ya está en la lista." });

        var position = await _context.UserListItems
            .Where(i => i.ListId == list.Id)
            .Select(i => (int?)i.Position)
            .MaxAsync() ?? -1;

        _context.UserListItems.Add(new UserListItem
        {
            ListId = list.Id,
            TitleId = title.Id,
            Position = position + 1,
            Note = string.IsNullOrWhiteSpace(dto.Note) ? null : dto.Note.Trim()
        });

        list.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Agregado a la lista." });
    }

    [Authorize]
    [HttpDelete("{token}/items/{itemId:int}")]
    public async Task<IActionResult> RemoveItem(string token, int itemId)
    {
        var list = await OwnedAsync(token);
        if (list is null) return NotFound();

        var item = await _context.UserListItems.FirstOrDefaultAsync(i => i.Id == itemId && i.ListId == list.Id);
        if (item is null) return NotFound();

        _context.UserListItems.Remove(item);
        list.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<UserList?> OwnedAsync(string token)
    {
        var me = RequireUserId();
        return await _context.UserLists.FirstOrDefaultAsync(l => l.Token == token && l.UserId == me);
    }
}

public class ListInputDto
{
    [Required, MaxLength(80)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Description { get; set; }

    public bool IsPublic { get; set; } = true;
}

public class ListItemInputDto
{
    public int KitsuId { get; set; }

    [Required]
    public string MediaType { get; set; } = "anime";

    [MaxLength(200)]
    public string? Note { get; set; }
}
