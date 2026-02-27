import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";

export async function POST() {
  try {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
    return NextResponse.json({ ok: true, message: "Migrations applied." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
