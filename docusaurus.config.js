// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// ---------------------------------------------------------------------------
// EDIT THESE TWO VALUES before you deploy:
//   GITHUB_ORG  -> your GitHub username or organization
//   GITHUB_REPO -> the repository name this site will live in
// They control the GitHub Pages URL: https://GITHUB_ORG.github.io/GITHUB_REPO/
// ---------------------------------------------------------------------------
const GITHUB_ORG = 'Taingchilim12';
const GITHUB_REPO = 'eks-cdk-pipeline-lessons';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CDK GitFlow Pipeline for EKS',
  tagline: 'A hands-on lesson on deploying EKS with CDK Pipelines, GitFlow, and Karpenter',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // GitHub Pages deployment config
  url: `https://${GITHUB_ORG}.github.io`,
  baseUrl: `/${GITHUB_REPO}/`,
  organizationName: GITHUB_ORG,
  projectName: GITHUB_REPO,
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/tree/main/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'EKS + CDK Pipelines',
        logo: {
          alt: 'Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Lessons',
          },
          {
            href: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}`,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Lessons',
            items: [
              {label: 'Start here', to: '/intro'},
              {label: 'Architecture', to: '/architecture'},
              {label: 'Deployment Walkthrough', to: '/deployment-walkthrough'},
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Lesson Site Repo',
                href: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}`,
              },
              {
                label: 'CDK Source (eks-cdk-sample)',
                href: 'https://github.com/Taingchilim12/eks-cdk-sample',
              },
              {
                label: 'AWS CDK Docs',
                href: 'https://docs.aws.amazon.com/cdk/',
              },
              {
                label: 'Karpenter Docs',
                href: 'https://karpenter.sh/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} — Built by Taing Chilim.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'typescript', 'yaml', 'json'],
      },
    }),
};

export default config;
