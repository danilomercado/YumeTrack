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
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("El parámetro 'query' es obligatorio.");

            try
            {
                var result = await _kitsuService.SearchAnimeAsync(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error buscando en Kitsu: {ex.Message}");
            }
        }
    }
}