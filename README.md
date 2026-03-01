<p align="start">
  <img src="https://raw.githubusercontent.com/vinodliyanage/sri-lanka-nic/main/public/sri-lanka-nic-logo.jpg" alt="Sri Lanka NIC Logo" width="200" />
</p>

# @sri-lanka/nic

[![NPM Version](https://img.shields.io/npm/v/%40sri-lanka%2Fnic)](https://www.npmjs.com/package/@sri-lanka/nic)
[![npm bundle size](https://img.shields.io/bundlejs/size/%40sri-lanka%2Fnic)](https://bundlejs.com/?q=%40sri-lanka%2Fnic)
[![NPM License](https://img.shields.io/npm/l/%40sri-lanka%2Fnic)](./LICENSE)

A lightweight, zero-dependency TypeScript library to **parse**, **validate**, **sanitize**, and **convert** Sri Lankan National Identity Card (NIC) numbers.

Supports both old format (`9 digits + V/X`) and new format (`12 digits`) with strict validation beyond regex matching.

**[Live Demo & API Explorer](https://nic.vinodliyanage.me)** · **[NPM Package](https://www.npmjs.com/package/@sri-lanka/nic)**

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Validation](#validation)
- [Parsing](#parsing)
- [Format Conversion](#format-conversion)
- [Sanitization](#sanitization)
- [Error Handling](#error-handling)
- [Integration with Zod](#integration-with-zod)
- [Error Codes](#error-codes)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Named Exports](#named-exports)
- [Module Support](#module-support)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Zero dependencies
- Validation with birth-year and day-of-year checks (including leap years)
- Parse NIC values into typed, structured data
- Convert between old and new formats
- Input sanitization for user-entered values
- ESM, CJS, and TypeScript declaration support

---

## Installation

```bash
pnpm add @sri-lanka/nic
```

```bash
npm install @sri-lanka/nic
```

```bash
yarn add @sri-lanka/nic
```

---

## Quick Start

```ts
import { NIC } from "@sri-lanka/nic";

// Check validity
NIC.valid("911042754V"); // true
NIC.valid("invalid"); // false

// Parse and extract all data
const nic = NIC.parse("911042754V");
nic.value; // "911042754V"
nic.type; // "old"
nic.gender; // "male"
nic.birthday; // { year: 1991, month: 4, day: 14 }
nic.age; // 34
nic.voter; // true (null for new-format NICs)
nic.parts; // { year: "1991", days: "104", serial: "275", checkdigit: "4", letter: "V" }

// Convert between formats
nic.convert(); // "199110402754"

// Validate with error details
const result = NIC.validate("invalid");
if (!result.valid) {
  result.error.code; // "INVALID_NIC_STRUCTURE"
  result.error.message; // "Invalid NIC structure..."
}

// Sanitize user input
NIC.sanitize("  911042754v  "); // "911042754V"
```

---

## Validation

`NIC.validate()` checks:

1. Structure (`9 digits + V/X` or `12 digits`)
2. Birth year bounds
3. Day-of-year range with leap-year correctness
4. Minimum legal age rule (default: 15 years)

---

## Parsing

`NIC.parse()` returns a `NIC` instance or throws `NIC.Error` if invalid.

```ts
const nic = NIC.parse("911042754V");

nic.value; // "911042754V"
nic.type; // "old"
nic.gender; // "male"
nic.birthday; // { year: 1991, month: 4, day: 14 }
nic.age; // number
nic.voter; // true
nic.parts; // { year, days, serial, checkdigit, letter }
nic.parts.year; // "1991"
nic.parts.days; // "104"
nic.parts.serial; // "275"
nic.parts.checkdigit; // "4"
nic.parts.letter; // "V"
```

Serialization helpers:

```ts
nic.toString(); // "911042754V"
nic.toJSON(); // { nic, type, gender, birthday, age, voter, parts }
```

---

## Format Conversion

```ts
// Old -> New
const oldNic = NIC.parse("911042754V");
oldNic.convert(); // "199110402754"

// New -> Old
const newNic = NIC.parse("199110402754");
newNic.convert(); // "911042754V"
```

`NEW -> OLD` conversion requires:

- Birth year starts with `19`
- Serial part starts with `0`

Otherwise `convert()` throws `NIC.Error`.

---

## Sanitization

```ts
NIC.sanitize("   911042754v   "); // "911042754V"
NIC.sanitize("   197419202757   "); // "197419202757"
```

`NIC.sanitize()` throws `NIC.Error` when input is not a valid NIC shape.

---

## Error Handling

```ts
import { NIC } from "@sri-lanka/nic";

try {
  NIC.parse("invalid-nic");
} catch (error) {
  if (error instanceof NIC.Error) {
    console.log(error.code);
    console.log(error.message);
  }
}
```

If you do not want exceptions, use `NIC.validate()` or `NIC.valid()`.

---

## Integration with Zod

```ts
import { z } from "zod";
import { NIC } from "@sri-lanka/nic";

const schema = z.object({
  nic: z.string().superRefine((value, ctx) => {
    const result = NIC.validate(value);
    if (!result.valid) {
      ctx.addIssue({
        code: "custom",
        message: result.error.message,
      });
    }
  }),
});
```

---

## Error Codes

| Code                                     | Description                                                     |
| ---------------------------------------- | --------------------------------------------------------------- |
| `INVALID_NIC_STRUCTURE`                  | Input is not old-format or new-format NIC shape                 |
| `MAXIMUM_AGE_REQUIREMENT_NOT_MET`        | Birth year is older than configured lower bound                 |
| `MINIMUM_AGE_REQUIREMENT_NOT_MET`        | Person has not reached configured minimum legal age             |
| `INVALID_DAY_OF_YEAR`                    | Day-of-year is out of valid range for that birth year           |
| `INVALID_YEAR_FOR_OLD_FORMAT_CONVERSION` | New NIC birth year is not in 19xx, cannot convert to old format |
| `SERIAL_NUMBER_TOO_LARGE_FOR_OLD_FORMAT` | New NIC serial cannot fit the old-format serial width           |

---

## Configuration

Global validation settings are available via `NIC.Config`.

```ts
import { NIC } from "@sri-lanka/nic";

NIC.Config.MINIMUM_LEGAL_AGE_TO_HAVE_NIC; // 15
NIC.Config.OLDEST_BIRTH_YEAR_FOR_VALID_NIC; // 1901

NIC.Config.MINIMUM_LEGAL_AGE_TO_HAVE_NIC = 16;
NIC.Config.OLDEST_BIRTH_YEAR_FOR_VALID_NIC = 1950;
```

These settings affect validation behavior and related error messages.

---

## API Reference

### Static Methods

| Method              | Returns                                                 | Throws      | Description                 |
| ------------------- | ------------------------------------------------------- | ----------- | --------------------------- |
| `NIC.parse(nic)`    | `NIC`                                                   | `NIC.Error` | Parse and validate NIC      |
| `NIC.validate(nic)` | `{ valid: true } \| { valid: false; error: NIC.Error }` | —           | Validate without throwing   |
| `NIC.valid(nic)`    | `boolean`                                               | —           | Boolean validation shortcut |
| `NIC.sanitize(nic)` | `string`                                                | `NIC.Error` | Normalize valid NIC input   |

### Instance Properties

| Property    | Type                                         | Description                              |
| ----------- | -------------------------------------------- | ---------------------------------------- |
| `.value`    | `string`                                     | Normalized NIC string                    |
| `.type`     | `NICType`                                    | `"old"` or `"new"`                       |
| `.gender`   | `Gender`                                     | `"male"` or `"female"`                   |
| `.parts`    | `{ year, days, serial, checkdigit, letter }` | Raw extracted segments                   |
| `.birthday` | `{ year, month, day }`                       | Computed birthday                        |
| `.age`      | `number`                                     | Computed age                             |
| `.voter`    | `boolean \| null`                            | Voter state for old NICs; `null` for new |

### Instance Methods

| Method        | Returns                                              | Description                         |
| ------------- | ---------------------------------------------------- | ----------------------------------- |
| `.convert()`  | `string`                                             | Convert between old and new formats |
| `.toString()` | `string`                                             | Return normalized NIC string        |
| `.toJSON()`   | `{ nic, type, gender, birthday, age, voter, parts }` | Return serializable summary         |

---

## Named Exports

```ts
import { NIC, NICType, Gender } from "@sri-lanka/nic";
```

`NIC.Error` and `NIC.Config` are available via the `NIC` class.

---

## Module Support

```ts
// ESM
import { NIC } from "@sri-lanka/nic";

// CommonJS
const { NIC } = require("@sri-lanka/nic");
```

Tree-shaking is supported.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

[MIT](./LICENSE)
