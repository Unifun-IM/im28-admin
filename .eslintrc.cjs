module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.app.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['dist', 'node_modules', 'src/shared/api/admin/**'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: [
              '@app/*',
              '!@app/assets',
              '!@app/assets/*.svg',
              '!@app/assets/*.svg?react'
            ],
            message: 'Only app layer may import app internals.'
          },
          {
            group: ['@pages/*'],
            message: 'Only app may import pages.'
          },
          {
            group: ['@widgets/*'],
            message: 'Only pages/app may import widgets.'
          }
        ]
      }
    ]
  },
  overrides: [
    {
      files: ['src/app/**/*.{ts,tsx}', 'src/main.tsx'],
      rules: {
        'no-restricted-imports': 'off'
      }
    },
    {
      files: ['src/pages/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@app/*',
                  '@pages/*',
                  '!@app/assets',
                  '!@app/assets/*.svg',
                  '!@app/assets/*.svg?react'
                ],
                message: 'Pages may only import lower FSD layers.'
              }
            ]
          }
        ]
      }
    },
    {
      files: ['src/widgets/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@app/*',
                  '@pages/*',
                  '@features/*',
                  '@widgets/*/**',
                  '!@app/assets',
                  '!@app/assets/*.svg',
                  '!@app/assets/*.svg?react'
                ],
                message:
                  'Widgets may import lower layers and other widgets through their public entry only.'
              }
            ]
          }
        ]
      }
    },
    {
      files: ['src/features/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@app/*',
                  '@pages/*',
                  '@widgets/*',
                  '@features/*/**',
                  '!@app/assets',
                  '!@app/assets/*.svg',
                  '!@app/assets/*.svg?react'
                ],
                message:
                  'Features may import lower layers and other features through their public entry only.'
              }
            ]
          }
        ]
      }
    },
    {
      files: ['src/entities/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@app/*',
                  '@pages/*',
                  '@widgets/*',
                  '@features/*',
                  '@entities/*',
                  '!@app/assets',
                  '!@app/assets/*.svg',
                  '!@app/assets/*.svg?react'
                ],
                message: 'Entities may only import shared or same-slice relative modules.'
              }
            ]
          }
        ]
      }
    },
    {
      files: ['src/shared/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@app/*',
                  '@pages/*',
                  '@widgets/*',
                  '@features/*',
                  '@entities/*',
                  '!@app/assets',
                  '!@app/assets/*.svg',
                  '!@app/assets/*.svg?react'
                ],
                message: 'Shared must stay product-agnostic.'
              }
            ]
          }
        ]
      }
    }
  ]
};
