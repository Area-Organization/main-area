# Documentation Website

This directory contains the source code for the **Technical Documentation Website** of the AREA project, built using [Docusaurus](https://docusaurus.io/).

> **Note:** This README is for the documentation site only. To run the main AREA application (Backend/Web/Mobile), please refer to the `Installation & Démarrage` section within the documentation itself.

## Installation

Install dependencies for the documentation site:

```bash
yarn
```

## Local Development

Start the documentation server locally:

```bash
yarn start
```

This command opens a browser window at `http://localhost:3000`. Most changes are reflected live.

## Build

Generate static files for production:

```bash
yarn build
```

The content will be generated in the `build` directory.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```
