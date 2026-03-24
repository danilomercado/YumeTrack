using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YumeTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewUpdatedAtToUserTitles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewUpdatedAt",
                table: "UserTitles",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReviewUpdatedAt",
                table: "UserTitles");
        }
    }
}
