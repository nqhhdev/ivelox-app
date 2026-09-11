/** Public portfolio copy — curated from CV + public OSS. Claims without numbers stay unlabeled. */

export const portfolioContent = {
  brand: 'iVelox',
  githubUser: 'nqhhdev',
  name: 'Nguyen Quang Huy',
  title: 'Senior Flutter Engineer',
  location: 'Hanoi, Vietnam',
  email: 'nqhh.dev@gmail.com',
  phone: '+84 869 833 269',
  positioning:
    'Senior Flutter engineer for production-hard apps: realtime/E2EE, email protocol, fintech security, multi-store CI/CD.',
  tagline:
    'I ship Flutter apps that survive production constraints: encrypted chat, protocol-level email, regulated finance, and multi-store release.',
  pitch: [
    'Six years of Flutter/Dart in production — not demos. The work that is hard to fake is still the same: decrypting Matrix push on iOS without leaking plaintext, talking JMAP instead of a fake inbox, KYC and bank-linking under store review, and owning App Store / Play / AppGallery signing.',
    'I am not positioning as a full-stack or “AI engineer”. I use AI to outline, scaffold, and review. Architecture, crypto boundaries, and failure paths stay mine.',
  ],
  proofs: [
    {
      value: '6+ yrs',
      label: 'Flutter in production',
    },
    {
      value: 'Twake',
      label: 'Mail + Chat core work',
    },
    {
      value: '3 stores',
      label: 'iOS · Android · Huawei',
    },
  ],
  tags: [
    'Flutter',
    'Dart',
    'Swift',
    'Matrix',
    'JMAP',
    'E2EE',
    'Fintech',
    'KYC',
    'CI/CD',
  ],
} as const

