export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function body(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
