import { useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";

const sectionSelectors = [
  ".resend-header",
  ".resend-hero",
  "#landing-footer",
];

function getVerticalLines(width: number) {
  if (width < 640) {
    return ["12px", "calc(100% - 12px)"];
  }

  if (width < 1024) {
    return ["24px", "50%", "calc(100% - 24px)"];
  }

  return [
    "clamp(20px, 6vw, 80px)",
    "calc(50% - min(520px, 32vw))",
    "50%",
    "calc(50% + min(520px, 32vw))",
    "calc(100% - clamp(20px, 6vw, 80px))",
  ];
}

export default function GridOverlay() {
  const [verticalLines, setVerticalLines] = useState<string[]>(() =>
    typeof window === "undefined" ? getVerticalLines(1440) : getVerticalLines(window.innerWidth)
  );
  const [horizontalLines, setHorizontalLines] = useState<number[]>([]);

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(() => updateLines());
    const observed = new Set<Element>();

    const observeSections = () => {
      document.querySelectorAll(sectionSelectors.join(",")).forEach((element) => {
        if (observed.has(element)) return;
        observed.add(element);
        resizeObserver.observe(element);
      });
    };

    const updateLines = () => {
      setVerticalLines(getVerticalLines(window.innerWidth));
      observeSections();

      const pageTop = document.getElementById("top")?.getBoundingClientRect().top ?? 0;
      const lines = sectionSelectors
        .map((selector) => document.querySelector(selector)?.getBoundingClientRect().top)
        .filter((top): top is number => typeof top === "number")
        .map((top) => Math.max(0, Math.round(top - pageTop)));

      setHorizontalLines([...new Set(lines)]);
    };

    updateLines();

    const mutationObserver = new MutationObserver(updateLines);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", updateLines);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", updateLines);
    };
  }, []);

  return (
    <motion.div
      aria-hidden="true"
      className="landing-grid-overlay pointer-events-none absolute inset-0 z-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      {verticalLines.map((left) => (
        <span
          key={`vertical-${left}`}
          className="absolute top-0 h-full w-px bg-[rgba(255,255,255,0.13)]"
          style={{ left }}
        />
      ))}

      {horizontalLines.map((top) => (
        <span
          key={`horizontal-${top}`}
          className="absolute left-0 h-px w-full bg-[rgba(255,255,255,0.13)]"
          style={{ top }}
        />
      ))}

      {verticalLines.flatMap((left) =>
        horizontalLines.map((top) => (
          <span
            key={`cross-${left}-${top}`}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 before:absolute before:left-0 before:top-1/2 before:h-px before:w-3 before:-translate-y-1/2 before:bg-[rgba(255,255,255,0.34)] before:content-[''] after:absolute after:left-1/2 after:top-0 after:h-3 after:w-px after:-translate-x-1/2 after:bg-[rgba(255,255,255,0.34)] after:content-['']"
            style={{ left, top }}
          />
        ))
      )}
    </motion.div>
  );
}
