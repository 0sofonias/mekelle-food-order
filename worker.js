const VEHICLE_PROFILES = {
  bicycle: "cycling-regular",
  motor: "driving-car"
};

function calculateDeliveryFee(distanceKm) {
  if (distanceKm <= 0.5) return 50;
  if (distanceKm <= 1) return 80;

  return Number((80 + (distanceKm - 1) * 40).toFixed(2));
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    const allowedOrigins = [
      "https://mekelle-food-order.sophniasebuy.workers.dev",
      "https://mekelle-food-order.pages.dev"
    ];

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };

    if (allowedOrigins.includes(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);

    if (url.pathname !== "/api/route") {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers }
      );
    }

    if (!env.HEIGIT_API_KEY) {
      return Response.json(
        { error: "Routing service is not configured." },
        { status: 503, headers }
      );
    }

    try {
      const body = await request.json();
      const { start, end, vehicle_type } = body;

      const profile = VEHICLE_PROFILES[vehicle_type];

      if (!profile) {
        return Response.json(
          { error: "Vehicle type must be bicycle or motor." },
          { status: 400, headers }
        );
      }

      const validPoint = point =>
        Array.isArray(point) &&
        point.length === 2 &&
        point.every(Number.isFinite) &&
        point[0] >= -180 &&
        point[0] <= 180 &&
        point[1] >= -90 &&
        point[1] <= 90;

      if (!validPoint(start) || !validPoint(end)) {
        return Response.json(
          { error: "Valid start and end coordinates are required." },
          { status: 400, headers }
        );
      }

      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
        {
          method: "POST",
          headers: {
            "Authorization": env.HEIGIT_API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/geo+json"
          },
          body: JSON.stringify({
            coordinates: [start, end],
            instructions: false
          }),
          signal: AbortSignal.timeout(12000)
        }
      );

      if (!response.ok) {
        console.error("Routing service status:", response.status);

        return Response.json(
          { error: "The routing service could not calculate this route." },
          { status: 502, headers }
        );
      }

      const data = await response.json();

      const feature = data.features?.[0];
      const distance = feature?.properties?.summary?.distance;
      const geometry = feature?.geometry;

      if (
        !Number.isFinite(distance) ||
        distance <= 0 ||
        geometry?.type !== "LineString" ||
        !Array.isArray(geometry.coordinates) ||
        geometry.coordinates.length < 2
      ) {
        return Response.json(
          { error: "The routing service returned an invalid route." },
          { status: 502, headers }
        );
      }

      const distanceKm = distance / 1000;

      return Response.json({
        success: true,
        distance_km: Number(distanceKm.toFixed(3)),
        delivery_fee: calculateDeliveryFee(distanceKm),
        selected_profile: profile,
        vehicle_type,
        route_geometry: geometry
      }, { headers });

    } catch (error) {
      console.error("Route calculation failed:", error);

      return Response.json(
        { error: "Unable to calculate the delivery route." },
        { status: 502, headers }
      );
    }
  }
};
