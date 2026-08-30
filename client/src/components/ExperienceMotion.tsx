import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function RouteMotion({ routeKey, children }: { routeKey: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        data-route={routeKey}
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.16, ease: [0.23, 1, 0.32, 1] }}
        className="aq-route-shell"
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: reduceMotion ? 0 : 0.48, delay, ease: [0.23, 1, 0.32, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
