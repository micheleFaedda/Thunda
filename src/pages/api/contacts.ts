import { appendFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';
import type { APIRoute } from 'astro';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1),
  surname: z.string().trim().min(1),
  phone: z.string().trim().min(6),
});

const contactsFilePath = resolve(process.cwd(), 'contacts.xls');
const header = 'Nome\tCognome\tTelefono\tData\n';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: 'Payload non valido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsedContact = contactSchema.safeParse(payload);

  if (!parsedContact.success) {
    return new Response(JSON.stringify({ message: 'Compila nome, cognome e telefono.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const now = new Date().toISOString();
  const row = `${parsedContact.data.name}\t${parsedContact.data.surname}\t${parsedContact.data.phone}\t${now}\n`;

  try {
    try {
      await access(contactsFilePath, constants.F_OK);
    } catch {
      await appendFile(contactsFilePath, header, 'utf8');
    }

    await appendFile(contactsFilePath, row, 'utf8');

    return new Response(JSON.stringify({ message: 'Contatto salvato correttamente.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ message: 'Errore durante il salvataggio del contatto.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
