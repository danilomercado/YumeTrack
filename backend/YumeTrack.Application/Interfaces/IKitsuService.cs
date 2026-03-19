using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YumeTrack.Application.DTOs.Kitsu;

namespace YumeTrack.Application.Interfaces
{
    public interface IKitsuService
    {
        Task<List<KitsuAnimeDto>> SearchAnimeAsync(string query);
    }
}
