import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Pevoro',
  tagline: '实验科学与虚拟模型的交响',
  favicon: 'img/favicon.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'http://pevoro.cn',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: 'facebook', // Usually your GitHub org/user name.
  // projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: {                          // ← 开启 preset 自带 blog
            showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: { customCss: require.resolve('./src/css/custom.css'), },
        sitemap: { changefreq: 'weekly', priority: 0.5 },
      } satisfies Preset.Options,
    ],
  ],

  // ⭐ 在这里手动开内容插件实例（可多开）
  plugins: [
    // Docs 实例 #1：金属粉末文档
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'metal_powder',                   // 唯一 ID
        path: 'metal_powder',                 // 你的文档源目录
        routeBasePath: 'metal_powder',        // 访问前缀：/metal_powder/*
        sidebarPath: require.resolve('./sidebars.ts'),
      },
    ],

    // Docs 实例 #2：Blender 教程
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'blender_tutorial',
        path: 'blender_tutorial',
        routeBasePath: 'blender_tutorial',
        sidebarPath: require.resolve('./sidebars.ts'),
      },
    ],

  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Pevoro',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          docsPluginId: 'metal_powder',
          sidebarId: 'metalSidebar',
          position: 'left',
          label: '🟢金属粉末',
        },
        {
          type: 'docSidebar',
          docsPluginId: 'blender_tutorial',
          sidebarId: 'blenderSidebar',
          position: 'left',
          label: '🟢Blender教程',
        },
        { to: '/blog', label: '🟢Blog', position: 'left', activeBaseRegex: '^/blog' },
        {
          href: '/contacts',
          label: '联系我',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
/*        {
          title: '快速导航',
          items: [
            {
              label: '金属粉末',
              to: '/metal_powder/intro',
            },
            {
              label: 'Blog',
              to: '/blog',
            },
          ],
        },
     {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/',
            },
            {
              label: 'X',
              href: 'https://x.com/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            
            {
              label: 'GitHub',
              href: 'https://github.com/',
            },
          ],
        }, */
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Pevoro </br>
      <img src="/img/备案图标.png" alt="" style="vertical-align:-3px;width:16px;height:16px;margin-right:4px;"> 
      <a href="https://beian.mps.gov.cn/#/query/webSearch?code=32031202001142" rel="noreferrer" target="_blank">苏公网安备32031202001142号</a>
      <img src="/img/备案图标.png" alt="" style="vertical-align:-3px;width:16px;height:16px;margin-right:4px;"> 
      <a href="https://beian.miit.gov.cn/" rel="noreferrer" target="_blank">苏ICP备2025204842号-1</a>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
