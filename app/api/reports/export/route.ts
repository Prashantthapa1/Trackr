/**
 * app/api/reports/export/route.ts
 *
 * Exports expense data as CSV (all users) or PDF (Pro only). The CSV is
 * built manually as a string to avoid extra dependencies. The PDF uses
 * jspdf + jspdf-autotable to render a clean table.
 *
 * Query params:
 * - ?format=csv or ?format=pdf
 * - ?from=2026-01-01&to=2026-02-01 (optional date range)
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const format = searchParams.get("format") ?? "csv";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // PDF is Pro-only
  if (format === "pdf" && user.plan === "FREE") {
    return NextResponse.json(
      { error: "PDF export requires a Pro plan" },
      { status: 403 }
    );
  }

  // Build date filter
  const dateFilter: Record<string, Date> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);

  const expenses = await prisma.expense.findMany({
    where: {
      userId: user.id,
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
    },
    orderBy: { date: "desc" },
  });

  if (format === "pdf") {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Trackr — Expense Report", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`User: ${user.email}`, 14, 36);

    // Table
    const tableData = expenses.map((e) => [
      e.date.toLocaleDateString(),
      e.category,
      e.description ?? "—",
      formatCurrency(e.amount, e.currency),
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["Date", "Category", "Description", "Amount"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
    });

    // Total
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const docAny = doc as unknown as { lastAutoTable?: { finalY?: number } };
    const finalY = docAny.lastAutoTable?.finalY ?? 80;
    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(total, "NPR")}`, 14, finalY + 10);

    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="trackr-expenses-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  }

  // CSV export
  const csvHeader = "Date,Category,Description,Amount,Currency\n";
  const csvRows = expenses
    .map((e) => {
      const date = e.date.toISOString().split("T")[0];
      const desc = (e.description ?? "").replace(/,/g, ";").replace(/"/g, '""');
      return `${date},"${e.category}","${desc}",${e.amount},${e.currency}`;
    })
    .join("\n");

  const csv = csvHeader + csvRows;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="trackr-expenses-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
