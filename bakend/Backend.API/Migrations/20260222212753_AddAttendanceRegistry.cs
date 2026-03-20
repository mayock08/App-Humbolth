using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceRegistry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "attendance_registries",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    school_period_id = table.Column<int>(type: "integer", nullable: true),
                    registry_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    teacher_id = table.Column<long>(type: "bigint", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    observation = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_attendance_registries", x => x.id);
                    table.ForeignKey(
                        name: "FK_attendance_registries_courses_course_id",
                        column: x => x.course_id,
                        principalSchema: "public",
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_attendance_registries_school_periods_school_period_id",
                        column: x => x.school_period_id,
                        principalSchema: "public",
                        principalTable: "school_periods",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_attendance_registries_teachers_teacher_id",
                        column: x => x.teacher_id,
                        principalSchema: "public",
                        principalTable: "teachers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_attendance_registries_course_id_registry_date",
                schema: "public",
                table: "attendance_registries",
                columns: new[] { "course_id", "registry_date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_attendance_registries_school_period_id",
                schema: "public",
                table: "attendance_registries",
                column: "school_period_id");

            migrationBuilder.CreateIndex(
                name: "IX_attendance_registries_teacher_id",
                schema: "public",
                table: "attendance_registries",
                column: "teacher_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "attendance_registries",
                schema: "public");
        }
    }
}
