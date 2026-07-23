import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  const password = req.headers['x-admin-password'];

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Not authorized' });
  }

  const toys = await prisma.toy.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
  });

  return res.status(200).json(toys);
}
