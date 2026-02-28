import { name } from "../../package.json";

export const INSTALL_SNIPPET_NPM = `npm install ${name}`;
export const INSTALL_SNIPPET_YARN = `yarn add ${name}`;
export const INSTALL_SNIPPET_PNPM = `pnpm add ${name}`;

export const QUICKSTART_SNIPPET = `import { NIC } from "${name}";

const input = "911042754V";
const result = NIC.validate(input);

if (!result.valid && result.error) {
  console.error(result.error.code);
  console.error(result.error.message);
} else {
  const nic = NIC.parse(input);
  console.log(nic.type); // "old"
  console.log(nic.gender); // "male"
  console.log(nic.parts.year); // "1991"
  console.log(nic.birthday); // { year: 1991, month: 4, day: 14 }
}`;

export const VALID_SNIPPET = `import { NIC } from "${name}";

const isValid = NIC.valid("911042754V"); // true
const isInvalid = NIC.valid("invalid-nic"); // false`;

export const VALIDATE_SNIPPET = `import { NIC } from "${name}";

const result = NIC.validate("199100002757");

if (!result.valid && result.error) {
  console.log(result.error.code); // "INVALID_DAY_OF_YEAR"
  console.log(result.error.message);
}`;

export const CONVERT_SNIPPET = `import { NIC } from "${name}";

// Old -> New
const oldNic = NIC.parse("911042754V");
console.log(oldNic.convert()); // "199110402754"

// New -> Old (works only for 19xx years and serial starting with 0)
const newNic = NIC.parse("199110402754");
console.log(newNic.convert()); // "911042754V"`;

export const SANITIZE_SNIPPET = `import { NIC } from "${name}";

const cleaned = NIC.sanitize("   911042754v   ");
console.log(cleaned); // "911042754V"`;

export const ZOD_SNIPPET = `import { z } from "zod";
import { NIC } from "${name}";

const schema = z.object({
  nic: z.string().superRefine((value, ctx) => {
    const result = NIC.validate(value);

    if (!result.valid) {
      ctx.addIssue({
        code: "custom",
        message: result.error?.message ?? "Invalid NIC",
      });
    }
  }),
});`;

export const ZOD_TRANSFORM_SNIPPET = `import { z } from "zod";
import { NIC } from "${name}";

const nicField = z
  .string()
  .superRefine((value, ctx) => {
    const result = NIC.validate(value);
    if (!result.valid) {
      ctx.addIssue({
        code: "custom",
        message: result.error?.message ?? "Invalid NIC",
      });
    }
  })
  .transform((value) => {
    const nic = NIC.parse(value);
    return nic.toJSON();
  });

const parsed = nicField.parse("197419202757");
console.log(parsed.parts.serial);`;

export const CONFIGURATION_SNIPPET = `import { NIC } from "${name}";

// Read defaults
console.log(NIC.Config.MINIMUM_LEGAL_AGE_TO_HAVE_NIC); // 15
console.log(NIC.Config.OLDEST_BIRTH_YEAR_FOR_VALID_NIC); // 1901

// Override globally
NIC.Config.MINIMUM_LEGAL_AGE_TO_HAVE_NIC = 16;
NIC.Config.OLDEST_BIRTH_YEAR_FOR_VALID_NIC = 1950;`;

export const EXPORTS_SNIPPET = `import { NIC, NICType, Gender } from "${name}";`;

export const PARTS_SHAPE_SNIPPET = `type NICParts = {
  year: string;
  days: string;
  serial: string;
  checkdigit: string;
  letter: string | null;
};`;

export const CODE_LITERALS = {
  parse: "NIC.parse(nic)",
  validate: "NIC.validate(nic)",
  valid: "NIC.valid(nic)",
  sanitize: "NIC.sanitize(nic)",
  convert: "nic.convert()",
  toString: "nic.toString()",
  toJSON: "nic.toJSON()",
} as const;

export const DEMO_TABS = [
  { id: "demo", label: "Demo" },
  { id: "api", label: "API Reference" },
  { id: "wiki", label: "NIC Wiki" },
] as const;

export type ApiStaticMethodDoc = {
  call: string;
  returns: string;
  throws: string;
  summary: string;
  useCase: string;
};

export type ApiPropertyDoc = {
  property: string;
  type: string;
  summary: string;
  note?: string;
};

export type ApiInstanceMethodDoc = {
  method: string;
  returns: string;
  summary: string;
  note?: string;
};

