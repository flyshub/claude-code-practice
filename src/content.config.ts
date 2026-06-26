// 内容集合配置（Astro 5+：文件位于 src/content.config.ts，用 glob loader + Zod）
// 定义 "blog" 集合：从 src/content/blog/ 读取 markdown，并用 Zod 校验每篇文章的 frontmatter。
// pattern '**/[^_]*.{md,mdx}' 会自动排除下划线开头的草稿文件。
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/[^_]*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
  }),
});

export const collections = { blog };
