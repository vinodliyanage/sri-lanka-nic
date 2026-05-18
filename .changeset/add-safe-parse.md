---
"@sri-lanka/nic": minor
---

Add `NIC.safeParse()` — a non-throwing alternative to `NIC.parse()`. Returns `{ success: true, data }` with the parsed NIC on success, or `{ success: false, error }` on failure. Also exports the `SafeParseResult` type.
