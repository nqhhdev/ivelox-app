import { tokens, type SkillKey } from './tokens'

const SKILL_ICONS: Record<SkillKey, string> = {
  reading: '📖',
  listening: '🎧',
  writing: '✍️',
  speaking: '🎤',
}

interface SkillTileProps {
  skill: SkillKey
  size?: number
}

export function SkillTile({ skill, size = 40 }: SkillTileProps) {
  const s = tokens.skills[skill]
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: s.soft,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.45,
      flexShrink: 0,
      border: `1px solid ${s.color}22`,
    }}>
      {SKILL_ICONS[skill]}
    </div>
  )
}
