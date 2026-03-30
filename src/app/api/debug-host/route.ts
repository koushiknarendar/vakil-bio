import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const host = req.headers.get('host')
  const xForwardedHost = req.headers.get('x-forwarded-host')
  const url = req.url

  return Response.json({
    host,
    xForwardedHost,
    url,
    isManage: (host || '').startsWith('manage.'),
  })
}
