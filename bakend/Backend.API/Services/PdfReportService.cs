using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.IO;
using System.Linq;
using Backend.API.Models;

namespace Backend.API.Services
{
    public interface IPdfReportService
    {
        byte[] GenerateGradeReport(StudentGradeReportDto report, string periodName);
    }

    public class PdfReportService : IPdfReportService
    {
        public PdfReportService()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public byte[] GenerateGradeReport(StudentGradeReportDto report, string periodName)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(1, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Arial));

                    page.Header().Element(c => ComposeHeader(c, report, periodName));
                    page.Content().Element(c => ComposeContent(c, report));
                    page.Footer().Element(ComposeFooter);
                });
            });

            using var stream = new MemoryStream();
            document.GeneratePdf(stream);
            return stream.ToArray();
        }

        private void ComposeHeader(IContainer container, StudentGradeReportDto report, string periodName)
        {
            container.Column(col =>
            {
                // Top section with Logo and Titles
                col.Item().Row(row =>
                {
                    row.ConstantItem(80).Height(80).Placeholder(); // Placeholder for Logo
                    
                    row.RelativeItem().PaddingLeft(20).Column(c =>
                    {
                        c.Item().AlignCenter().Text("INSTITUTO HUMBOLDT DE SAN LUIS, A.C.").FontSize(14).SemiBold();
                        c.Item().AlignCenter().Text($"PERIODO ESCOLAR {periodName ?? "2025 - 2026"}").FontSize(12).SemiBold();
                        c.Item().AlignCenter().Text("BOLETA DE CALIFICACIONES").FontSize(12).SemiBold();
                        c.Item().AlignCenter().Text("GRUPO S1B").FontSize(10).SemiBold(); // Mock group since we don't have it in DTO
                    });
                    
                    row.ConstantItem(80); // To balance the center alignment
                });

                col.Item().PaddingTop(10).Row(row =>
                {
                    row.RelativeItem().Column(c =>
                    {
                        c.Item().Text("SECCION: SECUNDARIA").FontSize(10);
                        
                        // Parse name roughly to match the "ACEVEDO AVILA MARIA JOSE" format mock if needed
                        // Using report.StudentName directly but styled
                        c.Item().Row(r => 
                        {
                            r.AutoItem().Text("(vacio)   ").FontSize(10);
                            r.RelativeItem().Text(report.StudentName.ToUpper()).FontSize(10).SemiBold();
                        });
                    });

                    row.ConstantItem(150).AlignRight().Text($"MATRICULA: {report.Matricula}").FontSize(10).SemiBold();
                });
            });
        }

        private void ComposeContent(IContainer container, StudentGradeReportDto report)
        {
            container.PaddingVertical(10).Column(column =>
            {
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3); // MATERIA
                        columns.RelativeColumn(1); // SEP
                        columns.RelativeColumn(1); // OCT
                        columns.RelativeColumn(1); // Trim
                        columns.RelativeColumn(1); // NOV
                        columns.RelativeColumn(1); // DIC-ENE
                        columns.RelativeColumn(1); // FEB
                        columns.RelativeColumn(1); // Trim
                        columns.RelativeColumn(1); // MAR
                        columns.RelativeColumn(1); // ABR
                        columns.RelativeColumn(1); // MAY-JUN
                        columns.RelativeColumn(1); // Trim
                    });

                    table.Header(header =>
                    {
                        header.Cell().RowSpan(2).Element(HeaderStyle).AlignCenter().AlignMiddle().Text("MATERIA");
                        header.Cell().RowSpan(2).Element(HeaderStyle).AlignCenter().AlignMiddle().Text("SEP");
                        header.Cell().RowSpan(2).Element(HeaderStyle).AlignCenter().AlignMiddle().Text("OCT");
                        header.Cell().RowSpan(2).Element(HeaderStyle).AlignCenter().AlignMiddle().Text("Trim");
                        header.Cell().RowSpan(2).Element(HeaderStyle).AlignCenter().AlignMiddle().Text("NOV");
                        header.Cell().RowSpan(2).Element(HeaderStyle).AlignCenter().AlignMiddle().Text("DIC-ENE");
                        header.Cell().RowSpan(2).Element(HeaderStyle).AlignCenter().AlignMiddle().Text("FEB");
                        header.Cell().RowSpan(2).Element(HeaderStyle).AlignCenter().AlignMiddle().Text("Trim");
                        header.Cell().RowSpan(2).Element(HeaderStyle).AlignCenter().AlignMiddle().Text("MAR");
                        header.Cell().RowSpan(2).Element(HeaderStyle).AlignCenter().AlignMiddle().Text("ABR");
                        header.Cell().RowSpan(2).Element(HeaderStyle).AlignCenter().AlignMiddle().Text("MAY-JUN");
                        header.Cell().RowSpan(2).Element(HeaderStyle).AlignCenter().AlignMiddle().Text("Trim");

                        static IContainer HeaderStyle(IContainer container)
                        {
                            return container.Border(1).BorderColor(Colors.Black).PaddingVertical(5).PaddingHorizontal(2);
                        }
                    });

                    var groupedCourses = report.Courses
                        .GroupBy(c => !string.IsNullOrEmpty(c.FormativeFieldName) && c.FormativeFieldName != "N/A" ? c.FormativeFieldName : "Independiente / Extracurricular")
                        .ToList();

                    foreach (var group in groupedCourses)
                    {
                        table.Cell().ColumnSpan(12).Element(GroupHeaderStyle).Text(group.Key.ToUpper()).FontSize(9).SemiBold();

                        foreach (var course in group)
                        {
                            table.Cell().Element(CellStyleMateria).Text(course.CourseName).FontSize(9);
                            
                            // Assuming the score we have is the SEP score or just putting it in the final Trim column for now
                            // Since DTO only has one Score, let's put it in the first month
                            table.Cell().Element(CellStyle).Text($"{course.Score:F1}");
                            table.Cell().Element(CellStyle).Text("");
                            table.Cell().Element(CellStyle).Text("");
                            table.Cell().Element(CellStyle).Text("");
                            table.Cell().Element(CellStyle).Text("");
                            table.Cell().Element(CellStyle).Text("");
                            table.Cell().Element(CellStyle).Text("");
                            table.Cell().Element(CellStyle).Text("");
                            table.Cell().Element(CellStyle).Text("");
                            table.Cell().Element(CellStyle).Text("");
                            table.Cell().Element(CellStyle).Text("");
                        }
                    }

                    static IContainer CellStyleMateria(IContainer container)
                    {
                        return container.Border(1).BorderColor(Colors.Black).PaddingVertical(5).PaddingHorizontal(5).AlignLeft().AlignMiddle();
                    }
                    static IContainer CellStyle(IContainer container)
                    {
                        return container.Border(1).BorderColor(Colors.Black).PaddingVertical(5).PaddingHorizontal(2).AlignCenter().AlignMiddle();
                    }
                    static IContainer GroupHeaderStyle(IContainer container)
                    {
                        return container.Border(1).BorderColor(Colors.Black).Background(Colors.Grey.Lighten3).PaddingVertical(3).PaddingHorizontal(5).AlignLeft().AlignMiddle();
                    }

                    // Promedio Interno Row
                    table.Cell().Element(FooterCellStyle).Text("* PROMEDIO INTERNO").FontSize(9).SemiBold();
                    table.Cell().Element(FooterCellStyle).AlignCenter().Text($"{report.GeneralAverage:F1}");
                    table.Cell().Element(FooterCellStyle).Text("");
                    table.Cell().Element(FooterCellStyle).Text("");
                    table.Cell().Element(FooterCellStyle).Text("");
                    table.Cell().Element(FooterCellStyle).Text("");
                    table.Cell().Element(FooterCellStyle).Text("");
                    table.Cell().Element(FooterCellStyle).Text("");
                    table.Cell().Element(FooterCellStyle).Text("");
                    table.Cell().Element(FooterCellStyle).Text("");
                    table.Cell().Element(FooterCellStyle).Text("");
                    table.Cell().Element(FooterCellStyle).Text("");

                    static IContainer FooterCellStyle(IContainer container)
                    {
                         return container.Border(1).BorderColor(Colors.Black).PaddingVertical(5).PaddingHorizontal(5).AlignMiddle();
                    }
                });

                column.Item().PaddingTop(5).AlignCenter().Text(text =>
                {
                    text.Span("NOTA: La presente boleta es de carácter interno e informativo, ya que podrá ser ajustada de acuerdo\n" +
                              "a los lineamientos de nuestras autoridades educativas.").FontSize(9);
                });

                column.Item().PaddingTop(15).LineHorizontal(1).LineColor(Colors.Black);
                
                // Bottom signatures section
                column.Item().PaddingTop(10).Row(row =>
                {
                    row.RelativeItem(2).Column(c =>
                    {
                        c.Item().Text(report.StudentName.ToUpper()).FontSize(10);
                        c.Item().Text("FIRMA DEL PADRE O TUTOR").FontSize(10);
                        
                        c.Item().PaddingTop(10).Row(r => 
                        {
                            r.RelativeItem().Column(col => {
                                col.Item().PaddingBottom(5).Text("1 SEPTIEMBRE  _______________________").FontSize(8);
                                col.Item().PaddingBottom(5).Text("2 OCTUBRE     _______________________").FontSize(8);
                                col.Item().PaddingBottom(5).Text("3 NOVIEMBRE   _______________________").FontSize(8);
                                col.Item().PaddingBottom(5).Text("4 DICIEMBRE   _______________________").FontSize(8);
                                col.Item().PaddingBottom(5).Text("5 ENERO       _______________________").FontSize(8);
                            });
                            r.RelativeItem().Column(col => {
                                col.Item().PaddingBottom(5).Text("6 FEBRERO     _______________________").FontSize(8);
                                col.Item().PaddingBottom(5).Text("7 MARZO       _______________________").FontSize(8);
                                col.Item().PaddingBottom(5).Text("8 ABRIL       _______________________").FontSize(8);
                                col.Item().PaddingBottom(5).Text("9 MAYO        _______________________").FontSize(8);
                                col.Item().PaddingBottom(5).Text("10 JUNIO      _______________________").FontSize(8);
                            });
                        });
                    });

                    row.RelativeItem(1).Column(c =>
                    {
                        c.Item().AlignRight().Text("FAVOR DE REGRESAR LA SECCION DE FIRMAS AL TITULAR DEL GRUPO").FontSize(8);
                        c.Item().PaddingTop(40).AlignRight().Text("TITULAR DEL GRUPO  ____________________________________").FontSize(8);
                    });
                });
            });
        }

        private void ComposeFooter(IContainer container)
        {
            container.Text("");
        }
    }
}
