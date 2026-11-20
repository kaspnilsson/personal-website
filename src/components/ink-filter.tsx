// Photocopied ink, modelled on the Desire cover's own lettering: the shape is softened, a
// fine pixel-level toner noise is added, and the result is re-hardened. That gives a dense
// grain all through the black and slightly feathered edges, the way a copier prints type.
// No discrete pinholes: separate white dots read as holes (and to some people as
// trypophobic); a fine, even grain reads as print.
function inkSteps(blur: number, amp: number, slope: number, intercept: number) {
  return (
    <>
      <feGaussianBlur in="SourceAlpha" stdDeviation={blur} result="soft" />
      <feTurbulence type="fractalNoise" baseFrequency="3" numOctaves="1" seed="3" result="toner" />
      <feColorMatrix in="toner" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="noise" />
      <feComposite in="soft" in2="noise" operator="arithmetic" k1="0" k2="1" k3={amp} k4={-amp / 2} result="grain" />
      <feComponentTransfer in="grain" result="copy">
        <feFuncA type="linear" slope={slope} intercept={intercept} />
      </feComponentTransfer>
      <feFlood floodColor="#121110" result="ink" />
      <feComposite in="ink" in2="copy" operator="in" />
    </>
  );
}

export function InkFilter() {
  return (
    <svg className="sr-only" aria-hidden="true" focusable="false">
      <filter id="ink" x="-3%" y="-3%" width="106%" height="106%" colorInterpolationFilters="sRGB">
        {inkSteps(0.5, 1.6, 2.4, -0.9)}
      </filter>
      <filter id="ink-solid" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        {inkSteps(0.5, 1.2, 2.6, -1)}
      </filter>
    </svg>
  );
}