export type ApiErrorCodeDoc = {
  code: string;
  appearsIn: string;
  meaning: string;
};

export const API_STATIC_METHODS: ApiStaticMethodDoc[] = [
  {
    call: "NIC.parse(nic)",
    returns: "NIC",
    throws: "NIC.Error",
    summary: "Parses and validates a NIC, returning a full NIC instance.",
    useCase: "Use this when you need parsed fields such as birthday, parts, age, and voter.",
  },
  {
    call: "NIC.validate(nic)",
    returns: "{ valid: boolean; error?: NIC.Error }",
    throws: "Never",
    summary: "Validates input and returns structured validity details.",
    useCase: "Use this for form validation or APIs where you want error details without exceptions.",
  },
  {
    call: "NIC.valid(nic)",
    returns: "boolean",
    throws: "Never",
    summary: "Fast boolean validity check.",
    useCase: "Use this for simple yes/no checks.",
  },
  {
    call: "NIC.sanitize(nic)",
    returns: "string",
    throws: "NIC.Error",
    summary: "Normalizes a valid NIC string (trim + uppercase suffix).",
    useCase: "Use this when cleaning user input before storing or comparing values.",
  },
];

export const API_INSTANCE_PROPERTIES: ApiPropertyDoc[] = [
  {
    property: "nic.value",
    type: "string",
    summary: "Normalized NIC string.",
  },
  {
    property: "nic.type",
    type: "NICType",
    summary: 'NIC format enum value: "old" or "new".',
  },
  {
    property: "nic.gender",
    type: "Gender",
    summary: 'Decoded gender enum value: "male" or "female".',
  },
  {
    property: "nic.parts",
    type: "{ year, days, serial, checkdigit, letter }",
    summary: "Raw NIC segments extracted from the parsed value.",
    note: "Use this when you need the encoded components directly.",
  },
  {
    property: "nic.birthday",
    type: "{ year: number; month: number; day: number }",
    summary: "Computed calendar birthday from encoded day-of-year.",
  },
  {
    property: "nic.age",
    type: "number",
    summary: "Computed current age (Asia/Colombo timezone).",
  },
  {
    property: "nic.voter",
    type: "boolean | null",
    summary: "For old NICs: true when letter is V, false when X. Null for new NICs.",
  },
];

export const API_INSTANCE_METHODS: ApiInstanceMethodDoc[] = [
  {
    method: "nic.convert()",
    returns: "string",
    summary: "Converts between old and new formats.",
    note: "New -> old requires a 19xx birth year and serial starting with 0.",
  },
  {
    method: "nic.toString()",
    returns: "string",
    summary: "Returns the same normalized value as nic.value.",
  },
  {
    method: "nic.toJSON()",
    returns: "{ nic, type, gender, birthday, age, voter, parts }",
    summary: "Returns a serializable summary object.",
  },
];

export const API_ERROR_CODES: ApiErrorCodeDoc[] = [
  {
    code: "INVALID_NIC_STRUCTURE",
    appearsIn: "NIC.parse, NIC.sanitize, NIC.validate",
    meaning: "Input is not in old format (9 digits + V/X) or new format (12 digits).",
  },
  {
    code: "MAXIMUM_AGE_REQUIREMENT_NOT_MET",
    appearsIn: "NIC.parse, NIC.sanitize, NIC.validate",
    meaning: "Birth year is below the configured oldest valid birth year.",
  },
  {
    code: "MINIMUM_AGE_REQUIREMENT_NOT_MET",
    appearsIn: "NIC.parse, NIC.sanitize, NIC.validate",
    meaning: "Person has not reached the configured minimum legal age for NIC eligibility.",
  },
  {
    code: "INVALID_DAY_OF_YEAR",
    appearsIn: "NIC.parse, NIC.sanitize, NIC.validate",
    meaning: "Encoded day-of-year is outside valid bounds for the birth year (including leap-year rules).",
  },
  {
    code: "INVALID_YEAR_FOR_OLD_FORMAT_CONVERSION",
    appearsIn: "nic.convert()",
    meaning: "Cannot convert a new NIC to old format unless the birth year is in the 1900s.",
  },
  {
    code: "SERIAL_NUMBER_TOO_LARGE_FOR_OLD_FORMAT",
    appearsIn: "nic.convert()",
    meaning: "Cannot convert to old format when the new-format serial cannot fit old serial width.",
  },
];
