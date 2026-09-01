import React from 'react';
import { Typography, Badge } from '@arco-design/web-react';
import cs from 'classnames';
import './chart.less';

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
              'use-customer-tooltip-item flex h-8 items-center justify-between rounded-sm px-2 leading-8 text-arco-text-2',
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
