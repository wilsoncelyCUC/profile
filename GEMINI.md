# Project Overview

This is a personal portfolio website for Wilson Cely, built with the [Astro](https://astro.build/) framework. The site is designed to be a static site, deployed to GitHub Pages.

## Key Technologies

*   **Astro:** The core framework for building the site.
*   **Tailwind CSS:** Used for styling the site.
*   **Alpine.js:** Used for interactive components.
*   **MDX:** Used for writing content in Markdown with JSX components.

## Project Structure

The project follows a standard Astro project structure:

*   `src/pages`: Contains the main pages of the site (`index.astro`, `preview.astro`, `value.astro`).
*   `src/components`: Contains reusable UI components, organized into subdirectories:
    *   `layout`: Components for the overall page structure (e.g., `Header.astro`, `BaseHead.astro`).
    *   `pages`: Components that represent entire pages (e.g., `LandingPage.astro`).
    *   `sections`: Components that represent sections of a page (e.g., `Hero.astro`, `Services.astro`).
    *   `ui`: Smaller, reusable UI elements (e.g., `CaseStudyCard.astro`).
*   `src/layouts`: Contains the main layout for the pages (`ValueLayout.astro`).
*   `src/content`: Contains the content for the services and case studies, managed as Astro content collections. The schema for these collections is defined in `src/content/config.ts`.
*   `public`: Contains static assets like images and CSS.
*   `astro.config.mjs`: The main configuration file for the Astro project.
*   `package.json`: Defines the project's dependencies and scripts.

# Building and Running

The following scripts are available in `package.json`:

*   **`npm run dev`**: Starts the development server at `http://localhost:4321`.
*   **`npm run build`**: Builds the static site to the `dist/` directory.
*   **`npm run preview`**: Starts a local server to preview the built site.

# Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. Utility classes should be used whenever possible. Global styles are defined in `src/styles/global.css`.
*   **Components:** Components are written as `.astro` files. They should be organized into the appropriate subdirectories within `src/components`.
*   **Content:** Content for services and case studies is managed as Markdown files in the `src/content` directory. The structure of this content is defined by the schemas in `src/content/config.ts`.
