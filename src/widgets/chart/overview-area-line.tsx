import React, { useContext, useEffect, useState } from 'react';
import { Chart, Line, Axis, Area, Tooltip } from 'bizcharts';
import { Spin } from '@arco-design/web-react';
import { useGlobalSelector } from '@entities/global-state';
import { GlobalContext } from '@shared/lib/global-context';
import CustomTooltip from './customer-tooltip';
import './chart.less';

function readThemeColor(variable: string) {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.body).getPropertyValue(variable).trim();
}

function OverviewAreaLine({
  data,
  loading,
  name = '总内容量',
  color
}: {
  data: Record<string, unknown>[];
  loading: boolean;
  name?: string;
  color?: string;
}) {
  const theme = useContext(GlobalContext).theme;
  const themeColor = useGlobalSelector((state) => state.settings.themeColor);
  const [canvasColors, setCanvasColors] = useState(() => ({
    line: color || themeColor,
    grid: '',
    marker: ''
  }));

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const primary = readThemeColor('--primary-6');
      setCanvasColors({
        line: color || (primary ? `rgb(${primary})` : themeColor),
        grid: readThemeColor('--color-border-2'),
        marker: readThemeColor('--color-bg-2')
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [color, theme, themeColor]);

  return (
    <Spin loading={loading} style={{ width: '100%' }}>
      <Chart
        scale={{ value: { min: 0 } }}
        padding={[10, 20, 50, 40]}
        autoFit
        height={300}
        data={data}
        className={'chart-wrapper'}
      >
        <Axis
          name="count"
          title
          grid={{
            line: {
              style: {
                lineDash: [4, 4]
              }
            }
          }}
          label={{
            formatter(text) {
              return `${Number(text) / 1000}k`;
            }
          }}
        />
        <Axis
          name="date"
          grid={{ line: { style: { stroke: canvasColors.grid } } }}
        />
        <Line
          shape="smooth"
          position="date*count"
          size={3}
          color={canvasColors.line}
        />
        <Area
          position="date*count"
          shape="smooth"
          color={canvasColors.line}
          style={{ fillOpacity: 0.12 }}
        />
        <Tooltip
          showCrosshairs={true}
          showMarkers={true}
          marker={{
            lineWidth: 3,
            stroke: canvasColors.line,
            fill: canvasColors.marker,
            symbol: 'circle',
            r: 8
          }}
        >
          {(title, items) => {
            return (
              <CustomTooltip
                title={title}
                data={items}
                color={canvasColors.line}
                name={name}
                formatter={(value) => Number(value).toLocaleString()}
              />
            );
          }}
        </Tooltip>
      </Chart>
    </Spin>
  );
}

export default OverviewAreaLine;
