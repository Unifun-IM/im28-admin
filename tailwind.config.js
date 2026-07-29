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
          DEFAULT: '#635CFF',
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
        'arco-bg-2': 'var(--color-bg-2, #fff)',
        'arco-bg-popup': 'var(--color-bg-popup, #fff)',
        'arco-fill-1': 'var(--color-fill-1, #f7f8fa)',
        'arco-border-2': 'var(--color-border-2, #e5e6eb)',
        'arco-text-1': 'var(--color-text-1, #1d2129)',
        'arco-text-2': 'var(--color-text-2, #4e5969)',
        'arco-text-3': 'var(--color-text-3, #86909c)',
        'arco-text-4': 'var(--color-text-4, #c9cdd4)',
        'arco-success': 'rgb(var(--success-6))',
        'arco-danger': 'rgb(var(--danger-6))'
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '8px',
        xl: '12px'
      },
      boxShadow: {
        popover: '0 4px 10px rgba(0, 0, 0, 0.1)'
      },
      fontSize: {
        xs: ['12px', { lineHeight: '20px' }],
        sm: ['14px', { lineHeight: '21px' }]
      }
    }
  },
  plugins: []
};