export const caseStudies = [
  {
    slug: 'twake-chat',
    featured: true,
    role: 'Senior Flutter Engineer',
    company: 'Twake Chat · Linagora',
    period: '12/2022 – 09/2024',
    title: 'Encrypted Matrix chat that has to work on a locked iPhone',
    lede: 'iOS would not decrypt rich push in the background. The job was to keep Matrix E2EE, still notify the user, and never put plaintext on a notification server.',
    problem:
      'Twake Chat is a federated Matrix client. Production constraints are the protocol, not the chat UI: E2EE rooms, federation, voice messages, and push that still makes sense when the process is dead.',
    constraints: [
      'Matrix E2EE: ciphertext on the wire; keys stay on device.',
      'iOS Notification Service Extension runs in a tight sandbox and time budget.',
      'SSO/WebView login is flaky under E2E unless the test owns the WebView.',
      'Must stay a Flutter app across mobile — native only where the OS forces it.',
    ],
    approach: [
      'Real-time messaging and E2EE rooms through the Matrix SDK, not a custom protocol.',
      'iOS Notification Service Extension + Matrix push rules so a locked device can show a decrypted preview without shipping plaintext to the push provider.',
      'Voice messages without dragging a full FFmpeg binary into the app when a WAV merge path was enough.',
      'Patrol E2E around SSO/WebView login; Scrum Master for a 5-person team.',
    ],
    hardest:
      'The NSE boundary. The extension is not the Flutter engine. Session pickle / key material has to be reachable from an App Group, decrypt has to finish before iOS kills the extension, and a failure must degrade to a generic “new message” — never a half-decrypted body, never a key dumped into logs.',
    outcome:
      'Shipped as a production Matrix client (open source: linagora/twake-on-matrix). Public work includes jump-to-event scrolling, file-caption edge cases, the FluffyChat → Twake Chat package rename, and a Riverpod migration of the verify-device flow. No crash-rate or latency numbers published here — those live in private dashboards.',
    unmeasured: 'Push decrypt success rate, NSE time-budget misses, and Patrol flake rate are not public.',
    links: [
      { label: 'twake-on-matrix', href: 'https://github.com/linagora/twake-on-matrix' },
      {
        label: 'PR: jump-to-event',
        href: 'https://github.com/linagora/twake-on-matrix/pull/3309',
      },
      {
        label: 'PR: verify-device → Riverpod',
        href: 'https://github.com/linagora/twake-on-matrix/pull/3292',
      },
    ],
  },
  {
    slug: 'tmail',
    featured: true,
    role: 'Senior Flutter Engineer',
    company: 'Twake Mail · Linagora',
    period: '12/2022 – 09/2024',
    title: 'A JMAP mail client, not an IMAP wrapper with extra steps',
    lede: 'Tmail is a cross-platform Flutter email client on JMAP. The product is the protocol and the offline cache, not another composer skin.',
    problem:
      'Most Flutter “mail” samples fake the backend. Tmail talks JMAP: mailbox tree, threading, search, composer, and a cache that has to survive airplane mode without corrupting server state on the way back.',
    constraints: [
      'JMAP, not IMAP-in-a-WebView.',
      'Hive as the offline cache — conflicts are real, not theoretical.',
      'HTML composer in a WebView: assets and base URLs break the moment you leave a happy-path draft.',
      'Open-source review bar: CI, community review, design-system typography.',
    ],
    approach: [
      'Owned mailbox, threading, search, and composer flows on the Flutter client.',
      'Hive for offline; sync is a loop with conflict, not a dump-and-replace.',
      'enough_html_editor: baseUrlResolver so composer assets load inside the WebView instead of 404ing.',
      'Design-system work (TwakeInter inheritance) so mail UI does not fork type tokens from chat.',
    ],
    hardest:
      'Offline-first mail. A draft, a moved message, and a server-side filter can all mutate the same thread. The cache has to be the source of UI truth without becoming the source of protocol truth. Getting that wrong looks like “mail disappeared” to the user and “duplicate append” to the server.',
    outcome:
      'Core contributor on linagora/tmail-flutter (public, ~650★ class). Work is reviewable: merged PRs on typography inheritance and HTML editor asset loading. Exact star counts move; the repo is the source of truth.',
    unmeasured: 'Sync conflict rate and search latency are not published.',
    links: [
      { label: 'tmail-flutter', href: 'https://github.com/linagora/tmail-flutter' },
      {
        label: 'PR: typography inheritance',
        href: 'https://github.com/linagora/tmail-flutter/pull/4749',
      },
      {
        label: 'PR: HTML editor baseUrlResolver',
        href: 'https://github.com/linagora/enough_html_editor/pull/43',
      },
    ],
  },
  {
    slug: 'vault22',
    featured: true,
    role: 'Senior Flutter Engineer',
    company: 'Vault22 · SmartDev',
    period: '09/2024 – Present',
    title: 'Personal finance under KYC, bank-link, and three app stores',
    lede: 'Vault22 is budgeting, debt/insurance tracking, and multi-asset investing. The hard parts are identity, secrets, and release — not the charts.',
    problem:
      'A wealth app that cannot onboard (KYC), cannot link a bank, or cannot ship a signed build to Huawei is not a product. I joined a ~30-person cross-functional team to own those production surfaces.',
    constraints: [
      'Regulated-adjacent flows: Smile Identity KYC + liveness, Lean bank linking, reCAPTCHA Enterprise.',
      'Secrets on device: client-side encryption, secure storage, Google Sign-In that does not leak tokens into logs.',
      'Three stores: App Store, Google Play, Huawei AppGallery — different signing, different review.',
      'CI on Bitrise; Isolates for heavy work; FCM + CleverTap + HMS.',
    ],
    approach: [
      'Integrated Smile Identity, Lean (WebView token exchange), reCAPTCHA Enterprise, secure Google Sign-In.',
      'Client-side encryption and isolate offload so crypto/image work does not jank the UI isolate.',
      'Owned multi-store release: signing, App Store Connect API uploads, Huawei pipeline.',
      'Quality bar in a large team: coverage, stability, review — not hero-feature dumps.',
    ],
    hardest:
      'Bank linking via WebView. The token exchange is a one-shot: if the redirect is swallowed, if JavaScript injection logs a code, or if the session outlives logout, you have an incident. Same class of bug as KYC liveness — the failure path (drop, timeout, face mismatch, jailbreak) is the product, not the green checkmark.',
    outcome:
      'Still in production (present role). Public numbers for conversion, crash-free, or Bitrise minutes saved are not mine to publish. The claim here is ownership of KYC, bank-link, encryption, and three-store release — not a vanity metric.',
    unmeasured:
      'KYC pass rate, bank-link completion, CI wall-clock, crash-free sessions — private.',
    links: [],
  },
  {
    slug: 'moonfit',
    featured: true,
    role: 'Flutter Developer / Product Owner',
    company: 'MoonFit · Giong Network',
    period: '12/2021 – 12/2022',
    title: 'Watch + HealthKit + wallets — a move-to-earn app with a native boundary',
    lede: 'MoonFit tracked runs, minted MoonBeast NFTs, and paid wallet rewards. Flutter ran the phone app. The watch and HealthKit did not.',
    problem:
      'GPS distance and calories are easy to fake in a demo and hard to defend when Apple Watch, HealthKit, and an on-chain claim all have to agree enough for a reward.',
    constraints: [
      'Apple Watch companion: WatchKit, HealthKit, CoreLocation, MapKit — Swift, not a Flutter plugin wish.',
      'Wallet surface: MetaMask, WalletConnect, SubWallet and on-chain claim flows.',
      'Maps route processing for distance/calories on device.',
      'I also wore a PO hat: roadmap and mentoring, not only tickets.',
    ],
    approach: [
      'GPS run-tracking and Maps route processing on the Flutter side.',
      'Native watch companion for sensors Apple will not give a Dart isolate.',
      'WalletConnect / MetaMask / SubWallet for claim flows — adapters, not a homegrown chain.',
    ],
    hardest:
      'The Flutter/native boundary. Health samples, location, and a watch session live in OS frameworks. The Dart side wants a single “run”. If you pretend that is one isolate, you ship desynced calories and angry store review notes. Treat WatchKit/HealthKit as a second app that happens to share a brand.',
    outcome:
      'Shipped as a consumer Web3 lifestyle app. MoonFit is proof that I have done wallets + HealthKit, not a reason to build another move-to-earn clone. No public token or DAU figures here.',
    unmeasured: 'Active users, on-chain claim success, HealthKit sample loss — not public.',
    links: [],
  },
] as const

