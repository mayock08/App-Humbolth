using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFormativeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "formative_field_id",
                schema: "public",
                table: "courses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_complementary",
                schema: "public",
                table: "courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "formative_fields",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_official = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_formative_fields", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_courses_formative_field_id",
                schema: "public",
                table: "courses",
                column: "formative_field_id");

            migrationBuilder.AddForeignKey(
                name: "FK_courses_formative_fields_formative_field_id",
                schema: "public",
                table: "courses",
                column: "formative_field_id",
                principalSchema: "public",
                principalTable: "formative_fields",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_courses_formative_fields_formative_field_id",
                schema: "public",
                table: "courses");

            migrationBuilder.DropTable(
                name: "formative_fields",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_courses_formative_field_id",
                schema: "public",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "formative_field_id",
                schema: "public",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "is_complementary",
                schema: "public",
                table: "courses");
        }
    }
}
