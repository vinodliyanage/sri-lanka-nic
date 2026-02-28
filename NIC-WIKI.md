# Sri Lanka National Identity Card (NIC)

## NIC Number until 2015 (Old Format)

NICs issued before **1 January 2016** have a unique 9-digit number and a letter, in the format `911042754V` (where `0` is a digit and `V` or `X` is a letter).

- The first **two digits** are the holder's year of birth (e.g., `91` for someone born in 1991).
- The next **three digits** represent the day of the year for the person's birth. For women, `500` is added to the number of days.
- The next **three digits** are the serial number of the issued day.
- The next **digit** is the check digit.
- The final **letter** is generally a `V`, indicating the holder is eligible to vote in the area. In some cases, the final letter can be `X`, which usually indicates the holder is not eligible to vote (possibly because they were not permanent residents of Sri Lanka when applying for an NIC).

## NIC Number since 2016 (New Format)

From **1 January 2016**, each new NIC has a unique 12-digit number.

- The first **four digits** are the holder's year of birth (e.g., `1974` for someone born in 1974).
- The next **three digits** represent the number of days until their birthday from January 1st. For women, `500` is added to the number of days.
- The next **four digits** are the serial number.
- The last **digit** is the check digit.

---

## NIC Formats Breakdown

### Old Format

Similar to: `911042754V`

Used before January 1, 2016. Consists of 9 digits and a letter.

- `91`: Birth Year (1991)
- `104`: Day of Year (001-366). _For females, 500 is added to the day._
- `275`: Serial Number
- `4`: Check Digit
- `V`: Voter Status (`V`: Voter, `X`: Non-Voter)

### New Format

Similar to: `197419202757`

Used since January 1, 2016. Consists of 12 digits.

- `1974`: Birth Year
- `192`: Day of Year (001-366). _For females, 500 is added to the day._
- `0275`: Serial Number
- `7`: Check Digit

---

## Substring Indexes

| Information   | Old Format | New Format |
| :------------ | :--------- | :--------- |
| Birth Year    | `0-1`      | `0-3`      |
| Day of Year   | `2-4`      | `4-6`      |
| Serial Number | `5-7`      | `7-10`     |
| Check Digit   | `8`        | `11`       |
| Voter Status  | `9`        | -          |
