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
  const photoUrl = req.body.photoUrl;
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

  if (photoUrl) {
    const existingMedia = await prisma.media.findFirst({
      where: { toyId: toyId, isPrimary: true },
    });

    if (existingMedia) {
      await prisma.media.update({
        where: { id: existingMedia.id },
        data: { url: photoUrl },
      });
    } else {
      await prisma.media.create({
        data: { toyId: toyId, url: photoUrl, isPrimary: true },
      });
    }
  }

  return res.status(200).json({ toy: toy });
}
