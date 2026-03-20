using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.API.Migrations
{
    public partial class UpdateQuestionPoolsMateriaImages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // IF missing in DB, we create it.
            migrationBuilder.CreateTable(
                name: "question_pools",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    teacher_id = table.Column<long>(type: "bigint", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    course_id = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_question_pools", x => x.id);
                    table.ForeignKey(
                        name: "FK_question_pools_courses_course_id",
                        column: x => x.course_id,
                        principalSchema: "public",
                        principalTable: "courses",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_question_pools_teachers_teacher_id",
                        column: x => x.teacher_id,
                        principalSchema: "public",
                        principalTable: "teachers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pool_questions",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    pool_id = table.Column<long>(type: "bigint", nullable: false),
                    question_text = table.Column<string>(type: "text", nullable: false),
                    question_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    options_json = table.Column<string>(type: "jsonb", nullable: true),
                    correct_answer_json = table.Column<string>(type: "jsonb", nullable: true),
                    image_url = table.Column<string>(type: "text", nullable: true),
                    points = table.Column<decimal>(type: "numeric", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pool_questions", x => x.id);
                    table.ForeignKey(
                        name: "FK_pool_questions_question_pools_pool_id",
                        column: x => x.pool_id,
                        principalSchema: "public",
                        principalTable: "question_pools",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_pool_questions_pool_id",
                schema: "public",
                table: "pool_questions",
                column: "pool_id");

            migrationBuilder.CreateIndex(
                name: "IX_question_pools_course_id",
                schema: "public",
                table: "question_pools",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "IX_question_pools_teacher_id",
                schema: "public",
                table: "question_pools",
                column: "teacher_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "pool_questions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "question_pools",
                schema: "public");
        }
    }
}
