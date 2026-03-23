using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YumeTrack.Application.DTOs.Users
{
    public class MyProfileDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}