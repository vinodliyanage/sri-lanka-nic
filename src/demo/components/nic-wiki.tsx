import { GlassCard } from "./glass-card";
import { PropertyRow } from "./property-row";

const NIC_WIKI_EXAMPLES = {
  old: "853400937V",
  new: "198534000937",
} as const;

export function NicWiki() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
      
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">Understanding Sri Lankan NICs</h2>
        <p className="text-text-secondary leading-relaxed mb-6">
          The National Identity Card (NIC) is the unique biometric identity document used in Sri Lanka. The number
          itself encodes key information about the holder, including their birth year, birthday, and gender. This
          library handles both the <b>Old Format</b> (pre-2016) and the <b>New Format</b>.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="text-lg font-medium text-text-primary mb-3">Old Format (1974 - 2015)</h3>
            <p className="text-text-secondary text-sm mb-4">
              Consists of <b>9 digits</b> followed by a letter.
              <br />
              Example: <code className="text-accent bg-surface-raised px-1 py-0.5 rounded">{NIC_WIKI_EXAMPLES.old}</code>
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-mono text-accent min-w-[24px]">1-2</span>
                <span className="text-text-muted">Birth Year (last 2 digits, e.g., 85 = 1985)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent min-w-[24px]">3-5</span>
                <span className="text-text-muted">Day of Year (001-366). Females have 500 added.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent min-w-[24px]">6-8</span>
                <span className="text-text-muted">Serial Number</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent min-w-[24px]">9</span>
                <span className="text-text-muted">Check Digit</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent min-w-[24px]">10</span>
                <span className="text-text-muted">Voter Status ('V' = Voter, 'X' = Non-Voter)</span>
              </li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-medium text-text-primary mb-3">New Format (2016 - Present)</h3>
            <p className="text-text-secondary text-sm mb-4">
              Consists of <b>12 digits</b>.
              <br />
              Example: <code className="text-accent bg-surface-raised px-1 py-0.5 rounded">{NIC_WIKI_EXAMPLES.new}</code>
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-mono text-accent min-w-[24px]">1-4</span>
                <span className="text-text-muted">Full Birth Year (e.g., 1985)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent min-w-[24px]">5-7</span>
                <span className="text-text-muted">Day of Year (001-366). Females have 500 added.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent min-w-[24px]">8</span>
                <span className="text-text-muted">Zero (0) - Reserved digit</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent min-w-[24px]">9-11</span>
                <span className="text-text-muted">Serial Number</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent min-w-[24px]">12</span>
                <span className="text-text-muted">Check Digit</span>
              </li>
            </ul>
          </GlassCard>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-text-primary">Key Data Points</h2>
        <GlassCard>
          <div className="bg-surface-raised/30 rounded-xl p-4 border border-glass-border space-y-1">
            <PropertyRow label="Minimum Legal Age" value="15 Years" code={false} />
            <div className="text-xs text-text-muted pl-1 pb-3">
              A person must be at least 15 years old to be issued a NIC.
            </div>

            <PropertyRow label="Oldest Valid Year" value="1901" code={false} />
            <div className="text-xs text-text-muted pl-1 pb-3">
              Records before 1901 are not considered valid for standard NIC processing.
            </div>

            <PropertyRow label="Gender Calculation" value="Day of Year > 500" code={false} />
            <div className="text-xs text-text-muted pl-1 pb-3">
              If the encoded day of year is between 501-866, the gender is Female. Otherwise (001-366), it's Male.
            </div>

            <PropertyRow label="Voter Status (Old Format)" value="'V' vs 'X'" code={false} />
            <div className="text-xs text-text-muted pl-1">
              'V' indicates the holder is eligible to vote. 'X' is used for those not eligible to vote at the time of
              issuance. The probability of an 'X' is roughly 10%.
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="bg-surface-raised/30 rounded-2xl p-6 border border-glass-border">
        <h3 className="text-lg font-medium text-text-primary mb-2">Further Reading</h3>
        <p className="text-text-secondary text-sm">
          For more historical context and legal details, visit the{" "}
          <a
            href="https://en.wikipedia.org/wiki/National_identity_card_(Sri_Lanka)"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover underline underline-offset-4"
          >
            National Identity Card (Sri Lanka) Wikipedia page
          </a>
          .
        </p>
      </section>
    </div>
  );
}
