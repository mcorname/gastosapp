# AI Money Functional Implementation Plan

> Use subagent-driven-development for the isolated text-service task and independent review. Execute financial storage and UI integration locally. Approved design: docs/audit/2026-09-17-ai-money-audit-design.md.

Goal: complete existing financial workflows with a derived ledger and preserve Light/macOS UI.
Architecture: retain repositories, SQLite native, localStorage web, FinanceContext, Expo client and Express endpoints. Extract shared financial calculation and local language services; use one versioned storage migration and avoid storing derived totals.
Tech stack: TypeScript, React Native/Expo 57, Express, Zod, node:test.

- [x] Audit and user approval.
- [x] Backup sources before edits; create codex/ai-money-functional branch.
- [ ] tests/finance.test.ts: assert 500 opening + 100 income - 35 expense = 565; transfer 100 between two accounts preserves total and summary; adjustment excludes income/expense; deleting twice unchanged; invalid references/money/date rejected. Run node --import tsx --test tests/finance.test.ts, expect failures before shared finance.ts exists.
- [ ] packages/shared/src/finance.ts and types.ts: implement money/date helpers, validation, balances, statistics and filtering. Monetary arithmetic uses integer cents. Expand transaction type adjustment and optional audit metadata; retain legacy account fields as compatibility projections.
- [ ] apps/mobile/src/db/{database.web.ts,database.ts,schema.ts}: versioned migration retaining original storage backup and all IDs; web atomic state mutation and native transactional migration. Stop automatic financial seeding. Add settings storage.
- [ ] apps/mobile/src/db/repositories: validated ledger operations, safe account update/delete, no cached balance writes, adjustment snapshots. tests/storage.test.ts exercises web persistence/rollback and tests native schema with SQLite engine.
- [ ] FinanceContext: single initialization, derived monthly totals and balances; stable commands; persistent privacy/name; errors/retry.
- [ ] NewTransactionModal, account/details/settings components: labeled validated forms, transfers, adjustments, edit/delete confirmation, loading/error/empty states.
- [ ] App.tsx, Header, MonthSelector, AccountCard, TopCategoriesCard, TransactionItem: route state and history, global debounce search and detail, filters/sort, periods from data, real net worth detail and privacy throughout.
- [ ] Text-service subtask: tests/assistant.test.ts first, shared assistant.ts, backend honest local mode/unavailable integrations. Avoid fake OCR, OTP or sync success.
- [ ] MarioChatWidget/MarioChatModal/QuickAIModal: brief insight, broad chat, real suggested questions, Enter versus Shift+Enter, retry, preview editable before confirm.
- [ ] Browser regression tests: create/edit/delete expense/income/transfer, adjustment, totals after every operation, search/filter/month/account/detail/privacy/reload and assistant preview. Empty isolated storage only, not user data.
- [ ] Verify 375/390/430/768/1024/1280/1440px and native TypeScript; review spec then code quality and fix findings.
- [ ] Deliver modified-file list, migration/restore guide, test outcomes and explicit limitations. No publication required.
