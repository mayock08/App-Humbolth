using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseIdToActivity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "course_id",
                schema: "public",
                table: "activities",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_activities_course_id",
                schema: "public",
                table: "activities",
                column: "course_id");

            migrationBuilder.AddForeignKey(
                name: "FK_activities_courses_course_id",
                schema: "public",
                table: "activities",
                column: "course_id",
                principalSchema: "public",
                principalTable: "courses",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_activities_courses_course_id",
                schema: "public",
                table: "activities");

            migrationBuilder.DropIndex(
                name: "IX_activities_course_id",
                schema: "public",
                table: "activities");

            migrationBuilder.DropColumn(
                name: "course_id",
                schema: "public",
                table: "activities");
        }
    }
}
