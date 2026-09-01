import type { Business } from "./types";

const MOCK_BUSINESSES: Business[] = [
  {
    id: "mock-1",
    name: "Sunrise Bakery",
    address: "142 Oak Street",
    phone: "(555) 234-5678",
    category: "Bakery",
    rating: 4.6,
    reviewCount: 89,
    lat: 40.7128,
    lng: -74.006,
  },
  {
    id: "mock-2",
    name: "Green Leaf Cafe",
    address: "88 Maple Avenue",
    phone: "(555) 345-6789",
    category: "Cafe",
    rating: 4.3,
    reviewCount: 124,
    lat: 40.7148,
    lng: -74.008,
  },
  {
    id: "mock-3",
    name: "Metro Auto Repair",
    address: "301 Industrial Blvd",
    phone: "(555) 456-7890",
    category: "Auto Repair",
    rating: 4.8,
    reviewCount: 56,
    lat: 40.7108,
    lng: -74.004,
  },
  {
    id: "mock-4",
    name: "Bloom Flower Shop",
    address: "55 Garden Lane",
    phone: "(555) 567-8901",
    category: "Florist",
    rating: 4.5,
    reviewCount: 42,
    lat: 40.7168,
    lng: -74.01,
  },
];

type PlacesSearchResult = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    googleMapsUri?: string;
    location?: { latitude?: number; longitude?: number };
    primaryType?: string;
    rating?: number;
    userRatingCount?: number;
    businessStatus?: string;
  }>;
};

export async function searchNearbyWithoutWebsite(
  lat: number,
  lng: number,
  radiusMeters = 1500,
): Promise<{ businesses: Business[]; source: "google" | "demo" }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return {
      businesses: offsetMockBusinesses(lat, lng),
      source: "demo",
    };
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchNearby",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.nationalPhoneNumber",
          "places.websiteUri",
          "places.googleMapsUri",
          "places.location",
          "places.primaryType",
          "places.rating",
          "places.userRatingCount",
          "places.businessStatus",
        ].join(","),
      },
      body: JSON.stringify({
        includedTypes: [
          "restaurant",
          "cafe",
          "bakery",
          "store",
          "hair_salon",
          "beauty_salon",
          "car_repair",
          "florist",
          "gym",
          "dentist",
          "plumber",
          "electrician",
          "laundry",
          "pharmacy",
        ],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Places API error: ${error}`);
  }

  const data = (await response.json()) as PlacesSearchResult;

  const businesses: Business[] = (data.places ?? [])
    .filter(
      (place) =>
        place.businessStatus !== "CLOSED_PERMANENTLY" &&
        !place.websiteUri &&
        place.location?.latitude != null &&
        place.location?.longitude != null,
    )
    .map((place) => ({
      id: place.id ?? crypto.randomUUID(),
      name: place.displayName?.text ?? "Unknown",
      address: place.formattedAddress ?? "",
      phone: place.nationalPhoneNumber,
      category: formatCategory(place.primaryType),
      rating: place.rating,
      reviewCount: place.userRatingCount,
      lat: place.location!.latitude!,
      lng: place.location!.longitude!,
      mapsUrl: place.googleMapsUri,
    }));

  return { businesses, source: "google" };
}

function formatCategory(type?: string): string {
  if (!type) return "Local Business";
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function offsetMockBusinesses(lat: number, lng: number): Business[] {
  const offsets = [
    [0.002, 0.001],
    [-0.001, 0.002],
    [0.001, -0.002],
    [-0.002, -0.001],
  ];

  return MOCK_BUSINESSES.map((biz, i) => ({
    ...biz,
    lat: lat + offsets[i][0],
    lng: lng + offsets[i][1],
  }));
}
