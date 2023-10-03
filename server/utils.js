import neatCsv from 'neat-csv';
import fs from 'fs/promises';
import { languagesAsync } from './data.js';

/**
 *
 * @param {string} file
 * @returns
 */
export function loadData(file) {
  return fs.readFile(new URL(`data/${file}.csv`, import.meta.url)).then(neatCsv);
}

export async function getLangId(request, reply) {
  const lang = request.query.lang || 'en';

  const languages = await languagesAsync;
  const langId = languages.find((l) => l.iso639 === lang)?.id;

  if (!langId) {
    reply.code(400).send({ error: `Invalid language ${lang}. Valid languages are: ${languages.map((l) => l.iso639).join(', ')}` });
    throw '';
  }

  return langId;
}

export function ensureValidQueryParams(request, reply, params) {
  const invalidParams = Object.keys(request.query).filter((p) => !params.includes(p));

  if (invalidParams.length > 0) {
    reply.code(400).send({ error: `Invalid query params: ${invalidParams.join(', ')}. Valid query params are: ${params.join(', ')}` });
    throw '';
  }
}
