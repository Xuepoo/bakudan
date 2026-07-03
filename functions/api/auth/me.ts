export async function onRequest(context: any) {
  const cookieHeader = context.request.headers.get('Cookie') || '';
  if (!cookieHeader.includes('token=')) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Verify token here and return user info
  return new Response(JSON.stringify({ authenticated: true, user: { username: 'mock' } }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
