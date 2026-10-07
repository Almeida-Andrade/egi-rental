import type { NextConfig } from 'next'

const producao = process.env.NODE_ENV === 'production'

// Página estática (ISR) não tem nonce por pedido: o script inline do Next exige 'unsafe-inline'.
// O banco é lido só no servidor, então o navegador não conecta em nada fora do próprio site.
const POLITICA = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ')

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.1.74', '10.0.1.*'],
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    const seguranca = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
      ...(producao
        ? [
            { key: 'Content-Security-Policy', value: POLITICA },
            { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          ]
        : []),
    ]
    return [{ source: '/:caminho*', headers: seguranca }]
  },
}

export default nextConfig
