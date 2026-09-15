export type JointCallout = {
  id: string
  label: string
  position: [number, number, number]
  mobility: number | null
  inflammation: 'Low' | 'Moderate' | 'High' | '—'
}

export const JOINTS: JointCallout[] = [
  { id: 'shoulder', label: 'Shoulder', position: [0.28, 1.25, 0.05], mobility: null, inflammation: '—' },
  { id: 'elbow', label: 'Elbow', position: [0.42, 0.95, 0.02], mobility: null, inflammation: '—' },
  { id: 'wrist', label: 'Wrist', position: [0.48, 0.62, 0.02], mobility: null, inflammation: '—' },
  { id: 'hip', label: 'Hip', position: [0.14, 0.72, 0.04], mobility: null, inflammation: '—' },
  { id: 'knee', label: 'Knee', position: [0.14, 0.38, 0.06], mobility: null, inflammation: '—' },
  { id: 'ankle', label: 'Ankle', position: [0.12, 0.08, 0.04], mobility: null, inflammation: '—' },
]
