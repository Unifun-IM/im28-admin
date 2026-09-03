import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Message, Modal, Switch } from '@arco-design/web-react';

import {
  postV1AdminClientVersionsCreate,
  postV1AdminClientVersionsUpdate
} from '@shared/api/admin/platform';
import useLocale from '@shared/lib/useLocale';
import '@shared/ui/biz-form-modal.less';

const FormItem = Form.Item;

type ClientVersionFormValues = {
  platform: string;
  version: string;
  build_number: string;
  force_update?: boolean;
  download_url?: string;
  title?: string;
  description?: string;
  is_enable?: boolean;
};

export type ClientVersionFormModalProps = {
  visible: boolean;
  clientVersion?: AdminAPI.ClientVersion | null;
  onCancel: () => void;
  onSuccess: () => void;
};

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function ClientVersionFormModal({
  visible,
  clientVersion,
  onCancel,
  onSuccess
}: ClientVersionFormModalProps) {
  const t = useLocale();
  const [form] = Form.useForm<ClientVersionFormValues>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    form.setFieldsValue({
      platform: clientVersion?.platform || '',
      version: clientVersion?.version || '',
      build_number: clientVersion?.build_number || '',
      force_update: clientVersion?.force_update ?? false,
      download_url: clientVersion?.download_url || '',
      title: clientVersion?.title || '',
      description: clientVersion?.description || '',
      is_enable: clientVersion?.is_enable ?? true
    });
  }, [clientVersion, form, visible]);

  const required = (label: string) => ({
    required: true,
    validator: (value: unknown, callback: (error?: React.ReactNode) => void) => {
      callback(
        String(value || '').trim()
          ? undefined
          : t['common.form.required'].replace('{label}', label)
      );
    }
  });

  const submit = async () => {
    if (submitting) return;
    try {
      const values = await form.validate();
      setSubmitting(true);
      const payload = {
        platform: values.platform.trim(),
        version: values.version.trim(),
        build_number: values.build_number.trim(),
        force_update: values.force_update ?? false,
        download_url: String(values.download_url || '').trim(),
        title: String(values.title || '').trim(),
        description: String(values.description || '').trim(),
        is_enable: values.is_enable ?? true
      };

      if (clientVersion?.id) {
        await postV1AdminClientVersionsUpdate({
          id: clientVersion.id,
          ...payload
        });
      } else {
        await postV1AdminClientVersionsCreate({
          ...payload,
          download_url: payload.download_url || undefined,
          title: payload.title || undefined,
          description: payload.description || undefined
        });
      }
      Message.success(t['platform.clientVersion.saved']);
      onSuccess();
    } catch {
      // Form validation and request feedback are handled by Arco/request.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title={
        clientVersion
          ? t['platform.clientVersion.editTitle']
          : t['platform.clientVersion.createTitle']
      }
      className="use-biz-form-modal"
      style={{ width: 640 }}
      maskClosable={false}
      unmountOnExit
      onCancel={onCancel}
      footer={
        <div className="flex w-full flex-wrap justify-end gap-2">
          <Button type="outline" disabled={submitting} onClick={onCancel}>
            {t['common.cancel']}
          </Button>
          <Button type="primary" loading={submitting} onClick={submit}>
            {t['common.confirm']}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-x-4 max-md:grid-cols-1">
          <FormItem
            field="platform"
            label={t['platform.clientVersion.field.platform']}
            rules={[required(t['platform.clientVersion.field.platform'])]}
          >
            <Input maxLength={32} />
          </FormItem>
          <FormItem
            field="version"
            label={t['platform.clientVersion.field.version']}
            rules={[required(t['platform.clientVersion.field.version'])]}
          >
            <Input maxLength={64} />
          </FormItem>
          <FormItem
            field="build_number"
            label={t['platform.clientVersion.field.buildNumber']}
            rules={[
              required(t['platform.clientVersion.field.buildNumber']),
              {
                validator: (value, callback) => {
                  callback(
                    /^[1-9]\d*$/.test(String(value || '').trim())
                      ? undefined
                      : t['platform.clientVersion.validation.buildNumber']
                  );
                }
              }
            ]}
          >
            <Input maxLength={20} />
          </FormItem>
          <FormItem
            field="download_url"
            label={t['platform.clientVersion.field.downloadUrl']}
            rules={[
              {
                validator: (value, callback) => {
                  const url = String(value || '').trim();
                  callback(
                    !url || isHttpUrl(url)
                      ? undefined
                      : t['platform.clientVersion.validation.downloadUrl']
                  );
                }
              }
            ]}
          >
            <Input />
          </FormItem>
          <FormItem className="col-span-2 max-md:col-span-1" field="title" label={t['platform.clientVersion.field.title']}>
            <Input />
          </FormItem>
          <FormItem className="col-span-2 max-md:col-span-1" field="description" label={t['platform.clientVersion.field.description']}>
            <Input.TextArea autoSize={{ minRows: 4, maxRows: 8 }} />
          </FormItem>
          <FormItem field="force_update" label={t['platform.clientVersion.field.forceUpdate']} triggerPropName="checked">
            <Switch />
          </FormItem>
          <FormItem field="is_enable" label={t['platform.clientVersion.field.enabled']} triggerPropName="checked">
            <Switch />
          </FormItem>
        </div>
      </Form>
    </Modal>
  );
}
