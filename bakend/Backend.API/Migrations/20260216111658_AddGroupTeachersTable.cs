using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupTeachersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "school_group_teachers",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    school_group_id = table.Column<int>(type: "integer", nullable: false),
                    teacher_id = table.Column<long>(type: "bigint", nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_school_group_teachers", x => x.id);
                    table.ForeignKey(
                        name: "FK_school_group_teachers_school_groups_school_group_id",
                        column: x => x.school_group_id,
                        principalSchema: "public",
                        principalTable: "school_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_school_group_teachers_teachers_teacher_id",
                        column: x => x.teacher_id,
                        principalSchema: "public",
                        principalTable: "teachers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_school_group_teachers_school_group_id_teacher_id",
                schema: "public",
                table: "school_group_teachers",
                columns: new[] { "school_group_id", "teacher_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_school_group_teachers_teacher_id",
                schema: "public",
                table: "school_group_teachers",
                column: "teacher_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "school_group_teachers",
                schema: "public");
        }
    }
}
