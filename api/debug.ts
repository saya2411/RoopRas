import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const keys = [
    process.env.VITE_API_KEY_1,
    process.env.VITE_API_KEY_2,
    process.env.VITE_API_KEY_3,
    process.env.VITE_API_KEY,
    process.env.API_KEY,
    process.env.GEMINI_API_KEY
  ].map((k, i) => ({
    name: `Key_${i + 1}`,
    present: !!k,
    length: k?.length || 0
  }));
  
  return res.json({ 
    env: process.env.NODE_ENV,
    keysFound: keys.filter(k => k.present).length,
    details: keys
  });
}
