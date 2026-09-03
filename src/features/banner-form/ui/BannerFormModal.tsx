import React, { useEffect, useState } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Message,
  Modal,
  Select,
  Switch,
  Upload
} from '@arco-design/web-react';
import { IconUpload } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';

import {
  postV1AdminBannersCreate,
  postV1AdminBannersUpdate
} from '@shared/api/admin/platform';
import {
  ADMIN_IMAGE_ACCEPT,
  uploadAdminImage,
  validateAdminImage
} from '@shared/lib/uploadAdminImage';
import useLocale from '@shared/lib/useLocale';
import '@shared/ui/biz-form-modal.less';

const FormItem = Form.Item;

type BannerFormValues = {
  type: AdminAPI.CreateBannerRequest['type'];
  platforms: AdminAPI.CreateBannerRequest['platforms'];
  language: string;
  image_url: string;
  title?: string;
  action_type: AdminAPI.CreateBannerRequest['action_type'];
  action_value?: string;
  sort?: number;
  is_enable?: boolean;
  starts_at?: unknown;
  ends_at?: unknown;
};

export type BannerFormModalProps = {
  visible: boolean;
  banner?: AdminAPI.Banner | null;
  onCancel: () => void;
  onSuccess: () => void;
};

function toRfc3339(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  const raw =
    typeof (value as { toDate?: () => Date }).toDate === 'function'
      ? (value as { toDate: () => Date }).toDate()
      : value;
  const date = raw instanceof Date ? raw : new Date(raw as string | number);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function isHttpUrl(value: unknown): boolean {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function BannerFormModal({
  visible,
  banner,
  onCancel,
  onSuccess
}: BannerFormModalProps) {
  const t = useLocale();
  const [form] = Form.useForm<BannerFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageUrl = Form.useWatch('image_url', form);
  const actionType = Form.useWatch('action_type', form);

  useEffect(() => {
    if (!visible) return;
    form.setFieldsValue({
      type: banner?.type || 'asset_profile',
      platforms: banner?.platforms || ['app', 'pc', 'h5'],
      language: banner?.language || 'all',
      image_url: banner?.image_url || '',
      title: banner?.title || '',
      action_type: banner?.action_type || 'none',
      action_value: banner?.action_value || '',
      sort: banner?.sort ?? 0,
      is_enable: banner?.is_enable ?? true,
      starts_at: banner?.starts_at ? dayjs(banner.starts_at) : undefined,
      ends_at: banner?.ends_at ? dayjs(banner.ends_at) : undefined
    });
  }, [banner, form, visible]);

  const required = (label: string) => ({
    required: true,
    message: t['common.form.required'].replace('{label}', label)
  });

  const beforeUpload = (file: File) => {
    if (uploading) return false;
    const invalid = validateAdminImage(file);
    if (invalid === 'type') {
      Message.warning(t['common.upload.imageType']);
      return false;
    }
    if (invalid === 'size') {
      Message.warning(t['common.upload.imageMax1m']);
      return false;
    }
    void (async () => {
      try {
        setUploading(true);
        const url = await uploadAdminImage(file);
        form.setFieldsValue({ image_url: url });
      } catch {
        Message.error(t['common.upload.failed']);
      } finally {
        setUploading(false);
      }
    })();
    return false;
  };

  const submit = async () => {
    if (submitting || uploading) return;
    try {
      const values = await form.validate();
      setSubmitting(true);
      const common = {
        type: values.type,
        platforms: values.platforms,
        language: values.language.trim(),
        image_url: values.image_url.trim(),
        title: String(values.title || '').trim(),
        action_type: values.action_type,
        action_value:
          values.action_type === 'none'
            ? ''
            : String(values.action_value || '').trim(),
        sort: values.sort ?? 0,
        is_enable: values.is_enable ?? true,
        starts_at: toRfc3339(values.starts_at) || '',
        ends_at: toRfc3339(values.ends_at) || ''
      };

      if (banner) {
        await postV1AdminBannersUpdate({ id: banner.id, ...common });
      } else {
        await postV1AdminBannersCreate({
          ...common,
          starts_at: common.starts_at || undefined,
          ends_at: common.ends_at || undefined
        });
      }
      Message.success(t['asset.banner.saveSuccess']);
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
      title={banner ? t['asset.banner.editTitle'] : t['asset.banner.createTitle']}
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
          <Button type="primary" loading={submitting} disabled={uploading} onClick={submit}>
            {t['common.confirm']}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-x-4 max-md:grid-cols-1">
          <FormItem field="type" label={t['asset.banner.field.type']} rules={[required(t['asset.banner.field.type'])]}>
            <Select
              options={(['asset_profile', 'asset_ledger_detail'] as const).map((value) => ({
                label: t[`asset.banner.type.${value}`],
                value
              }))}
            />
          </FormItem>
          <FormItem
            field="language"
            label={t['asset.banner.field.language']}
            rules={[
              required(t['asset.banner.field.language']),
              {
                validator: (value, callback) => {
                  callback(String(value || '').trim() ? undefined : t['asset.banner.validation.language']);
                }
              }
            ]}
          >
            <Input placeholder={t['asset.banner.placeholder.language']} />
          </FormItem>
          <FormItem className="col-span-2 max-md:col-span-1" field="platforms" label={t['asset.banner.field.platforms']} rules={[required(t['asset.banner.field.platforms'])]}>
            <Select
              mode="multiple"
              options={(['app', 'pc', 'h5'] as const).map((value) => ({
                label: t[`asset.banner.platform.${value}`],
                value
              }))}
            />
          </FormItem>
          <FormItem
            className="col-span-2 max-md:col-span-1"
            field="image_url"
            label={t['asset.banner.field.imageUrl']}
            rules={[
              required(t['asset.banner.field.imageUrl']),
              {
                validator: (value, callback) => {
                  callback(isHttpUrl(value) ? undefined : t['asset.banner.validation.imageUrl']);
                }
              }
            ]}
          >
            <Input />
          </FormItem>
          <FormItem className="col-span-2 max-md:col-span-1" label={t['asset.banner.field.image']}>
            <div className="flex min-w-0 items-center gap-3">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="h-16 w-32 rounded-lg object-cover" />
              ) : (
                <div className="h-16 w-32 rounded-lg bg-arco-fill-2" />
              )}
              <Upload accept={ADMIN_IMAGE_ACCEPT} showUploadList={false} beforeUpload={beforeUpload} disabled={uploading}>
                <Button type="secondary" icon={<IconUpload />} loading={uploading}>
                  {t['asset.banner.upload']}
                </Button>
              </Upload>
            </div>
          </FormItem>
          <FormItem className="col-span-2 max-md:col-span-1" field="title" label={t['asset.banner.field.title']}>
            <Input maxLength={100} showWordLimit />
          </FormItem>
          <FormItem field="action_type" label={t['asset.banner.field.actionType']} rules={[required(t['asset.banner.field.actionType'])]}>
            <Select
              options={(['none', 'internal_route', 'web_url'] as const).map((value) => ({
                label: t[`asset.banner.actionType.${value}`],
                value
              }))}
            />
          </FormItem>
          <FormItem
            field="action_value"
            label={t['asset.banner.field.actionValue']}
            rules={
              actionType === 'none'
                ? undefined
                : [
                    required(t['asset.banner.field.actionValue']),
                    {
                      validator: (value, callback) => {
                        const target = String(value || '').trim();
                        const valid =
                          actionType === 'internal_route'
                            ? target.startsWith('/')
                            : isHttpUrl(target);
                        callback(valid ? undefined : t['asset.banner.validation.actionValue']);
                      }
                    }
                  ]
            }
          >
            <Input disabled={actionType === 'none'} placeholder={t['asset.banner.placeholder.actionValue']} />
          </FormItem>
          <FormItem field="sort" label={t['asset.banner.field.sort']}>
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </FormItem>
          <FormItem field="is_enable" label={t['asset.banner.field.enabled']} triggerPropName="checked">
            <Switch />
          </FormItem>
          <FormItem field="starts_at" label={t['asset.banner.field.startsAt']}>
            <DatePicker showTime style={{ width: '100%' }} />
          </FormItem>
          <FormItem
            field="ends_at"
            label={t['asset.banner.field.endsAt']}
            dependencies={['starts_at']}
            rules={[
              {
                validator: (value, callback) => {
                  const start = toRfc3339(form.getFieldValue('starts_at'));
                  const end = toRfc3339(value);
                  callback(
                    !start || !end || Date.parse(end) > Date.parse(start)
                      ? undefined
                      : t['asset.banner.validation.schedule']
                  );
                }
              }
            ]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </FormItem>
        </div>
      </Form>
    </Modal>
  );
}
