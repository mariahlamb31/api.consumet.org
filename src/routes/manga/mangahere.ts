import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { MANGA } from '@consumet/extensions';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const mangahere = new MANGA.MangaHere();

  fastify.get('/mangahere', (_, rp) => {
    rp.status(200).send({
      intro: `Welcome to the MangaHere provider: check out the provider's website @ ${mangahere.toString.baseUrl}`,
      routes: ['/:query', '/info', '/read'],
      documentation: 'https://docs.consumet.org/#tag/mangahere',
    });
  });

  fastify.get(
    '/mangahere/:query',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = (request.params as { query: string }).query;

      const page = (request.query as { page: number }).page;

      const res = await mangahere.search(query, page);

      reply.status(200).send(res);
    }
  );

  fastify.get('/mangahere/info', async (request: FastifyRequest, reply: FastifyReply) => {
    const id = decodeURIComponent((request.query as { id: string }).id);

    if (typeof id === 'undefined')
      return reply.status(400).send({ message: 'id is required' });

    try {
      const res = await mangahere
        .fetchMangaInfo(id)
        .catch((err) => reply.status(404).send({ message: err }));

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Please try again later.' });
    }
  });

  fastify.get('/mangahere/read', async (request: FastifyRequest, reply: FastifyReply) => {
    const chapterId = (request.query as { chapterId: string }).chapterId;

    if (typeof chapterId === 'undefined')
      return reply.status(400).send({ message: 'chapterId is required' });

    try {
      const res = await mangahere
        .fetchChapterPages(chapterId)
        .catch((err) => reply.status(404).send({ message: err }));

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Please try again later.' });
    }
  });
};

export default routes;