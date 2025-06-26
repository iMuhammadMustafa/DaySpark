# Deploying to Vercel

This document provides instructions on how to deploy the application to Vercel and set up a CI/CD pipeline.

## Prerequisites

- A Vercel account.
- The Vercel CLI installed.
- A GitHub account.
- The project pushed to a GitHub repository.

## Deployment Steps

1.  **Login to Vercel:**
    Open your terminal and run the following command to log in to your Vercel account:

    ```bash
    vercel login
    ```

2.  **Link the project:**
    Navigate to the root directory of your project in the terminal and run the following command to link your project to Vercel:

    ```bash
    vercel link
    ```

    Follow the prompts to link the project to a new or existing Vercel project.

3.  **Deploy the project:**
    After linking the project, you can deploy it by running the following command:
    ```bash
    vercel
    ```
    This command will create a preview deployment. To deploy to production, use the `--prod` flag:
    ```bash
    vercel --prod
    ```

## CI/CD Pipeline

Vercel automatically sets up a CI/CD pipeline when you connect your GitHub repository to your Vercel project. This means that every time you push a new commit to your repository, Vercel will automatically build and deploy the changes.

### Configuring Environment Variables

You need to add the secrets from your `.env` file to your Vercel project's environment variables.

1.  Go to your project's settings on the Vercel dashboard.
2.  Navigate to the "Environment Variables" section.
3.  Add the following environment variables:
    - `VITE_SUPABASE_URL`: The URL of your Supabase project.
    - `VITE_SUPABASE_PUBLISHABLE_KEY`: The publishable key of your Supabase project.

### Build Settings

Vercel will automatically detect that you are using Vite and configure the build settings accordingly. You can view and override these settings in the "Build & Development Settings" section of your project's settings on the Vercel dashboard.
