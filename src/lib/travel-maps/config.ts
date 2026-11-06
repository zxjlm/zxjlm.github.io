import { siteConfig } from '../../site.config.ts'

export type TravelMapConfig = typeof siteConfig.theme.travel

/** Server and publishing tools share the same explicitly selected renderer. */
export function travelMapConfig(): TravelMapConfig {
  const mode = process.env.TRAVEL_MAP_MODE ?? siteConfig.theme.travel.mode
  if (mode !== 'static' && mode !== 'dynamic')
    throw new Error('TRAVEL_MAP_MODE must be static or dynamic')
  const { zoom } = siteConfig.theme.travel
  if (!Number.isFinite(zoom) || zoom < 0 || zoom > 20)
    throw new Error('travel.zoom must be between 0 and 20')
  return { ...siteConfig.theme.travel, mode }
}
