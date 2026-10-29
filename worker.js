const VEHICLE_PROFILES = {
  bicycle: "cycling-regular",
  motor: "driving-car"
};

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

      let route = null;

try {
  const response = await fetch(
    `https://api.heigit.org/openrouteservice/v2/directions/${profile}`,
    {
      method: "POST",
      headers: {
        "Authorization": env.HEIGIT_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        coordinates: [start, end],
        instructions: false
      }),
      signal: AbortSignal.timeout(12000)
    }
  );

  if (response.ok) {
    const data = await response.json();
    const distance = data.routes?.[0]?.summary?.distance;

    if (Number.isFinite(distance) && distance > 0) {
      route = { profile, distance };
    }
  }
} catch {
  // Route calculation failed.
}

if (!route) {
  return Response.json(
    {
      error: "Unable to calculate a route for the selected vehicle. Please try again."
    },
    { status: 502, headers }
  );
}

const distanceKm = route.distance / 1000;

const deliveryFee =
  distanceKm < 1
    ? 50
    : 50 + Math.ceil(distanceKm - 1) * 30;

return Response.json({
  distance_km: Number(distanceKm.toFixed(3)),
  delivery_fee: deliveryFee,
  selected_profile: route.profile,
  vehicle_type
      }, { headers });

    } catch {
      return Response.json(
        { error: "Unable to calculate the delivery route." },
        { status: 400, headers }
      );
    }
  }
};
