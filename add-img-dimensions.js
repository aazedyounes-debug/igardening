const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = __dirname;
const IMAGES_DIR = path.join(ROOT, 'images', 'site');

// Cache for local image dimensions
const dimensionCache = {};

async function getLocalImageDimensions(srcPath) {
  // Normalize the path: extract just the filename portion after "images/site/"
  const match = srcPath.match(/images\/site\/(.+)$/);
  if (!match) return null;

  const filename = match[1];
  const fullPath = path.join(IMAGES_DIR, filename);

  if (dimensionCache[fullPath]) return dimensionCache[fullPath];

  try {
    const metadata = await sharp(fullPath).metadata();
    const dims = { width: metadata.width, height: metadata.height };
    dimensionCache[fullPath] = dims;
    return dims;
  } catch (err) {
    console.warn(`  Warning: could not read dimensions for ${fullPath}: ${err.message}`);
    return null;
  }
}

function parseUnsplashDimensions(src) {
  const wMatch = src.match(/[?&]w=(\d+)/);
  const hMatch = src.match(/[?&]h=(\d+)/);
  if (wMatch && hMatch) {
    return { width: parseInt(wMatch[1]), height: parseInt(hMatch[1]) };
  }
  return null;
}

function guessUnsplashDefaults(imgTag, surroundingHtml) {
  // Hero background images
  if (imgTag.includes('hero-bg-img') || surroundingHtml.includes('article-hero')) {
    return { width: 1400, height: 600 };
  }
  // Hero section images on homepage
  if (surroundingHtml.includes('hero-image') || surroundingHtml.includes('hero-img-wrapper')) {
    return { width: 1200, height: 600 };
  }
  // Article card thumbnails (in grids)
  if (surroundingHtml.includes('article-card') || surroundingHtml.includes('article-image') ||
      surroundingHtml.includes('latest-card') || surroundingHtml.includes('latest-image')) {
    return { width: 800, height: 450 };
  }
  // Video thumbnails
  if (surroundingHtml.includes('video-thumb') || surroundingHtml.includes('video-card')) {
    return { width: 800, height: 450 };
  }
  // Shop card images
  if (surroundingHtml.includes('shop-card')) {
    return { width: 800, height: 450 };
  }
  // Inline article images (inside article-body / article-content sections)
  if (surroundingHtml.includes('article-body') || surroundingHtml.includes('article-text') ||
      surroundingHtml.includes('content-section')) {
    return { width: 800, height: 500 };
  }
  // Default fallback
  return { width: 800, height: 450 };
}

function hasWidthHeight(imgTag) {
  return /\bwidth\s*=/.test(imgTag) && /\bheight\s*=/.test(imgTag);
}

function addDimensionsToImgTag(imgTag, width, height) {
  // Add width and height before the closing > or />
  // Find the position right before the closing
  const closingMatch = imgTag.match(/\s*\/?>$/);
  if (!closingMatch) return imgTag;

  const insertPos = closingMatch.index;
  const before = imgTag.slice(0, insertPos);
  const after = imgTag.slice(insertPos);

  return `${before} width="${width}" height="${height}"${after}`;
}

function getAllHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'images') continue;
      getAllHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let changeCount = 0;

  // Match all <img ...> tags (including self-closing)
  const imgRegex = /<img\b[^>]*>/gi;
  const matches = [];
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    matches.push({ fullMatch: match[0], index: match.index });
  }

  // Process in reverse order so indices stay valid
  for (let i = matches.length - 1; i >= 0; i--) {
    const { fullMatch, index } = matches[i];

    // Skip if already has width and height
    if (hasWidthHeight(fullMatch)) continue;

    // Extract src
    const srcMatch = fullMatch.match(/\bsrc\s*=\s*"([^"]+)"/);
    if (!srcMatch) continue;
    const src = srcMatch[1];

    let dims = null;

    if (src.includes('images/site/')) {
      // Local image - resolve relative path from the HTML file's directory
      dims = await getLocalImageDimensions(src);
    } else if (src.includes('unsplash.com')) {
      // Try to parse from URL params first
      dims = parseUnsplashDimensions(src);
      if (!dims) {
        // Use contextual defaults - look at surrounding HTML (500 chars before)
        const contextStart = Math.max(0, index - 500);
        const surroundingHtml = content.slice(contextStart, index + fullMatch.length + 200);
        dims = guessUnsplashDefaults(fullMatch, surroundingHtml);
      }
    }

    if (dims) {
      const newImgTag = addDimensionsToImgTag(fullMatch, dims.width, dims.height);
      content = content.slice(0, index) + newImgTag + content.slice(index + fullMatch.length);
      modified = true;
      changeCount++;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  Updated ${changeCount} img tag(s) in ${path.relative(ROOT, filePath)}`);
  }

  return changeCount;
}

async function main() {
  console.log('Finding HTML files...');
  const htmlFiles = getAllHtmlFiles(ROOT);
  console.log(`Found ${htmlFiles.length} HTML files.\n`);

  let totalChanges = 0;
  let filesModified = 0;

  for (const file of htmlFiles) {
    const changes = await processFile(file);
    if (changes > 0) {
      filesModified++;
      totalChanges += changes;
    }
  }

  console.log(`\nDone! Modified ${totalChanges} img tags across ${filesModified} files.`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
