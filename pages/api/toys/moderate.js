import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const toyId = req.body.toyId;
  const decision = req.body.decision;

  if (decision !== 'PUBLISHED' && decision !== 'REJECTED') {
    return res.status(400).json({ error: 'decision must be PUBLISHED or REJECTED' });
  }

  const toy = await prisma.toy.update({
    where: { id: toyId },
    data: { status: decision },
  });

  return res.status(200).json(toy);
}
