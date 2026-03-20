using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTeacherIdToSchoolGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "teacher_id",
                schema: "public",
                table: "school_groups",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_school_groups_teacher_id",
                schema: "public",
                table: "school_groups",
                column: "teacher_id");

            migrationBuilder.AddForeignKey(
                name: "FK_school_groups_teachers_teacher_id",
                schema: "public",
                table: "school_groups",
                column: "teacher_id",
                principalSchema: "public",
                principalTable: "teachers",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_school_groups_teachers_teacher_id",
                schema: "public",
                table: "school_groups");

            migrationBuilder.DropIndex(
                name: "IX_school_groups_teacher_id",
                schema: "public",
                table: "school_groups");

            migrationBuilder.DropColumn(
                name: "teacher_id",
                schema: "public",
                table: "school_groups");
        }
    }
}
