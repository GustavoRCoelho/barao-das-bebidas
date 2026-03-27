import { NextResponse } from "next/server";
import { limparSessao } from "@/lib/auth";

export async function POST() {
  await limparSessao();
  return new NextResponse(null, { status: 204 });
}
