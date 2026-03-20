using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseTasksAndSubmissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "course_tasks",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    submission_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    max_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    due_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    checklist_items_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_course_tasks", x => x.id);
                    table.ForeignKey(
                        name: "FK_course_tasks_courses_course_id",
                        column: x => x.course_id,
                        principalSchema: "public",
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "task_submissions",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_task_id = table.Column<long>(type: "bigint", nullable: false),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    submission_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    text_response = table.Column<string>(type: "text", nullable: true),
                    file_url = table.Column<string>(type: "text", nullable: true),
                    checklist_responses_json = table.Column<string>(type: "jsonb", nullable: true),
                    grade = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    teacher_feedback = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_task_submissions", x => x.id);
                    table.ForeignKey(
                        name: "FK_task_submissions_course_tasks_course_task_id",
                        column: x => x.course_task_id,
                        principalSchema: "public",
                        principalTable: "course_tasks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_task_submissions_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "public",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_course_tasks_course_id",
                schema: "public",
                table: "course_tasks",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "IX_task_submissions_course_task_id",
                schema: "public",
                table: "task_submissions",
                column: "course_task_id");

            migrationBuilder.CreateIndex(
                name: "IX_task_submissions_student_id",
                schema: "public",
                table: "task_submissions",
                column: "student_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "task_submissions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "course_tasks",
                schema: "public");
        }
    }
}
