import { existsSync, readdirSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const imageExtensions = new Set([
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico'
]);

function collectImageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectImageFiles(filePath);
    return imageExtensions.has(extname(entry.name).toLowerCase())
      ? [filePath]
      : [];
  });
}

describe('FSD scaffold', () => {
  it('creates the required top-level source layers', () => {
    const requiredLayers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

    expect(
      requiredLayers.map((layer) => ({
        layer,
        exists: existsSync(resolve(appRoot, 'src', layer))
      }))
    ).toEqual(requiredLayers.map((layer) => ({ layer, exists: true })));
  });

  it('does not create legacy root dumping grounds', () => {
    const rejectedRoots = ['components', 'containers', 'services', 'utils', 'hooks'];

    expect(
      rejectedRoots.map((root) => ({
        root,
        exists: existsSync(resolve(appRoot, 'src', root))
      }))
    ).toEqual(rejectedRoots.map((root) => ({ root, exists: false })));
  });

  it('provides centralized static image asset directories', () => {
    const sourceRoot = resolve(appRoot, 'src');
    const assetRoot = resolve(sourceRoot, 'assets');
    const assetGroups = ['icon', 'common'];

    expect(
      assetGroups.map((group) => ({
        group,
        exists: existsSync(resolve(appRoot, 'src', 'assets', group))
      }))
    ).toEqual(assetGroups.map((group) => ({ group, exists: true })));

    const imagesOutsideAssetRoot = collectImageFiles(sourceRoot).filter(
      (filePath) => relative(assetRoot, filePath).startsWith('..')
    );
    expect(imagesOutsideAssetRoot).toEqual([]);
  });
});
