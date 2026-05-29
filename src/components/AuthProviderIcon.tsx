type AuthProviderIconId = 'google' | 'discord' | 'twitch'

type AuthProviderIconProps = {
  provider: AuthProviderIconId
  className?: string
}

const ICON_PATHS: Record<AuthProviderIconId, { svg: string; png: string }> = {
  google: {
    svg: '/auth/google-color-icon.svg',
    png: '/auth/google-color-icon.png',
  },
  discord: {
    svg: '/auth/discord-color-icon.svg',
    png: '/auth/discord-color-icon.png',
  },
  twitch: {
    svg: '/auth/twitch-color-icon.svg',
    png: '/auth/twitch-color-icon.png',
  },
}

export function AuthProviderIcon({ provider, className }: AuthProviderIconProps) {
  const { svg, png } = ICON_PATHS[provider]
  return (
    <picture>
      <source srcSet={svg} type="image/svg+xml" />
      <img
        src={png}
        alt=""
        className={className}
        width={18}
        height={18}
        aria-hidden="true"
      />
    </picture>
  )
}
