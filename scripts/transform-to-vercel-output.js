#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

async function copyDirectory(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

function generateConfigJson() {
  return {
    version: 3,
    routes: [
      {
        src: "/assets/(.*)",
        headers: {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      {
        handle: "filesystem"
      },
      {
        src: "/(.*)",
        dest: "/index.html"
      }
    ],
    images: {
      sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      domains: [],
      minimumCacheTTL: 60,
      formats: ["image/webp", "image/avif"]
    },
    wildcard: [
      {
        domain: "www.example.com",
        value: "example.com"
      }
    ],
    overrides: {}
  };
}

function generateBuildsJson() {
  return {
    require: "@vercel/static-build",
    config: {
      zeroConfig: true,
      framework: "vite",
      buildCommand: "pnpm build"
    }
  };
}

async function transformToVercelOutput() {
  try {
    console.log('🔄 Transforming build output to Vercel format...');
    
    // Paths
    const outputDir = path.join(ROOT_DIR, '.vercel/output');
    const staticDir = path.join(outputDir, 'static');
    const containerDistDir = path.join(ROOT_DIR, 'container/dist');
    const presentationDistDir = path.join(ROOT_DIR, 'presentation/dist');
    
    // Clean existing output
    if (fs.existsSync(outputDir)) {
      await fs.promises.rm(outputDir, { recursive: true });
    }
    
    // Create .vercel/output structure
    await fs.promises.mkdir(outputDir, { recursive: true });
    await fs.promises.mkdir(staticDir, { recursive: true });
    
    // Determine which project to deploy based on directory existence
    let sourceDistDir;
    if (fs.existsSync(containerDistDir)) {
      sourceDistDir = containerDistDir;
      console.log('📦 Using container build output');
    } else if (fs.existsSync(presentationDistDir)) {
      sourceDistDir = presentationDistDir;
      console.log('📦 Using presentation build output');
    } else {
      throw new Error('No dist directory found in container or presentation');
    }
    
    // Copy dist files to .vercel/output/static
    console.log(`📂 Copying ${sourceDistDir} → ${staticDir}`);
    await copyDirectory(sourceDistDir, staticDir);
    
    // Generate config.json
    console.log('⚙️ Generating config.json');
    const configJson = generateConfigJson();
    await fs.promises.writeFile(
      path.join(outputDir, 'config.json'),
      JSON.stringify(configJson, null, 2)
    );
    
    // Generate builds.json
    console.log('🔧 Generating builds.json');
    const buildsJson = generateBuildsJson();
    await fs.promises.writeFile(
      path.join(outputDir, 'builds.json'),
      JSON.stringify(buildsJson, null, 2)
    );
    
    // Create diagnostics directory (optional but matches structure)
    const diagnosticsDir = path.join(outputDir, 'diagnostics');
    await fs.promises.mkdir(diagnosticsDir, { recursive: true });
    
    console.log('✅ Successfully transformed build output to Vercel format');
    console.log(`📁 Output: ${outputDir}`);
    
    // Verify structure
    const staticFiles = await fs.promises.readdir(staticDir);
    console.log(`📋 Static files: ${staticFiles.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error transforming to Vercel output:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  transformToVercelOutput();
}

export { transformToVercelOutput };