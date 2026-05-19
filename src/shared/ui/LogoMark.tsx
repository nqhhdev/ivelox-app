interface LogoMarkProps {
  width?: number
}

export function LogoMark({ width = 240 }: LogoMarkProps) {
  return (
    <img
      src="/text-logo.svg"
      alt="iVelox"
      style={{
        display: 'block',
        width,
        height: 'auto',
        objectFit: 'contain',
      }}
    />
  )
}
