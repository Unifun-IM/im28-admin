import { Form, Input } from '@arco-design/web-react';
import { render } from '@testing-library/react';

import { GlobalContext } from '@shared/lib/global-context';
import SettingsPageShell, { SettingsSectionCard } from './SettingsPageShell';

describe('SettingsPageShell', () => {
  it('keeps section cards in the shared form spacing container', () => {
    const { container } = render(
      <GlobalContext.Provider
        value={{
          lang: 'zh-CN',
          setLang: () => undefined,
          theme: 'light',
          setTheme: () => undefined
        }}
      >
        <SettingsPageShell
          title="Settings"
          anchors={[
            { key: 'basic', title: 'Basic' },
            { key: 'advanced', title: 'Advanced' }
          ]}
          onCancel={() => undefined}
          onSave={() => undefined}
        >
          <Form>
            <SettingsSectionCard id="basic" title="Basic">
              <Form.Item field="name" label="Name">
                <Input />
              </Form.Item>
            </SettingsSectionCard>
            <SettingsSectionCard id="advanced" title="Advanced">
              <Form.Item field="mode" label="Mode">
                <Input />
              </Form.Item>
            </SettingsSectionCard>
          </Form>
        </SettingsPageShell>
      </GlobalContext.Provider>
    );

    const content = container.querySelector('.use-session-settings-content');
    const form = content?.querySelector(':scope > .arco-form');

    expect(content).toBeTruthy();
    expect(form).toBeTruthy();
    expect(form?.querySelectorAll(':scope > [id]').length).toBe(2);
  });
});
