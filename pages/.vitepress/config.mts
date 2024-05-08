import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Generative AI Newsletter App",
  base: "/generative-ai-newsletter-app/",
  description: "The Generative AI Newsletter Application sample is a ready-to-use serverless solution designed to allow users to create rich newsletters automatically with content summaries that are AI-generated.",
  themeConfig: {
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about'},
      { text: 'User Guide', link: '/user-guide' },
      { text: 'Deployment Guide', link: '/deployment' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/aws-samples/generative-ai-newsletter-app' }
    ],
    footer: {
      copyright: 'This library is licensed under the MIT-0 License.'
    }
  }
})
