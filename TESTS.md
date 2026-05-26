# Tests

All tests are in `__tests__/auditEngine.test.ts`
Run with: `npm test`

| Test | File | What it covers |
|------|------|----------------|
| Zero savings for empty input | auditEngine.test.ts | Edge case |
| Duplicate chat tools detected | auditEngine.test.ts | Core logic |
| Team plan overkill flagged | auditEngine.test.ts | Downgrade logic |
| Monthly spend calculation | auditEngine.test.ts | Math accuracy |
| Annual = 12x monthly | auditEngine.test.ts | Derived value |