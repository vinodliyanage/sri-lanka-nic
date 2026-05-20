---
"@sri-lanka/nic": patch
---

Fix birthday encoding to use the official 366-day NIC calendar convention. February is now always treated as having 29 days regardless of leap year, matching how the Sri Lankan government encodes birthdays in NIC numbers. This fix applies to both parsing and building NICs.
