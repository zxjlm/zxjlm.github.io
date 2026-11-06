export function productionBuild(env = process.env) {
  if (env.SITE_ENV) {
    if (!['production', 'preview'].includes(env.SITE_ENV)) throw new Error('SITE_ENV must be production or preview');
    return env.SITE_ENV === 'production';
  }
  return env.CF_PAGES === '1' && env.CF_PAGES_BRANCH === 'source';
}
