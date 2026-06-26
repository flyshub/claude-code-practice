// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages 项目站点地址：https://<用户名>.github.io/<仓库名>/
// site  = 协议 + 域名（不含路径）
// base  = 仓库名（必须以 / 开头和结尾）
// 不设这俩，部署后 CSS / 链接 / 图片会全部断掉——这是静态站部署最常见的坑。
export default defineConfig({
  site: 'https://flyshub.github.io',
  base: '/claude-code-practice/',
});
