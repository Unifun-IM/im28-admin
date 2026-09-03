import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Message, Modal, Switch } from '@arco-design/web-react';

import {
  postV1AdminTermsCreate,
  postV1AdminTermsUpdate
} from '@shared/api/admin/platform';
import useLocale from '@shared/lib/useLocale';
import '@shared/ui/biz-form-modal.less';

const FormItem = Form.Item;

type PlatformTermFormValues = {
  key: string;
  title: string;
  content: string;
  version: string;
  is_enable?: boolean;
};

export type PlatformTermFormModalProps = {
  visible: boolean;
  term?: AdminAPI.PlatformTerm | null;
  onCancel: () => void;
  onSuccess: () => void;
};

export default function PlatformTermFormModal({
  visible,
  term,
  onCancel,
  onSuccess
}: PlatformTermFormModalProps) {
  const t = useLocale();
  const [form] = Form.useForm<PlatformTermFormValues>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    form.setFieldsValue({
      key: term?.key || '',
      title: term?.title || '',
      content: term?.content || '',
      version: term?.version || '',
      is_enable: term?.is_enable ?? true
    });
  }, [form, term, visible]);

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
        title: values.title.trim(),
        content: values.content.trim(),
        version: values.version.trim(),
        is_enable: values.is_enable ?? true
      };
      if (term?.id) {
        await postV1AdminTermsUpdate({ id: term.id, ...payload });
      } else {
        await postV1AdminTermsCreate({
          key: values.key.trim(),
          ...payload
        });
      }
      Message.success(t['platform.term.saved']);
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
      title={term ? t['platform.term.editTitle'] : t['platform.term.createTitle']}
      className="use-biz-form-modal"
      style={{ width: 720 }}
      maskClosable={false}
      unmountOnExit
      onCancel={onCancel}
      footer={
        <div className="flex w-full flex-wrap justify-end gap-2">
          <Button type="outline" disabled={submitting} onClick={onCancel}>{t['common.cancel']}</Button>
          <Button type="primary" loading={submitting} onClick={submit}>{t['common.confirm']}</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-x-4 max-md:grid-cols-1">
          <FormItem field="key" label={t['platform.term.field.key']} rules={[required(t['platform.term.field.key'])]}>
            <Input disabled={Boolean(term)} />
          </FormItem>
          <FormItem field="version" label={t['platform.term.field.version']} rules={[required(t['platform.term.field.version'])]}>
            <Input />
          </FormItem>
          <FormItem className="col-span-2 max-md:col-span-1" field="title" label={t['platform.term.field.title']} rules={[required(t['platform.term.field.title'])]}>
            <Input />
          </FormItem>
          <FormItem className="col-span-2 max-md:col-span-1" field="content" label={t['platform.term.field.content']} rules={[required(t['platform.term.field.content'])]}>
            <Input.TextArea autoSize={{ minRows: 8, maxRows: 16 }} />
          </FormItem>
          <FormItem field="is_enable" label={t['platform.term.field.enabled']} triggerPropName="checked">
            <Switch />
          </FormItem>
        </div>
      </Form>
    </Modal>
  );
}
