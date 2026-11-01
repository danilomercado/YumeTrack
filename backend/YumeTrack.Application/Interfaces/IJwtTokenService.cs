using System;
using System.Collections.Generic;
using System.Text;
using YumeTrack.Domain.Entities;

namespace YumeTrack.Application.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user);
        string GenerateMfaToken(User user);
        int? ValidateMfaToken(string token);
    }
}
