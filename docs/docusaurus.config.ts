import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'AREA Project',
  tagline: 'Technical Documentation for the Action-Reaction Platform',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://area-organization.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/main-area/',

  // GitHub pages deployment config.
  organizationName: 'Area-Organization', // Votre organisation GitHub
  projectName: 'main-area', // Le nom de votre dépôt

  onBrokenLinks: 'throw',

  // Correction de l'avertissement de dépréciation


  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          // La ligne 'sidebarPath' a été supprimée pour permettre la génération automatique
          // Mettez à jour avec votre dépôt
          editUrl:
            'https://github.com/Area-Organization/main-area/tree/main/docs/',
          // Affiche la documentation à la racine du site
          routeBasePath: '/',
        },
        // Le blog est désactivé car non nécessaire pour cette documentation
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Remplacer par une image de carte sociale de votre projet si vous en avez une
    // image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AREA Documentation',
      logo: {
        alt: 'AREA Project Logo',
        src: 'img/logo.svg', // Assurez-vous d'avoir un logo dans static/img/
      },
      items: [
        {
          type: 'docSidebar',
          // === CORRECTION ICI ===
          sidebarId: 'defaultSidebar', // L'ID correct est 'defaultSidebar'
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/Area-Organization/main-area',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [], // Les liens du footer ont été simplifiés
      copyright: `Copyright © ${new Date().getFullYear()} AREA Project. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;