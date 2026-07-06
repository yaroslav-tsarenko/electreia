/**
 * Electreia wordmark — precision-tech display face with a tight tracking,
 * flanked by a small electric-azure pulse dot for the "engineered" feel.
 * Sizes fluidly via the `size` prop (maps to font-size in px).
 */
export function ElectreiaLogo({ size = 24 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 leading-none">
      <span
        aria-hidden
        className="inline-block rounded-full bg-[color:var(--color-primary)] shadow-[0_0_12px_rgba(46,125,255,0.65)]"
        style={{
          width: Math.max(6, Math.round(size * 0.28)),
          height: Math.max(6, Math.round(size * 0.28)),
        }}
      />
      <span
        className="font-display font-semibold uppercase"
        style={{ fontSize: size, letterSpacing: "0.22em" }}
      >
        Electreia
      </span>
    </span>
  );
}

// Legacy aliases — kept so old imports don't break during the transition.
export const ElectreiaMark = ElectreiaLogo;
export const RavoraLogo = ElectreiaLogo;
export const RavoraMark = ElectreiaLogo;
