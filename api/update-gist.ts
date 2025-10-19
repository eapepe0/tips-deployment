import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Método no permitido");

  const { tips } = req.body;
  if (!Array.isArray(tips)) return res.status(400).send("Formato inválido");

  const gistId = "f25fca4e975cfda2b4b8632cfa23e45e"; // tu ID del Gist
  const token = process.env.GITHUB_TOKEN; // guardado en las variables de entorno de Vercel

  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: {
        "tips.json": {
          content: JSON.stringify(tips, null, 2),
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return res.status(500).send(error);
  }
  console.log("Gist actualizado")
  res.status(200).json({ message: "Gist actualizado" });
}
