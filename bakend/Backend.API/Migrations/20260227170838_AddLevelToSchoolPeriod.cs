using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLevelToSchoolPeriod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "level_id",
                schema: "public",
                table: "school_periods",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_school_periods_level_id",
                schema: "public",
                table: "school_periods",
                column: "level_id");

            migrationBuilder.AddForeignKey(
                name: "FK_school_periods_school_levels_level_id",
                schema: "public",
                table: "school_periods",
                column: "level_id",
                principalSchema: "public",
                principalTable: "school_levels",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_school_periods_school_levels_level_id",
                schema: "public",
                table: "school_periods");

            migrationBuilder.DropIndex(
                name: "IX_school_periods_level_id",
                schema: "public",
                table: "school_periods");

            migrationBuilder.DropColumn(
                name: "level_id",
                schema: "public",
                table: "school_periods");
        }
    }
}
