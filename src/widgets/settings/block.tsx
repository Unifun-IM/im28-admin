import React, { ReactNode } from 'react';
import { Switch, Divider, InputNumber } from '@arco-design/web-react';
import { useGlobalSelector, useGlobalDispatch } from '@entities/global-state';
import { GlobalState } from '@entities/global-state';
import useLocale from '@shared/lib/useLocale';

export interface BlockProps {
  title?: ReactNode;
  options?: { name: string; value: string; type?: 'switch' | 'number' }[];
  children?: ReactNode;
}

export default function Block(props: BlockProps) {
  const { title, options, children } = props;
  const locale = useLocale();
  const settings = useGlobalSelector((state: GlobalState) => state.settings);
  const dispatch = useGlobalDispatch();

  return (
    <div className="mb-6">
      <h5 className="m-[10px_0] p-0 text-sm">{title}</h5>
      {options &&
        options.map((option) => {
          const type = option.type || 'switch';

          return (
            <div
              className="flex h-8 items-center justify-between"
              key={option.value}
            >
              <span>{locale[option.name]}</span>
              {type === 'switch' && (
                <Switch
                  size="small"
                  checked={!!settings[option.value]}
                  onChange={(checked) => {
                    const newSetting = {
                      ...settings,
                      [option.value]: checked,
                    };
                    dispatch({
                      type: 'update-settings',
                      payload: { settings: newSetting },
                    });
                    // set color week
                    if (checked && option.value === 'colorWeek') {
                      document.body.style.filter = 'invert(80%)';
                    }
                    if (!checked && option.value === 'colorWeek') {
                      document.body.style.filter = 'none';
                    }
                  }}
                />
              )}
              {type === 'number' && (
                <InputNumber
                  style={{ width: 80 }}
                  size="small"
                  value={settings.menuWidth}
                  onChange={(value) => {
                    const newSetting = {
                      ...settings,
                      [option.value]: value,
                    };
                    dispatch({
                      type: 'update-settings',
                      payload: { settings: newSetting },
                    });
                  }}
                />
              )}
            </div>
          );
        })}
      {children}
      <Divider />
    </div>
  );
}
