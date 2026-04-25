// Domain warming: ramp daily volume on a fresh sender domain.
// New domains start at 50/day on day 0 and ~double every 24h until reaching the cap.

const DEFAULT_RAMP = [50, 100, 250, 500, 1000, 2000, 5000, 10_000];

export type WarmingState = {
  /** Day number since first send. */
  day: number;
  /** Cap for today. */
  todayCap: number;
  /** Sent so far today. */
  sentToday: number;
  /** True if we should still throttle. */
  warming: boolean;
};

export function computeWarmingState(args: {
  startedAt: Date | null;        // domain.warmingStartedAt
  sentToday: number;
  manualCap?: number;
  ramp?: number[];               // override the curve
}): WarmingState {
  const ramp = args.ramp ?? DEFAULT_RAMP;
  if (!args.startedAt) {
    return { day: 0, todayCap: ramp[0], sentToday: args.sentToday, warming: true };
  }
  const day = Math.floor((Date.now() - args.startedAt.getTime()) / 86_400_000);
  const cap = day >= ramp.length ? ramp[ramp.length - 1] : ramp[day];
  const todayCap = args.manualCap && args.manualCap < cap ? args.manualCap : cap;
  return {
    day,
    todayCap,
    sentToday: args.sentToday,
    warming: day < ramp.length - 1,
  };
}

/** Returns how many recipients we can still send to today on this domain. */
export function remainingBudget(state: WarmingState): number {
  return Math.max(0, state.todayCap - state.sentToday);
}
