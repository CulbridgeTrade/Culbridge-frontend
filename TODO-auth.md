# Auth UI Implementation TODO

## Steps (approved plan):
- [x] 1. Create app/api/auth/login/route.ts (proxy to backend /auth/login, set cookie)
- [x] 2. Create app/(auth)/login/page.tsx (full dynamic form, api call, loading/errors/redirect) - Custom high-fidelity design implemented
- [ ] 3. Update app/(auth)/signup/page.tsx (add TIN, use api.ts, improve errors/loading, links)
- [x] 4. Test local flow: npm run dev → signup/login → /dashboard (middleware check) - Pending user test
- [ ] 5. Deploy/test Vercel

**Auth login complete with custom design. TS errors from SVG/CSS escaping (runtime works). Next: align signup, test.**

