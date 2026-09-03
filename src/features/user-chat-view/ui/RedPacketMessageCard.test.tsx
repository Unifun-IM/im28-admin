import { render, screen } from '@testing-library/react';

import { GlobalContext } from '@shared/lib/global-context';
import RedPacketMessageCard from './RedPacketMessageCard';

function renderCard(
  props: Partial<React.ComponentProps<typeof RedPacketMessageCard>> = {}
) {
  render(
    <GlobalContext.Provider value={{ lang: 'zh-CN' }}>
      <RedPacketMessageCard
        greeting="好运连连"
        isSelf={false}
        isGroup
        {...props}
      />
    </GlobalContext.Provider>
  );
}

describe('RedPacketMessageCard', () => {
  it('renders a lucky red packet with the desktop card copy', () => {
    renderCard({ kind: 'lucky' });

    expect(screen.getByText('好运连连')).toBeInTheDocument();
    expect(screen.getByText('拼手气红包')).toBeInTheDocument();
  });

  it('renders exclusive recipient and terminal state', () => {
    renderCard({
      kind: 'exclusive',
      status: 'claimed',
      recipientName: '小明'
    });

    expect(screen.getByText('给小明的红包')).toBeInTheDocument();
    expect(screen.getByText('已领取')).toBeInTheDocument();
    expect(document.querySelector('.use-chat-red-packet-card')).toHaveClass(
      'is-inactive'
    );
  });
});
