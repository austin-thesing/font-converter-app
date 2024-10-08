# Font Converter App

This is a [Next.js](https://nextjs.org/) project that allows users to convert fonts from OTF/TTF formats to WOFF and WOFF2 formats. The app provides a simple interface for uploading font files and downloading the converted versions.

## Features

- Convert OTF/TTF fonts to WOFF and WOFF2 formats
- Display original and converted file sizes
- Easy-to-use interface with drag-and-drop file upload
- Server-side font conversion using `fonteditor-core`
- Analytics integration with PostHog
- File storage using Cloudflare R2

## Getting Started

First, install the dependencies:

```bash
npm install fonteditor-core @next/font posthog-js
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

When deploying to a hosting platform, make sure to set the following environment variables:

- `CLOUDFLARE_ENDPOINT`
- `CLOUDFLARE_ACCESS_KEY_ID`
- `CLOUDFLARE_SECRET_ACCESS_KEY`
- `CLOUDFLARE_BUCKET_NAME`
- `PUBLIC_BUCKET_URL`
- `POSTHOG_KEY`
- `POSTHOG_HOST`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

When deploying, make sure to add the environment variables mentioned above to your Vercel project settings.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
