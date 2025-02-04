# Megalithic Sites Map

An interactive web application for exploring megalithic sites around the world. Built with Next.js, React, and MapLibre GL.

## Features

- Interactive map interface showing megalithic sites
- Clickable markers with site information
- Responsive design for all devices
- Sample dataset of famous megalithic structures

## Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Get a MapTiler API key:

   - Sign up at [MapTiler](https://www.maptiler.com/)
   - Create a new API key
   - Replace `YOUR_MAPTILER_KEY` in `src/app/components/Map.tsx` with your actual key

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

## Technologies Used

- Next.js 13+ with App Router
- React 18
- MapLibre GL JS (via react-map-gl)
- Tailwind CSS
- TypeScript

## TODO

- [ ] Add more megalithic sites to the database
- [ ] Implement filtering and search functionality
- [ ] Add detailed information panels for each site
- [ ] Implement clustering for markers when zoomed out
- [ ] Add user contribution features
