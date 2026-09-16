// Fichier temporaire : vérifie qu'une fonction serverless se déploie bien
// sur ce projet statique, et que request.formData() reçoit un vrai upload.
// À supprimer une fois le contrôle effectué.

export async function GET() {
  return new Response('pong');
}

export async function POST(request) {
  const fd = await request.formData();
  const fichier = fd.get('fichier');
  return Response.json({
    champs: [...fd.keys()],
    taille: fichier?.size ?? null,
    node: process.version,
  });
}
