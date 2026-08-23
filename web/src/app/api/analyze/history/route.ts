import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/history — returns the 50 most recently analyzed reviews.
export async function GET() {
  try {
    const pool = await getPool();
    const { rows } = await pool.query(
      `SELECT id, review_text, product_name, product_type, prediction, label,
              confidence, risk_level, created_at
       FROM analyzed_reviews
       ORDER BY created_at DESC
       LIMIT 50`
    );
    return NextResponse.json({ reviews: rows });
  } catch (err) {
    console.error("Failed to fetch history:", err);
    return NextResponse.json({ error: "Could not load history" }, { status: 500 });
  }
}
