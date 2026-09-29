// Vercel serverless function counting resume downloads in Upstash Redis
// Setup: KV_REST_API_URL and KV_REST_API_TOKEN, added to the Vercel project by the
// Upstash Redis integration (Production and Preview)
//
// POST adds one download and answers with the new total. GET only reads the total,
// for checking the number by opening the URL (?read=true works too, and changes
// nothing). Both answer { count: N }.

import { Redis } from '@upstash/redis'

// One count per Vercel environment (resume_downloads_total:production, :preview), so
// clicks on a preview deployment never add to production's count. Vercel sets
// VERCEL_ENV itself; outside Vercel it's unset, and counts as development.
const COUNTER_KEY_PREFIX = 'resume_downloads_total'

// Each request to Upstash gives up after this long, so a hung one can't hold the function
// open. A signal made by a function, not a plain AbortSignal: on a timeout the client then
// throws, instead of answering with "Aborted" as if it were the result.
const REDIS_TIMEOUT_MS = 5000

export default async function handler(req, res) {
  // The count changes with every download, so nothing caches it: not browsers, not the CDN
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    return res.status(503).json({ error: 'The download counter is not configured' })
  }

  const key = `${COUNTER_KEY_PREFIX}:${process.env.VERCEL_ENV || 'development'}`

  try {
    const redis = new Redis({ url, token, signal: () => AbortSignal.timeout(REDIS_TIMEOUT_MS) })
    const count = req.method === 'POST' ? await redis.incr(key) : await redis.get(key)
    return res.status(200).json({ count: Number(count) || 0 })
  } catch (err) {
    console.error('Resume download counter error:', err)
    return res.status(502).json({ error: 'The download counter is unavailable' })
  }
}
