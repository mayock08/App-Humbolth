using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSchoolPeriodTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "period_id",
                schema: "public",
                table: "courses",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "school_periods",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_school_periods", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_courses_period_id",
                schema: "public",
                table: "courses",
                column: "period_id");

            migrationBuilder.AddForeignKey(
                name: "FK_courses_school_periods_period_id",
                schema: "public",
                table: "courses",
                column: "period_id",
                principalSchema: "public",
                principalTable: "school_periods",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_courses_school_periods_period_id",
                schema: "public",
                table: "courses");

            migrationBuilder.DropTable(
                name: "school_periods",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_courses_period_id",
                schema: "public",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "period_id",
                schema: "public",
                table: "courses");
        }
    }
}
