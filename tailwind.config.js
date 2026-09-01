/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    // 避免冲掉 Arco Design 基础样式
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary-6))',
          1: 'rgb(var(--arcoblue-1))',
          2: 'rgb(var(--arcoblue-2))',
          3: 'rgb(var(--arcoblue-3))',
          4: 'rgb(var(--arcoblue-4))',
          5: 'rgb(var(--arcoblue-5))',
          6: 'rgb(var(--arcoblue-6))',
          7: 'rgb(var(--arcoblue-7))',
          8: 'rgb(var(--arcoblue-8))',
          9: 'rgb(var(--arcoblue-9))',
          10: 'rgb(var(--arcoblue-10))'
        },
        // 对齐 Arco / Figma token（用于布局壳层）
        'arco-bg-1': 'var(--color-bg-1)',
        'arco-bg-2': 'var(--color-bg-2)',
        'arco-bg-popup': 'var(--color-bg-popup)',
        'arco-bg-black': 'var(--color-bg-black)',
        'arco-bg-inverse': 'var(--color-bg-inverse)',
        'arco-fill-1': 'var(--color-fill-1)',
        'arco-fill-2': 'var(--color-fill-2)',
        'arco-fill-3': 'var(--color-fill-3)',
        'arco-fill-inverse-hover': 'var(--color-fill-inverse-hover)',
        'arco-fill-inverse-heavy': 'var(--color-fill-inverse-heavy)',
        'arco-border-1': 'var(--color-border-1)',
        'arco-border-2': 'var(--color-border-2)',
        'arco-border-inverse': 'var(--color-border-inverse)',
        'arco-text-1': 'var(--color-text-1)',
        'arco-text-2': 'var(--color-text-2)',
        'arco-text-3': 'var(--color-text-3)',
        'arco-text-4': 'var(--color-text-4)',
        'arco-text-white': 'var(--color-text-white)',
        'arco-text-inverse': 'var(--color-text-inverse)',
        'arco-text-inverse-muted': 'var(--color-text-inverse-muted)',
        'arco-text-inverse-subtle': 'var(--color-text-inverse-subtle)',
        'arco-link-inverse': 'var(--color-link-inverse)',
        'arco-success': 'rgb(var(--success-6))',
        'arco-warning': 'rgb(var(--warning-6))',
        'arco-danger': 'rgb(var(--danger-6))'
      },
      fontFamily: {
        sans: ['var(--font-family-body)']
      },
      borderRadius: {
        sm: 'var(--radius-compact)',
        DEFAULT: 'var(--radius-control)',
        lg: 'var(--radius-surface)',
        xl: 'var(--radius-overlay)'
      },
      boxShadow: {
        popover: 'var(--shadow-popup)',
        overlay: 'var(--shadow-overlay)',
        sticky: 'var(--shadow-sticky)'
      },
      fontSize: {
        xs: [
          'var(--font-size-caption)',
          { lineHeight: 'var(--line-height-caption)' }
        ],
        'caption-compact': [
          'var(--font-size-caption)',
          { lineHeight: 'var(--line-height-caption-compact)' }
        ],
        sm: [
          'var(--font-size-body)',
          { lineHeight: 'var(--line-height-body-compact)' }
        ],
        body: [
          'var(--font-size-body)',
          { lineHeight: 'var(--line-height-body)' }
        ],
        title: [
          'var(--font-size-title)',
          { lineHeight: 'var(--line-height-title)' }
        ],
        'page-title': [
          'var(--font-size-page-title)',
          { lineHeight: 'var(--line-height-page-title)' }
        ]
      },
      transitionDuration: {
        hover: 'var(--motion-duration-hover)',
        state: 'var(--motion-duration-state)',
        layout: 'var(--motion-duration-layout)'
      },
      transitionTimingFunction: {
        standard: 'var(--motion-ease-standard)',
        layout: 'var(--motion-ease-layout)',
        emphasized: 'var(--motion-ease-emphasized)'
      }
    }
  },
  plugins: []
};
