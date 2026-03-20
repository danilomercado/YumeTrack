using Microsoft.AspNetCore.Mvc;
using YumeTrack.Application.Interfaces;

namespace YumeTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TitlesController : ControllerBase
    {
        private readonly IKitsuService _kitsuService;
        private readonly ITranslationService _translationService;

        public TitlesController(
            IKitsuService kitsuService,
            ITranslationService translationService)
        {
            _kitsuService = kitsuService;
            _translationService = translationService;
        }

        [HttpGet("anime/{id}")]
        public async Task<IActionResult> GetAnimeById(string id, CancellationToken cancellationToken)
        {
            var anime = await _kitsuService.GetAnimeByIdAsync(id, cancellationToken);

            if (anime is null)
                return NotFound();

            return Ok(anime);
        }
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            var result = await _kitsuService.SearchTitlesAsync(query);
            return Ok(result);
        }
    }
}