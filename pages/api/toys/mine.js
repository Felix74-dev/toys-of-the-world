import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  const clerkUserId = req.query.clerkUserId;

  if (!clerkUserId) {
    return res.status(400).json({ error: 'Missing clerkUserId' });
  }

  const toys = await prisma.toy.findMany({
    where: { submittedByClerkId: clerkUserId },
    include: { media: { where: { isPrimary: true }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  });

  return res.status(200).json(toys);
}
