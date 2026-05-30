/**
 * Manually bump wiki/game data alignment stamp (no generated files).
 * Run: node scripts/touch-wiki-stamp.mjs
 */
import { touchWikiDataStamp } from './lib/wiki-data-stamp.mjs'

touchWikiDataStamp('manual')
