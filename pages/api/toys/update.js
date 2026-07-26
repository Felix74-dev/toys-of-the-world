import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  const password = req.headers['x-admin-password'];

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Not authorized' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const toyId = req.body.toyId;
  const name = req.body.name;
  const country = req.body.country;
  const materials = req.body.materials;
  const playDescription = req.body.playDescription;
  const history = req.body.history;
  const photoUrl1 = req.body.photoUrl1;
  const photoUrl2 = req.body.photoUrl2;
  const photoUrl3 = req.body.photoUrl3;
  const civilisationCulture = req.body.civilisationCulture;
  const datePeriod = req.body.datePeriod;
  const evidenceStatus = req.body.evidenceStatus;
  const description = req.body.description;
  const culturalSignificance = req.body.culturalSignificance;
  const interestingFacts = req.body.interestingFacts;
  const museumReferences = req.body.museumReferences;
  const imageReferences = req.body.imageReferences;

  const toy = await prisma.toy.update({
    where: { id: toyId },
    data: {
      name: name,
      country: country,
      materials: materials,
      playDescription: playDescription,
      history: history,
      civilisationCulture: civilisationCulture,
      datePeriod: datePeriod,
      evidenceStatus: evidenceStatus,
      description: description,
      culturalSignificance: culturalSignificance,
      interestingFacts: interestingFacts,
      museumReferences: museumReferences,
      imageReferences: imageReferences,
    },
  });

  const existingMedia = await prisma.media.findMany({
    where: { toyId: toyId },
    orderBy: { id: 'asc' },
  });

  const newUrls = [photoUrl1, photoUrl2, photoUrl3];

  for (let i = 0; i < 3; i++) {
    const url = newUrls[i];
    const existing = existingMedia[i];

    if (url) {
      if (existing) {
        await prisma.media.update({
          where: { id: existing.id },
          data: { url: url, isPrimary: i === 0 },
        });
      } else {
        await prisma.media.create({
          data: { toyId: toyId, url: url, isPrimary: i === 0 },
        });
      }
    } else if (existing) {
      await prisma.media.delete({ where: { id: existing.id } });
    }
  }

  return res.status(200).json({ toy: toy });
}
