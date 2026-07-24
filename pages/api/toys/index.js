import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const region = req.query.region;
    const toys = await prisma.toy.findMany({
      where: {
        status: 'PUBLISHED',
        ...(region && region !== 'all' ? { region: region } : {}),
      },
      include: {
        media: { where: { isPrimary: true }, take: 1 },
        collector: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(toys);
  }

  if (req.method === 'POST') {
    const name = req.body.name;
    const country = req.body.country;
    const region = req.body.region;
    const materials = req.body.materials;
    const playDescription = req.body.playDescription;
    const history = req.body.history;
    const submittedById = req.body.submittedById;
    const photoUrl = req.body.photoUrl;
    const clerkUserId = req.body.clerkUserId;

    if (!name || !country || !materials || !playDescription) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const toy = await prisma.toy.create({
      data: {
        name: name,
        country: country,
        region: region || 'unassigned',
        materials: materials,
        playDescription: playDescription,
        history: history || '',
        status: 'PENDING',
        submittedById: submittedById || null,
        submittedByClerkId: clerkUserId || null,
        media: photoUrl ? { create: [{ url: photoUrl, isPrimary: true }] } : undefined,
      },
    });

    return res.status(201).json({ toy: toy, message: 'Thanks! Your toy is pending review.' });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
