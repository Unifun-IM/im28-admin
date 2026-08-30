import { render, screen } from '@testing-library/react';

import { GlobalContext } from '@shared/lib/global-context';
import DataSummary from './DataSummary';

describe('DataSummary', () => {
  it('renders only real items and exposes the desktop column count to CSS', () => {
    const { container } = render(
      <GlobalContext.Provider
        value={{
          lang: 'zh-CN',
          setLang: () => undefined,
          theme: 'light',
          setTheme: () => undefined
        }}
      >
        <DataSummary
          items={[
            { label: 'A', value: 1 },
            { label: 'B', value: 2 },
            { label: 'C', value: 3 },
            { label: 'D', value: 4 },
            { label: 'E', value: 5 },
            { label: 'F', value: 6 }
          ]}
        />
      </GlobalContext.Provider>
    );

    const grid = container.querySelector<HTMLElement>('.use-biz-summary-grid');
    expect(grid).toBeTruthy();
    expect(grid?.style.getPropertyValue('--biz-summary-columns')).toBe('5');
    expect(container.querySelectorAll('.use-biz-summary-cell')).toHaveLength(6);
    expect(screen.getByText('F')).toBeTruthy();
  });
});
