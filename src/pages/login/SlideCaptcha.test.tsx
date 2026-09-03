import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import SlideCaptcha from './SlideCaptcha';

class ResizeObserverMock {
  observe() {}
  disconnect() {}
}

class PointerEventMock extends MouseEvent {
  pointerId: number;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 0;
  }
}

describe('SlideCaptcha', () => {
  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    vi.stubGlobal('PointerEvent', PointerEventMock);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('keeps touch dragging on the handle and verifies at the track end', () => {
    const onChange = vi.fn();
    render(<SlideCaptcha onChange={onChange} />);

    const handle = screen.getByRole('slider');
    const track = handle.parentElement as HTMLDivElement;

    Object.defineProperty(track, 'clientWidth', {
      configurable: true,
      value: 260
    });
    Object.defineProperty(handle, 'offsetWidth', {
      configurable: true,
      value: 46
    });
    track.getBoundingClientRect = () =>
      ({
        bottom: 32,
        height: 32,
        left: 0,
        right: 260,
        top: 0,
        width: 260,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }) as DOMRect;

    fireEvent.pointerDown(handle, { clientX: 23, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: 237, pointerId: 1 });
    fireEvent.pointerUp(track, { pointerId: 1 });

    expect(handle).toHaveAttribute('aria-valuenow', '100');
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
