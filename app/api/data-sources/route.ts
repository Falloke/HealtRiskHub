// app/api/data-sources/route.ts
import prisma from "@/lib/connect-db";

type Row = {
  id: bigint;               // มาจาก bigserial → bigint ใน JS
  slug: string | null;
  name: string | null;
  agency: string | null;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  status: string | null;
  priority: number | null;  // integer -> number OK
};

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        id, slug, name, agency, logo_url, website_url, description, status, priority
      FROM public.data_source
      WHERE COALESCE(status, 'active') = 'active'
      ORDER BY priority DESC NULLS LAST, name ASC;
    `;

    // 👉 แปลง bigint ทั้งหมดให้เป็น string ก่อนส่งออก
    const jsonSafe = rows.map((r) => {
      const entry: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(r)) {
        entry[k] = typeof v === "bigint" ? v.toString() : v;
      }
      return entry;
    });

    // อย่าใช้ NextResponse.json (มันจะโยน BigInt อีกถ้าหลงเหลือ)
    return new Response(JSON.stringify(jsonSafe), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/data-sources error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to load data sources" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
