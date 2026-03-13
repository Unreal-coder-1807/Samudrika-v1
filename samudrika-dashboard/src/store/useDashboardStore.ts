import { create } from 'zustand'
import type { ScoredFrame, ThreatLevel } from '../types/detection.types'

interface DashboardState {
  frames: ScoredFrame[]
  addFrame: (frame: ScoredFrame) => void
  clearFrames: () => void
  getThreatCount: (level: ThreatLevel) => number
  getLatestFrame: () => ScoredFrame | null
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  frames: [],
  addFrame: (frame) => set((state) => ({ frames: [...state.frames, frame] })),
  clearFrames: () => set({ frames: [] }),
  getThreatCount: (level) =>
    get().frames.reduce(
      (acc, frame) =>
        acc +
        frame.scored_detections.filter((det) => det.threat_level === level).length,
      0,
    ),
  getLatestFrame: () => {
    const { frames } = get()
    return frames.length ? frames[frames.length - 1] : null
  },
}))
