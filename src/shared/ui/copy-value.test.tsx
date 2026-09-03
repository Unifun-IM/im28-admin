import { fireEvent, render, screen, within } from '@testing-library/react';

import { GlobalContext } from '@shared/lib/global-context';
import { CopyValue } from './copy-value';

const contextValue = {
  lang: 'zh-CN',
  setLang: () => undefined,
  theme: 'light' as const,
  setTheme: () => undefined
};

describe('CopyValue', () => {
  it('truncates the value while keeping the copy action visible', () => {
    const value = '82958095-89f8-4d3c-a36e-6ac760be175a';
    const { container } = render(
      <GlobalContext.Provider value={contextValue}>
        <CopyValue value={value} truncate />
      </GlobalContext.Provider>
    );

    const text = screen.getByText(value);
    const copyButton = screen.getByRole('button', { name: '复制' });

    expect(container.firstElementChild).toHaveClass('min-w-0', 'max-w-full');
    expect(text).toHaveClass(
      'min-w-0',
      'flex-1',
      'overflow-hidden',
      'text-ellipsis',
      'whitespace-nowrap'
    );
    expect(copyButton).toHaveClass('shrink-0');
  });

  it('shows the complete truncated value in a tooltip', async () => {
    const value = '21883e4f-3e66-41d4-abf7-71452eb28990';
    render(
      <GlobalContext.Provider value={contextValue}>
        <CopyValue value={value} truncate />
      </GlobalContext.Provider>
    );

    fireEvent.mouseEnter(screen.getByText(value));

    const tooltip = await screen.findByRole('tooltip');
    expect(within(tooltip).getByText(value)).toBeInTheDocument();
  });

  it('keeps detail values untruncated by default', () => {
    const value = 'full-detail-value';
    render(
      <GlobalContext.Provider value={contextValue}>
        <CopyValue value={value} />
      </GlobalContext.Provider>
    );

    expect(screen.getByText(value)).not.toHaveClass('text-ellipsis');
  });
});
