// Prompt cache countdown in the footer, next to the model label:
// a dot whose color cools from green to red, and the minutes left beside it.
import type { Register } from 'claude-code'

const MINUTE = 60_000

let ttlMs = 60 * MINUTE   // 1h by default; /cache-ttl 5 switches to 5 minutes
let lastActivity = 0      // ms of the last main-loop request (0 = no turn yet)
let working = false       // while Claude answers, the cache stays fresh

// Muted, so the footer stays quiet; only the glyph carries the color
const GREEN = '#6a9a78'
const AMBER = '#b39552'
const RED = '#b8645c'
const GREY = '#7d8590'

const WORDS = {
  en: { min: 'min', cold: 'cache cold' },
  ru: { min: 'мин', cold: 'кэш остыл' },
}
let words = WORDS.en

export const register: Register = (on, options) => {
  words = options?.language === 'ru' ? WORDS.ru : WORDS.en

  on('session.start', async ($, e, next) => {
    const saved = await $.store.get('ttlMinutes')
    if (saved === 5 || saved === 60) ttlMs = saved * MINUTE
    await $.command.register({
      name: 'cache-ttl',
      description: 'Prompt cache timer: /cache-ttl 5 or /cache-ttl 60 (minutes)',
    })
    // Redraw the footer so the minutes tick down
    $.clock.every(5000, () => $.ui.invalidate('ui.render'))
    return next(e)
  })

  // Only the main loop raises turn.start; subagents don't
  on('turn.start', async ($, e, next) => {
    working = true
    lastActivity = await $.clock.now()
    $.ui.invalidate('ui.render')
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (!e.agentId) {
      working = false
      lastActivity = await $.clock.now()
      $.ui.invalidate('ui.render')
    }
    return next(e)
  })

  // A model switch reports the TTL Claude Code actually uses
  on('classic.PostModelSwitch', async ($, e, next) => {
    ttlMs = (e.cache_ttl === '5m' ? 5 : 60) * MINUTE
    $.ui.invalidate('ui.render')
    return next(e)
  })

  on('command.run', { command: 'cache-ttl' }, async ($, e) => {
    const minutes = parseInt(String(e.args || '').trim(), 10)
    if (minutes !== 5 && minutes !== 60) {
      return { text: 'Use /cache-ttl 5 or /cache-ttl 60. Now: ' + ttlMs / MINUTE + ' min' }
    }
    ttlMs = minutes * MINUTE
    await $.store.set('ttlMinutes', minutes)
    $.ui.invalidate('ui.render')
    return { text: 'Cache timer: ' + minutes + ' min' }
  })

  // The labels at the right of the prompt footer, beside the model.
  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    if (!lastActivity) return next(e)
    const left = working ? ttlMs : lastActivity + ttlMs - (await $.clock.now())
    const rest = e.props.modes.join(' & ')

    // The desktop footer draws text only (an Svg there shows nothing), so the
    // progress is a large dot whose color tracks the time left
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="row" columnGap={1}>
        <Text color={color(left)}>{'⬤'}</Text>
        <Text dimColor>{label(left)}</Text>
        {rest ? <Text dimColor>{' & ' + rest}</Text> : null}
      </Box>
    )
  })
}

function label(left: number): string {
  if (left <= 0) return words.cold
  if (left < 2 * MINUTE) {
    const s = Math.ceil(left / 1000)
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
  }
  return Math.ceil(left / MINUTE) + ' ' + words.min
}

function color(left: number): string {
  if (left <= 0) return GREY
  if (left > 10 * MINUTE) return GREEN
  return left > 3 * MINUTE ? AMBER : RED
}

