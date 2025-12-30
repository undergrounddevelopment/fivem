@echo off
echo Cleaning ALL wrong database env vars...

REM Remove all wrong database variants
for %%v in (FIVEM_ Fivem_ fivem_ fivem1_ fivem2_ fivemvip_ NEON_) do (
  vercel env rm %%vPOSTGRES_URL production --yes 2>nul
  vercel env rm %%vSUPABASE_URL production --yes 2>nul
  vercel env rm %%vSUPABASE_ANON_KEY production --yes 2>nul
  vercel env rm NEXT_PUBLIC_%%vSUPABASE_URL production --yes 2>nul
  vercel env rm NEXT_PUBLIC_%%vSUPABASE_ANON_KEY production --yes 2>nul
)

echo Done cleaning!
vercel --prod
