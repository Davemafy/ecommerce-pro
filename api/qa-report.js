const QA_KEY = 'qa-79c4f6';

export default async function handler(req, res) {
  if (req.query?.key !== QA_KEY) return res.status(404).json({ success: false });
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  console.log('[COMMERCEPRO_QA_REPORT]', JSON.stringify(req.body || {}));
  return res.status(204).end();
}
