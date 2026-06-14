import { describe, expect, it } from 'vitest'
import { gameThemeIdFromSheetName } from './themeSheetNames'

describe('gameThemeIdFromSheetName', () => {
  it('maps tower event labels by skin or event name', () => {
    expect(gameThemeIdFromSheetName('Plasma Ball', 'tower-event')).toBe('tower-event-plasma-ball')
    expect(gameThemeIdFromSheetName('Plasma Returns', 'tower-event')).toBe('tower-event-plasma-ball')
    expect(gameThemeIdFromSheetName('Plasma', 'tower-event')).toBe('tower-event-plasma-ball')
    expect(gameThemeIdFromSheetName('Ocean Night', 'background')).toBe('bg-ocean-night')
  })

  it('maps event tower skins separately from milestone skins', () => {
    expect(gameThemeIdFromSheetName('Star', 'tower-event')).toBe('tower-event-star')
    expect(gameThemeIdFromSheetName('Shuriken', 'tower-milestone')).toBe('tower-shuriken')
    expect(gameThemeIdFromSheetName('Sheep', 'tower-milestone')).toBe('tower-sheep')
    expect(gameThemeIdFromSheetName('Fried Egg', 'tower-milestone')).toBe('tower-fried-egg')
    expect(gameThemeIdFromSheetName('Mush-mush', 'tower-milestone')).toBe('tower-mush-mush')
    expect(gameThemeIdFromSheetName('Shuriken', 'tower-event')).toBeNull()
  })

  it('maps background, menu, and banner names in their sections', () => {
    expect(gameThemeIdFromSheetName('Ocean Night', 'background')).toBe('bg-ocean-night')
    expect(gameThemeIdFromSheetName('Plasma Field', 'background')).toBe('bg-plasma-field')
    expect(gameThemeIdFromSheetName('Plasma', 'background')).toBe('bg-plasma-field')
    expect(gameThemeIdFromSheetName('Mech World', 'background')).toBe('bg-guild-mech-world')
    expect(gameThemeIdFromSheetName('Mech World', 'menus')).toBe('menu-mech')
    expect(gameThemeIdFromSheetName('Mech World', 'banners')).toBe('banner-mech')
  })

  it('maps music and guardian names in their sections', () => {
    expect(gameThemeIdFromSheetName('Krisu - Oceans Sings', 'music')).toBe('music-krisu-oceans-sings')
    expect(gameThemeIdFromSheetName('Finn', 'guardian')).toBe('guardian-finn')
  })
})
