import React from 'react';
import { Trigger, Typography } from '@arco-design/web-react';
import { SketchPicker } from 'react-color';
import { generate } from '@arco-design/color';
import { useGlobalSelector, useGlobalDispatch } from '@shared/lib/global-store-hooks';
import { GlobalState } from '@entities/global-state';
import applyThemeColor from '@shared/lib/applyThemeColor';
import useLocale from '@shared/lib/useLocale';
import styles from './style/color-panel.module.less';

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
              applyThemeColor(newColor);
            }}
          />
        )}
      >
        <div className={styles.input}>
          <div
            className={styles.color}
            style={{ backgroundColor: themeColor }}
          />
          <span>{themeColor}</span>
        </div>
      </Trigger>
      <ul className={styles.ul}>
        {list.map((item, index) => (
          <li
            key={index}
            className={styles.li}
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
