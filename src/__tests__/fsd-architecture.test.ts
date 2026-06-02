import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

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
});
