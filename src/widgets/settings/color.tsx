import React from 'react';
import { Trigger, Typography } from '@arco-design/web-react';
import { SketchPicker } from 'react-color';
import { generate } from '@arco-design/color';
import { useGlobalSelector, useGlobalDispatch } from '@shared/lib/global-store-hooks';
import { GlobalState } from '@entities/global-state';
import applyThemeColor from '@shared/lib/applyThemeColor';
import useLocale from '@shared/lib/useLocale';

function ColorPanel() {
  const settings = useGlobalSelector((state: GlobalState) => state.settings);
  const locale = useLocale();
  const themeColor = settings.themeColor;
  const list = generate(themeColor, { list: true });
  const dispatch = useGlobalDispatch();

  return (
    <div>
      <Trigger
        trigger="hover"
        position="bl"
        popup={() => (
          <SketchPicker
            color={themeColor}
            onChangeComplete={(color) => {
              const newColor = color.hex;
              dispatch({
                type: 'update-settings',
                payload: { settings: { ...settings, themeColor: newColor } }
              });
              applyThemeColor(newColor, {
                dark: document.body.getAttribute('arco-theme') === 'dark'
              });
            }}
          />
        )}
      >
        <div className="box-border flex h-8 w-full border border-[var(--color-border)] p-[3px]">
          <div
            className="mr-2.5 h-6 w-[100px]"
            style={{ backgroundColor: themeColor }}
          />
          <span>{themeColor}</span>
        </div>
      </Trigger>
      <ul className="flex list-none p-0">
        {list.map((item, index) => (
          <li
            key={index}
            className="h-[26px] w-[10%]"
            style={{ backgroundColor: item }}
          />
        ))}
      </ul>
      <Typography.Paragraph style={{ fontSize: 12 }}>
        {locale['settings.color.tooltip']}
      </Typography.Paragraph>
    </div>
  );
}

export default ColorPanel;
