import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference } = req.query;

  if (!reference || typeof reference !== 'string') {
    return res.status(400).json({ error: 'Transaction reference is required' });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    // If no secret key configured, return a simulated success
    return res.status(200).json({ 
      status: true, 
      message: 'Verification skipped (no secret key configured)',
      data: { status: 'success', reference } 
    });
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 400).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Verification failed' });
  }
}
