import { expect, test } from 'claude-code/testing'

test('/cache-ttl switches the timer between 60 and 5 minutes', async ($, on) => {
  // No real store in a test: answer the store calls in Claude Code's place
  on('store.get', () => ({ value: undefined }))
  on('store.set', () => ({ value: undefined }))

  const usage = await $.command.run({ command: 'cache-ttl', args: '' })
  expect(usage.text).toContain('Now: 60 min')

  const set = await $.command.run({ command: 'cache-ttl', args: '5' })
  expect(set.text).toBe('Cache timer: 5 min')

  const bad = await $.command.run({ command: 'cache-ttl', args: '30' })
  expect(bad.text).toContain('Now: 5 min')
})

test('the module loads with Russian labels', { options: { language: 'ru' } }, async ($, on) => {
  on('store.get', () => ({ value: undefined }))
  const usage = await $.command.run({ command: 'cache-ttl', args: '' })
  expect(usage.text).toContain('Now: 60 min')
})