export const earlierWork = [
  {
    role: 'Flutter Developer',
    company: 'TILT · FPT Software',
    period: '12/2020 – 12/2021',
    summary:
      'Golf coaching video-analysis: Isolates for the video pipeline, OpenPose / NVIDIA / Google AI pose viz, annotation, side-by-side playback, AWS, store releases.',
  },
  {
    role: 'Flutter Developer',
    company: 'AngelHub · VMO Group',
    period: '12/2019 – 11/2020',
    summary:
      'Deal-by-deal co-investment: profiles, dynamic forms, payments, watermarked media, FCM/APNs, App Store & Play.',
  },
  {
    role: 'Flutter Developer',
    company: 'SCM Connext · VMO Group',
    period: '09/2018 – 01/2020',
    summary: 'Social-commerce ordering: Home, Profile, Checkout, Payment; GitLab CI + Fastlane.',
  },
] as const

export const ossHighlights = [
  {
    repo: 'linagora/twake-on-matrix',
    blurb: 'Matrix client — jump-to-event, captions, package rename, verify-device Riverpod migration.',
    url: 'https://github.com/linagora/twake-on-matrix',
    prs: [
      {
        title: 'Jump-to-event with improved scrolling',
        url: 'https://github.com/linagora/twake-on-matrix/pull/3309',
      },
      {
        title: 'File caption shown on files sent without a caption',
        url: 'https://github.com/linagora/twake-on-matrix/pull/3307',
      },
      {
        title: 'Rename package FluffyChat → Twake Chat',
        url: 'https://github.com/linagora/twake-on-matrix/pull/3306',
      },
      {
        title: 'Verify-device flow → Riverpod (part III)',
        url: 'https://github.com/linagora/twake-on-matrix/pull/3292',
      },
    ],
  },
  {
    repo: 'linagora/tmail-flutter',
    blurb: 'JMAP Flutter mail client — core contributor, design-system and composer/WebView work.',
    url: 'https://github.com/linagora/tmail-flutter',
    prs: [
      {
        title: 'Inherit typography from TwakeInter design system',
        url: 'https://github.com/linagora/tmail-flutter/pull/4749',
      },
    ],
  },
  {
    repo: 'linagora/enough_html_editor',
    blurb: 'HTML composer used by Twake Mail — WebView asset loading.',
    url: 'https://github.com/linagora/enough_html_editor',
    prs: [
      {
        title: 'baseUrlResolver for WebView asset loading',
        url: 'https://github.com/linagora/enough_html_editor/pull/43',
      },
    ],
  },
  {
    repo: 'funwithflutter/inview_notifier_list',
    blurb: 'Contributor — Flutter viewport detection package.',
    url: 'https://github.com/funwithflutter/inview_notifier_list',
    prs: [],
  },
] as const

