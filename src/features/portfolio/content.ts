/** Public portfolio copy — sourced from CV (Senior Mobile Engineer / Flutter). */

export const portfolioContent = {
  brand: 'iVelox',
  githubUser: 'nqhhdev',
  name: 'Nguyen Quang Huy',
  title: 'Senior Mobile Engineer — Flutter',
  location: 'Hanoi, Vietnam',
  email: 'nqhh.dev@gmail.com',
  phone: '+84 869 833 269',
  tagline:
    'A specialist in shipping production Flutter apps — fintech, secure communications, and Web3 — with sci-fi attention to craft and systems depth.',
  pitch: [
    'Senior Mobile Engineer with 6+ years building and shipping production apps, including 6 years specializing in Flutter/Dart across fintech, secure communications, and Web3 products.',
    'I work across the full delivery lifecycle — architecture, feature development, testing, code review, CI/CD, and multi-store release management (App Store, Google Play, Huawei AppGallery) — and I am comfortable owning a feature from spec to production.',
    'Strong with Clean Architecture and modern state management (Bloc, Riverpod, GetX), secure data handling (encryption, KYC, secure storage), and third-party SDK integration. Active open-source contributor to large, real-world codebases (Matrix and JMAP clients). Native iOS experience in Swift for WatchKit, push notification extensions, and HealthKit.',
  ],
  tags: [
    'Flutter',
    'Dart',
    'Swift',
    'Clean Architecture',
    'Bloc',
    'Riverpod',
    'GetX',
    'Fintech',
    'KYC',
    'Web3',
    'Matrix',
    'JMAP',
    'CI/CD',
    'Bitrise',
    'Fastlane',
  ],
  skills: [
    {
      heading: 'Languages & mobile',
      items: ['Dart', 'Swift', 'Flutter (iOS · Android · Huawei)', 'Native iOS (SwiftUI, UIKit)'],
    },
    {
      heading: 'Architecture & state',
      items: ['Clean Architecture', 'MVVM', 'Bloc', 'Riverpod', 'GetX', 'Provider', 'GetIt', 'GoRouter'],
    },
    {
      heading: 'Data & platform',
      items: [
        'Dio / Retrofit / REST / WebSocket',
        'Hive · Freezed · Flutter Secure Storage',
        'Firebase · CleverTap · MoEngage',
        'Matrix · JMAP',
      ],
    },
    {
      heading: 'Security · fintech · Web3',
      items: [
        'KYC (Smile Identity)',
        'Bank linking (Lean SDK)',
        'reCAPTCHA Enterprise',
        'Client-side encryption',
        'MetaMask · WalletConnect · SubWallet',
      ],
    },
    {
      heading: 'Delivery',
      items: [
        'Bitrise · GitLab CI · Fastlane',
        'App Store / Play / AppGallery releases',
        'Unit · widget · Patrol E2E',
        'Agile / Scrum (Scrum Master experience)',
      ],
    },
  ],
  experience: [
    {
      role: 'Senior Flutter Engineer',
      company: 'Vault22 · SmartDev',
      period: '09/2024 – Present',
      summary:
        'Personal finance & wealth-management platform: budgeting, debt/insurance tracking, and multi-asset investing.',
      bullets: [
        'Core features in a ~30-person cross-functional team with focus on quality, stability, and coverage.',
        'Owned multi-store release management (iOS / Android / Huawei) including signing and App Store Connect API uploads.',
        'Integrated Smile Identity KYC, Lean bank linking, reCAPTCHA Enterprise, and secure Google Sign-In.',
        'Client-side encryption, Isolates, FCM, CleverTap, Huawei HMS; optimized Bitrise CI/CD.',
      ],
    },
    {
      role: 'Senior Flutter Engineer',
      company: 'Twake Chat & Tmail · Linagora',
      period: '12/2022 – 09/2024',
      summary:
        'Open-source Matrix chat and JMAP email clients — real-time sync, E2EE, and cross-platform Flutter.',
      bullets: [
        'Real-time messaging, federation, and E2EE rooms via Matrix SDK; iOS NSE for rich decrypted push.',
        'Voice messages, Patrol E2E for SSO/WebView login; Scrum Master for a 5-person team.',
        'Tmail: mailbox, threading, search, composer; Hive offline cache; community reviews & CI.',
      ],
    },
    {
      role: 'Flutter Developer / Product Owner',
      company: 'MoonFit · Giong Network',
      period: '12/2021 – 12/2022',
      summary: 'Web3 move-to-earn lifestyle app with MoonBeast NFTs and wallet rewards.',
      bullets: [
        'GPS run-tracking and Maps route processing for distance/calories.',
        'MetaMask, WalletConnect, SubWallet and on-chain claim flows.',
        'Apple Watch companion (WatchKit, HealthKit, CoreLocation, MapKit); product roadmapping & mentoring.',
      ],
    },
    {
      role: 'Flutter Developer',
      company: 'TILT · FPT Software',
      period: '12/2020 – 12/2021',
      summary: 'Golf coaching video-analysis app with pose tracking and TikTok-style editing.',
      bullets: [
        'Reworked video pipeline with Isolates; OpenPose / NVIDIA / Google AI pose visualization.',
        'Annotation tools, side-by-side playback; AWS storage and store releases.',
      ],
    },
    {
      role: 'Flutter Developer',
      company: 'AngelHub · VMO Group',
      period: '12/2019 – 11/2020',
      summary: 'Tech investment platform for deal-by-deal co-investment.',
      bullets: [
        'Profiles, dynamic forms, payments, watermarked media upload, invitations.',
        'REST + FCM/APNs; App Store & Play releases; mentoring.',
      ],
    },
    {
      role: 'Flutter Developer',
      company: 'SCM Connext · VMO Group',
      period: '09/2018 – 01/2020',
      summary: 'Social-commerce ordering app for teams, shopping, and delivery.',
      bullets: [
        'Home, Profile, Checkout, Payment; GitLab CI + Fastlane for store automation.',
      ],
    },
  ],
  openSource: [
    {
      name: 'linagora/tmail-flutter',
      blurb: 'Core contributor — cross-platform JMAP email client.',
      url: 'https://github.com/linagora/tmail-flutter',
    },
    {
      name: 'twake-on-matrix',
      blurb: 'Contributor — decentralized Matrix chat client.',
      url: 'https://github.com/linagora/twake-on-matrix',
    },
    {
      name: 'inview_notifier_list',
      blurb: 'Contributor — Flutter package for viewport detection.',
      url: 'https://github.com/funwithflutter/inview_notifier_list',
    },
  ],
  languages: [
    { name: 'Vietnamese', level: 'Native' },
    { name: 'English', level: 'Professional working proficiency' },
  ],
  signOff: 'Thanks for your interest — happy to discuss your next mobile build.',
} as const

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
