import { NextRequest, NextResponse } from "next/server";
import { searchNearbyWithoutWebsite } from "@/lib/places";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const radius = Number(body.radius) || 1500;

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json(
        { error: "Valid lat and lng are required" },
        { status: 400 },
      );
    }

    const result = await searchNearbyWithoutWebsite(lat, lng, radius);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