export const blogPosts = [
  {
    slug: 'matrix-nse-decrypt',
    status: 'queued' as const,
    title: 'Decrypt Matrix push on iOS with a Notification Service Extension',
    date: 'Queued',
    related: 'twake-chat',
    abstract:
      'Why the Flutter isolate is the wrong place for a locked-phone preview, how App Group + pickle meet the NSE time budget, and what you show when decrypt fails.',
  },
  {
    slug: 'unable-to-decrypt',
    status: 'queued' as const,
    title: 'Unable to decrypt: the UX and the key, not the bubble',
    date: 'Queued',
    related: 'twake-chat',
    abstract:
      'UTD is a session problem. Cover Megolm gaps, verification, and what not to log.',
  },
  {
    slug: 'voice-wav-no-ffmpeg',
    status: 'queued' as const,
    title: 'Voice messages: WAV merge without shipping FFmpeg',
    date: 'Queued',
    related: 'twake-chat',
    abstract:
      'Why a native codec binary is the wrong default in a Matrix client, and where that choice breaks.',
  },
  {
    slug: 'jmap-vs-imap',
    status: 'queued' as const,
    title: 'JMAP vs IMAP on Flutter — why the protocol is the product',
    date: 'Queued',
    related: 'tmail',
    abstract:
      'Mailbox state, push, and search as protocol features. What a Flutter client should not re-implement.',
  },
  {
    slug: 'hive-jmap-conflicts',
    status: 'queued' as const,
    title: 'Offline-first JMAP with Hive: what a real sync conflict looks like',
    date: 'Queued',
    related: 'tmail',
    abstract:
      'Draft vs server thread vs mailbox move. Cache as UI truth, server as protocol truth.',
  },
  {
    slug: 'patrol-webview-sso',
    status: 'queued' as const,
    title: 'Patrol E2E for WebView SSO — the flake is the test',
    date: 'Queued',
    related: 'twake-chat',
    abstract:
      'Timeouts, cookies, and first-frame mounts. How we made SSO tests boring.',
  },
  {
    slug: 'kyc-liveness-failures',
    status: 'queued' as const,
    title: 'KYC + liveness on Flutter: Smile Identity beyond the happy path',
    date: 'Queued',
    related: 'vault22',
    abstract:
      'Timeout, face mismatch, jailbreak, drop. Failure states are the feature.',
  },
  {
    slug: 'lean-webview-tokens',
    status: 'queued' as const,
    title: 'Lean bank linking: WebView token exchange and the holes around it',
    date: 'Queued',
    related: 'vault22',
    abstract:
      'Redirect swallowing, logging codes, session vs logout. A checklist, not a tutorial to copy-paste secrets.',
  },
] as const

export const nowItems = [
  {
    title: 'This site',
    body: 'Restructured i-velox.app around four production case studies, public PRs, and a blog backlog — not a CV dump. Theme stays; the story changes.',
  },
  {
    title: 'Matrix + E2EE Flutter notes',
    body: 'Next public asset is not another generic messenger. It is production notes / a thin kit around NSE decrypt, UTD, and push — the layer FluffyChat and Twake already paid for in blood.',
  },
  {
    title: 'Linagora OSS',
    body: 'Still in the Twake Chat / Twake Mail / design-system repos. Preference: one more weighted PR in the same ecosystem over ten drive-by packages.',
  },
  {
    title: 'Not doing',
    body: 'No game clone, no neo-bank, no Slack/Gmail skin, no “AI engineer” rebrand. Office protocol + fintech mobile production only.',
  },
] as const

export const languages = [
  { name: 'Vietnamese', level: 'Native' },
  { name: 'English', level: 'Professional working proficiency' },
] as const

export const signOff =
  'If you need a Flutter app that has to live under a protocol, a regulator, or three stores — write. If you need a pretty CRUD kit, I am the wrong hire.'

export type GithubProfile = {
  login: string
  name: string | null
  bio: string | null
  avatarUrl: string
  htmlUrl: string
  location: string | null
  publicRepos: number
  followers: number
  following: number
}

export type PortfolioProject = {
  id: string
  name: string
  description: string
  url: string
  language: string | null
  stars: number
  forks: number
  updatedAt: string
}

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug)
}

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug)
}
