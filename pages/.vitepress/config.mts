import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Generative AI Newsletter App",
  description: "The Generative AI Newsletter Application sample is a ready-to-use serverless solution designed to allow users to create rich newsletters automatically with content summaries that are AI-generated.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about'},
      { text: 'User Guide', link: '/user-guide' },
      { text: 'Deployment Guide', link: '/deployment' },
    ],

    sidebar: [
      // {
      //   text: 'Examples',
      //   items: [
      //     { text: 'Markdown Examples', link: '/markdown-examples' },
      //     { text: 'Runtime API Examples', link: '/api-examples' }
      //   ]
      // }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/aws-samples/generative-ai-newsletter-app' }
    ]
  }
})
