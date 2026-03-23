using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.ComponentModel.DataAnnotations;

namespace YumeTrack.Application.DTOs.Users
{
    public class UpdateMyProfileDto
    {
        [MaxLength(300)]
        public string? Bio { get; set; }
    }
}
