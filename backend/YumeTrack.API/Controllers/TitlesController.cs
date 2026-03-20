using Microsoft.AspNetCore.Mvc;
using YumeTrack.Application.Interfaces;

namespace YumeTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TitlesController : ControllerBase
    {
        private readonly IKitsuService _kitsuService;

        public TitlesController(IKitsuService kitsuService)
        {
            _kitsuService = kitsuService;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchTitles([FromQuery] string query, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("El parámetro query es obligatorio.");

            var results = await _kitsuService.SearchTitlesAsync(query);
            return Ok(results);
        }

        [HttpGet("anime/{id}")]
        public async Task<IActionResult> GetAnimeById(string id, CancellationToken cancellationToken)
        {
            var anime = await _kitsuService.GetAnimeByIdAsync(id, cancellationToken);

            if (anime is null)
                return NotFound();

            return Ok(anime);
        }

        [HttpGet("manga/{id}")]
        public async Task<IActionResult> GetMangaById(string id, CancellationToken cancellationToken)
        {
            var manga = await _kitsuService.GetMangaByIdAsync(id, cancellationToken);

            if (manga is null)
                return NotFound();

            return Ok(manga);
        }

        [HttpGet("trending")]
        public async Task<IActionResult> GetTrending([FromQuery] int limit = 12, CancellationToken cancellationToken = default)
        {
            var results = await _kitsuService.GetTrendingAnimeAsync(limit, cancellationToken);
            return Ok(results);
        }

        [HttpGet("trending-manga")]
        public async Task<IActionResult> GetTrendingManga([FromQuery] int limit = 12, CancellationToken cancellationToken = default)
        {
            var results = await _kitsuService.GetTrendingMangaAsync(limit, cancellationToken);
            return Ok(results);
        }

        [HttpGet("catalog")]
        public async Task<IActionResult> GetCatalog(
            [FromQuery] int limit = 20,
            [FromQuery] int offset = 0,
            CancellationToken cancellationToken = default)
        {
            var results = await _kitsuService.GetAnimeCatalogAsync(limit, offset, cancellationToken);
            return Ok(results);
        }

        [HttpGet("catalog-manga")]
        public async Task<IActionResult> GetMangaCatalog(
            [FromQuery] int limit = 20,
            [FromQuery] int offset = 0,
            CancellationToken cancellationToken = default)
        {
            var results = await _kitsuService.GetMangaCatalogAsync(limit, offset, cancellationToken);
            return Ok(results);
        }
    }
}