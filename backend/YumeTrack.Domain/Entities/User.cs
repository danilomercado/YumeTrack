using System;
using System.Collections.Generic;
using System.Text;

namespace YumeTrack.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<UserTitle> UserTitles { get; set; } = new List<UserTitle>();
    }
}
