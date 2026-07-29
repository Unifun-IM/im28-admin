import React from 'react';
import { Typography, Badge } from '@arco-design/web-react';
import cs from 'classnames';

const { Text } = Typography;
interface TooltipProps {
  title: string;
  data: {
    name: string;
    value: string;
    color: string;
  }[];
  color?: string;
  name?: string;
  formatter?: (value: string) => React.ReactNode;
}

function CustomTooltip(props: TooltipProps) {
  const { formatter = (value) => value, color, name } = props;
  return (
    <div>
      <div className="mb-1">
        <Text bold>{props.title}</Text>
      </div>
      <div>
        {props.data.map((item, index) => (
          <div
            className={cs(
              'use-customer-tooltip-item flex h-8 items-center justify-between rounded-sm bg-[rgb(255_255_255_/_90%)] px-2 leading-8 text-arco-text-2 shadow-[6px_0_20px_rgb(34_87_188_/_10%)]',
              index < props.data.length - 1 && 'mb-2'
            )}
            key={index}
          >
            <div>
              <Badge color={color || item.color} />
              {name || item.name}
            </div>
            <div>
              <Text bold>{formatter(item.value)}</Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomTooltip;
