<div align="center">

# @sri-lanka/nic

[![npm version](https://img.shields.io/npm/v/@sri-lanka/nic?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@sri-lanka/nic)
[![npm downloads](https://img.shields.io/npm/dm/@sri-lanka/nic?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@sri-lanka/nic)
[![bundle size](https://img.badgesize.io/https://unpkg.com/@sri-lanka/nic/dist/index.js?compression=gzip&style=flat-square&label=size&color=cb3837)](https://unpkg.com/@sri-lanka/nic/dist/index.js)
[![license](https://img.shields.io/github/license/vinodliyanage/sri-lanka-nic?style=flat-square)](https://github.com/vinodliyanage/sri-lanka-nic/blob/main/LICENSE)

**Parse, validate, and build Sri Lankan National Identity Card numbers.**

Zero dependencies · TypeScript · Works everywhere

</div>

---

## Documentation

Full documentation is available at the [docs site](https://nic.vinodliyanage.me).

## Install

```bash
# npm
npm install @sri-lanka/nic

# pnpm
pnpm add @sri-lanka/nic

# yarn
yarn add @sri-lanka/nic
```

## Quick Start

```typescript
import { NIC } from "@sri-lanka/nic";

// Parse a NIC
const result = NIC.parse("200001501234");

console.log(result.birthday); // { year: 2000, month: 1, day: 15 }
console.log(result.gender); // "MALE"
console.log(result.age); // 25
console.log(result.type); // "NEW"

// Validate
NIC.validate("901404567V"); // throws if invalid

// Check without throwing
NIC.valid("901404567V"); // true
NIC.valid("invalid"); // false
```

## Build a NIC

```typescript
import { NIC, Gender } from "@sri-lanka/nic";

const nic = NIC.builder
  .new()
  .birthday({ year: 1995, month: 6, day: 15 })
  .gender(Gender.MALE)
  .build();

console.log(nic); // "199516600000" (example)
```

## Convert Between Formats

```typescript
const parsed = NIC.parse("901404567V");

// Old → New
const newFormat = parsed.convert();
console.log(newFormat); // "199014004567"

// New → Old
const back = NIC.parse(newFormat);
console.log(back.convert({ letter: "V" })); // "901404567V"
```

## Configuration

```typescript
NIC.parse("901404567V", {
  minimumAge: 18,
  maximumAge: 100,
  minimumBirthYear: 1950,
  maximumBirthYear: 2005,

  // Custom validation
  check(nic, NICError) {
    if (nic.gender === "FEMALE") {
      throw new NICError("Only male NICs allowed");
    }
  },
});
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

[MIT](./LICENSE) © Vinod Liyanage
