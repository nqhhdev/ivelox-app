# Phase 7 — Polish & PWA ❌

## Goal
Production-quality UX: loading states, error boundaries, PWA offline shell,
performance optimization, and accessibility pass.

## Depends On
All feature phases complete.

## 7.1 Loading & Error States
- Skeleton screens for all list pages (ExamList, Dashboard, Tips)
- TanStack Query `isLoading` / `isError` handled in every hook
- Global error boundary (`src/app/ErrorBoundary.tsx`)
- Toast notifications for submit success/failure (use shadcn `toast`)

## 7.2 PWA
```
vite-plugin-pwa  →  service worker + manifest
```
- App shell cached offline
- API requests network-first (no offline data — requires auth)
- Install prompt for mobile (Add to Home Screen)
- `manifest.json`: name=iVelox, theme_color, icons (192/512)

Install:
```bash
npm install -D vite-plugin-pwa
```

## 7.3 Performance
- Route-based code splitting: `React.lazy` + `Suspense` for all page components
- TanStack Query `staleTime: 5 * 60 * 1000` for exam content (rarely changes)
- Images: use `<img loading="lazy">` for exam images
- Bundle analysis: `npx vite-bundle-analyzer`

## 7.4 Accessibility
- All interactive elements keyboard-navigable
- `aria-label` on icon-only buttons
- Focus management on modal open/close
- Color contrast: AA minimum (Tailwind defaults pass for most)
- Screen reader test for audio player controls

## 7.5 Navigation
- Persistent sidebar/navbar with links: Dashboard, Exams, Tips
- Active route highlighting
- Mobile: bottom nav bar (Dashboard, Exams, Tips, Profile)
- Profile page: display name, target band, logout

## 7.6 Deployment (Vercel)
```
# vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
- Connect GitHub repo to Vercel
- Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
- Custom domain (optional)

## Tasks
- [ ] Add skeleton components to all list/detail pages
- [ ] Add global `ErrorBoundary`
- [ ] Add toast notifications
- [ ] Install and configure `vite-plugin-pwa`
- [ ] Add `manifest.json` and icons
- [ ] Wrap all page routes in `React.lazy` + `Suspense`
- [ ] Add persistent nav (desktop sidebar + mobile bottom bar)
- [ ] Build profile page
- [ ] Accessibility audit
- [ ] Deploy to Vercel
- [ ] `npx tsc --noEmit` clean
- [ ] Lighthouse score: Performance ≥ 90, Accessibility ≥ 90
