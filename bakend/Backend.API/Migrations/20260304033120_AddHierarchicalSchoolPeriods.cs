using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.API.Migrations
{
    /// <inheritdoc />
    public partial class AddHierarchicalSchoolPeriods : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "period_id",
                schema: "public",
                table: "student_course_evaluations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "plan_studing_id",
                schema: "public",
                table: "student_course_evaluations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "parent_period_id",
                schema: "public",
                table: "school_periods",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "period_type",
                schema: "public",
                table: "school_periods",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "weight",
                schema: "public",
                table: "school_periods",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "period_id",
                schema: "public",
                table: "iq_tests",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "period_id",
                schema: "public",
                table: "course_tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "period_id",
                schema: "public",
                table: "activities",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "plan_studings",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    period_id = table.Column<int>(type: "integer", nullable: false),
                    attachment_url = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_plan_studings", x => x.id);
                    table.ForeignKey(
                        name: "FK_plan_studings_school_periods_period_id",
                        column: x => x.period_id,
                        principalSchema: "public",
                        principalTable: "school_periods",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "plan_studing_courses",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    plan_studing_id = table.Column<int>(type: "integer", nullable: false),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    is_official_sep = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_plan_studing_courses", x => x.id);
                    table.ForeignKey(
                        name: "FK_plan_studing_courses_courses_course_id",
                        column: x => x.course_id,
                        principalSchema: "public",
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_plan_studing_courses_plan_studings_plan_studing_id",
                        column: x => x.plan_studing_id,
                        principalSchema: "public",
                        principalTable: "plan_studings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_student_course_evaluations_period_id",
                schema: "public",
                table: "student_course_evaluations",
                column: "period_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_course_evaluations_plan_studing_id",
                schema: "public",
                table: "student_course_evaluations",
                column: "plan_studing_id");

            migrationBuilder.CreateIndex(
                name: "IX_school_periods_parent_period_id",
                schema: "public",
                table: "school_periods",
                column: "parent_period_id");

            migrationBuilder.CreateIndex(
                name: "IX_iq_tests_period_id",
                schema: "public",
                table: "iq_tests",
                column: "period_id");

            migrationBuilder.CreateIndex(
                name: "IX_course_tasks_period_id",
                schema: "public",
                table: "course_tasks",
                column: "period_id");

            migrationBuilder.CreateIndex(
                name: "IX_activities_period_id",
                schema: "public",
                table: "activities",
                column: "period_id");

            migrationBuilder.CreateIndex(
                name: "IX_plan_studing_courses_course_id",
                schema: "public",
                table: "plan_studing_courses",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "IX_plan_studing_courses_plan_studing_id",
                schema: "public",
                table: "plan_studing_courses",
                column: "plan_studing_id");

            migrationBuilder.CreateIndex(
                name: "IX_plan_studings_period_id",
                schema: "public",
                table: "plan_studings",
                column: "period_id");

            migrationBuilder.AddForeignKey(
                name: "FK_activities_school_periods_period_id",
                schema: "public",
                table: "activities",
                column: "period_id",
                principalSchema: "public",
                principalTable: "school_periods",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_course_tasks_school_periods_period_id",
                schema: "public",
                table: "course_tasks",
                column: "period_id",
                principalSchema: "public",
                principalTable: "school_periods",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_iq_tests_school_periods_period_id",
                schema: "public",
                table: "iq_tests",
                column: "period_id",
                principalSchema: "public",
                principalTable: "school_periods",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_school_periods_school_periods_parent_period_id",
                schema: "public",
                table: "school_periods",
                column: "parent_period_id",
                principalSchema: "public",
                principalTable: "school_periods",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_student_course_evaluations_plan_studings_plan_studing_id",
                schema: "public",
                table: "student_course_evaluations",
                column: "plan_studing_id",
                principalSchema: "public",
                principalTable: "plan_studings",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_student_course_evaluations_school_periods_period_id",
                schema: "public",
                table: "student_course_evaluations",
                column: "period_id",
                principalSchema: "public",
                principalTable: "school_periods",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_activities_school_periods_period_id",
                schema: "public",
                table: "activities");

            migrationBuilder.DropForeignKey(
                name: "FK_course_tasks_school_periods_period_id",
                schema: "public",
                table: "course_tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_iq_tests_school_periods_period_id",
                schema: "public",
                table: "iq_tests");

            migrationBuilder.DropForeignKey(
                name: "FK_school_periods_school_periods_parent_period_id",
                schema: "public",
                table: "school_periods");

            migrationBuilder.DropForeignKey(
                name: "FK_student_course_evaluations_plan_studings_plan_studing_id",
                schema: "public",
                table: "student_course_evaluations");

            migrationBuilder.DropForeignKey(
                name: "FK_student_course_evaluations_school_periods_period_id",
                schema: "public",
                table: "student_course_evaluations");

            migrationBuilder.DropTable(
                name: "plan_studing_courses",
                schema: "public");

            migrationBuilder.DropTable(
                name: "plan_studings",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_student_course_evaluations_period_id",
                schema: "public",
                table: "student_course_evaluations");

            migrationBuilder.DropIndex(
                name: "IX_student_course_evaluations_plan_studing_id",
                schema: "public",
                table: "student_course_evaluations");

            migrationBuilder.DropIndex(
                name: "IX_school_periods_parent_period_id",
                schema: "public",
                table: "school_periods");

            migrationBuilder.DropIndex(
                name: "IX_iq_tests_period_id",
                schema: "public",
                table: "iq_tests");

            migrationBuilder.DropIndex(
                name: "IX_course_tasks_period_id",
                schema: "public",
                table: "course_tasks");

            migrationBuilder.DropIndex(
                name: "IX_activities_period_id",
                schema: "public",
                table: "activities");

            migrationBuilder.DropColumn(
                name: "period_id",
                schema: "public",
                table: "student_course_evaluations");

            migrationBuilder.DropColumn(
                name: "plan_studing_id",
                schema: "public",
                table: "student_course_evaluations");

            migrationBuilder.DropColumn(
                name: "parent_period_id",
                schema: "public",
                table: "school_periods");

            migrationBuilder.DropColumn(
                name: "period_type",
                schema: "public",
                table: "school_periods");

            migrationBuilder.DropColumn(
                name: "weight",
                schema: "public",
                table: "school_periods");

            migrationBuilder.DropColumn(
                name: "period_id",
                schema: "public",
                table: "iq_tests");

            migrationBuilder.DropColumn(
                name: "period_id",
                schema: "public",
                table: "course_tasks");

            migrationBuilder.DropColumn(
                name: "period_id",
                schema: "public",
                table: "activities");
        }
    }
}
