# Developer Reflection

Building the AI Spend Audit tool has been an incredibly rewarding sprint. My goal was to create a highly polished, professional-grade Next.js application that not only functions flawlessly but looks like a premium SaaS product. I'm really proud of how the UI came together—the New York style shadcn components paired with Tailwind animations give the app a snappy, trustworthy feel.

### Real Bugs & Technical Challenges

While the development experience was largely positive, I hit a few specific technical roadblocks that forced me to dig deep:

1. **Next.js Hydration Mismatch with `localStorage`**
   I wanted the `SubscriptionForm` to remember user inputs if they accidentally refreshed. I initially read from `localStorage` directly in the component's state initialization. This caused a classic Next.js hydration error because the server-rendered HTML didn't match the client HTML (which had the local storage data). 
   *Fix:* I implemented a two-pass render using a `useEffect` and an `isHydrated` state flag. The form renders a loading skeleton on the server and only hydrates the real data once the client has mounted.

2. **Gemini API Versioning (`[404 Not Found] models/gemini-pro`)**
   When setting up the summary API route, I initially targeted the `gemini-pro` model. However, I kept hitting a 500 error where the Google Generative AI SDK complained that `gemini-pro` was not found for API version `v1beta`. 
   *Fix:* I researched the latest model endpoints and updated the code to use `gemini-2.5-flash`, which is not only faster and fully supported, but also much cheaper for our short-form summarization needs. I also built out a robust fallback text generator so the UI never breaks even if the API key is missing.

3. **Supabase Client Component Issues**
   When building the "Share Results" feature, I initially tried to pass the entire Supabase client instance down as a prop. This caused serialization errors in Next.js Server Components. 
   *Fix:* I shifted the database insertion to a dedicated Next.js API route (`/api/audits/share`). The client now just sends a simple JSON POST request with the audit payload and a UUID, keeping the client bundle smaller and securely hiding the service role key.

### Looking Forward
Overall, utilizing the App Router alongside Tailwind made iterating on the design incredibly fast. The constraint of keeping the audit logic deterministic (hardcoded rules vs AI) was a great decision—it keeps the app lightning fast and the recommendations mathematically sound, leaving the AI specifically for the executive summary.
