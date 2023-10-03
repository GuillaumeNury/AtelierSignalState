import Fastify from 'fastify';
import { ensureValidQueryParams, getLangId } from './utils.js';
import { speciesAsync, pokemonTypesAsync, typesAsync, languagesAsync } from './data.js';

const fastify = Fastify();

const typesByPokemonIdAsync = pokemonTypesAsync.then((pokemonTypes) => {
  /**
   * @type {Map<number, Set<number>>}
   */
  const typesByPokemonId = new Map();

  for (const pokemonType of pokemonTypes) {
    const types = typesByPokemonId.get(pokemonType.pokemon_id) || new Set();
    types.add(pokemonType.type_id);
    typesByPokemonId.set(pokemonType.pokemon_id, types);
  }

  return typesByPokemonId;
});

fastify.get('/api/pokemons', async (request, reply) => {
  const langId = await getLangId(request, reply);

  ensureValidQueryParams(request, reply, ['limit', 'page', 'search', 'typeId', 'lang']);

  const limit = request.query.limit || 20;
  const page = request.query.page || 1;
  const search = request.query.search || null;
  const typeId = request.query.typeId || null;

  // if (!langId) return;

  const typesByPokemonId = await typesByPokemonIdAsync;

  const allSpecies = (await speciesAsync).filter((s) => s.local_language_id === langId);
  let filteredSpecies = allSpecies;

  if (search) {
    filteredSpecies = filteredSpecies.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  }

  if (typeId) {
    filteredSpecies = filteredSpecies.filter((s) => typesByPokemonId.get(s.pokemon_species_id).has(typeId));
  }

  return {
    count: allSpecies.length,
    items: filteredSpecies
      .slice((page - 1) * limit, page * limit)
      .map((s) => ({
        id: s.pokemon_species_id,
        name: s.name,
        description: s.genus,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${s.pokemon_species_id}.png`,
      })),
  };
});

fastify.get('/api/types', async (request, reply) => {
  ensureValidQueryParams(request, reply, ['lang']);
  const langId = await getLangId(request, reply);
  const types = await typesAsync;
  return types.filter((t) => t.local_language_id === langId).map((t) => ({ id: t.type_id, name: t.name }));
});

fastify.get('/api/languages', async (request, reply) => {
  const languages = await languagesAsync;
  return [...new Set(languages.map((l) => l.iso639).filter((l) => !l.includes('-')))];
});

fastify.listen({ port: 3000 }, function (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
});
