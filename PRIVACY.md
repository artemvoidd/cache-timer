# Privacy Policy — Cache Timer

Last updated: October 6, 2026

Cache Timer is a Claude Code mod that shows how long the prompt cache stays warm. It runs entirely on your computer, inside Claude Code.

## What it collects

Nothing. Cache Timer does not collect, transmit or sell any data.

## What it reads

- The time when the main conversation starts and finishes a turn, to count down the cache lifetime. It does not read the content of your prompts, Claude's answers, files or tool calls.
- The cache lifetime (5 minutes or 1 hour) that Claude Code reports when you switch models.
- Its own `language` setting.

## What it stores

One value on your computer: the cache lifetime you chose with `/cache-ttl` (5 or 60), in the mod's own Claude Code store. You can clear it by uninstalling the mod.

## What it sends

Nothing. Cache Timer makes no network requests, runs no commands and reads no files. You can check this with `claude plugin validate`, which lists every call the mod makes (see the README).

## Contact

Questions: open an issue at https://github.com/artemvoidd/cache-timer/issues
