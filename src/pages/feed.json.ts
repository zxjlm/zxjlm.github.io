import type { APIRoute } from 'astro';
import { feed } from '../lib/feeds';
export const GET: APIRoute = ({ site }) => feed('json', site!);
