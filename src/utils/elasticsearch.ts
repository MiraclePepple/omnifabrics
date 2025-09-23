import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const ES_HOST = process.env.ES_HOST || 'http://localhost:9200';

export const esClient = new Client({
  node: ES_HOST,
});
