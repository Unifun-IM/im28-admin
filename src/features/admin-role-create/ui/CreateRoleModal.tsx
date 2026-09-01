import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Grid,
  Input,
  Message,
  Modal,
  Switch
} from '@arco-design/web-react';
import {
  postV1AdminPermissionsList,
  postV1AdminRolesCreate,
  postV1AdminRolesDetail,
  postV1AdminRolesUpdate
} from '@shared/api/admin/rbac';
import useLocale from '@shared/lib/useLocale';
import { buildPermModules } from '../model/permTree';
import PermissionConfig from './PermissionConfig';
import '@shared/ui/biz-form-modal.less';
import './create-role-modal.less';

const FormItem = Form.Item;
const { Row, Col } = Grid;

export type CreateRoleModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  /** 传入则为编辑模式 */
  role?: AdminAPI.SysRoleWrap | null;
};

type CreateRoleForm = {
  name: string;
  description?: string;
  is_enable?: boolean;
  permission_keys?: string[];
};

function toRoleCode(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]/g, '')
    .slice(0, 24);
  return `${slug || 'role'}_${Date.now().toString(36)}`;
}

/**
 * 新建 / 编辑角色 — Figma 666:21515
 * Create：code 由名称自动生成；Update：保留原 code
 */
export default function CreateRoleModal({
  visible,
  onCancel,
  onSuccess,
  role
}: CreateRoleModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<CreateRoleForm>();
  const [submitting, setSubmitting] = useState(false);
  const [permLoading, setPermLoading] = useState(false);
  const [permCatalog, setPermCatalog] = useState<AdminAPI.SysPermission[]>(
    []
  );
  const isEnable = Form.useWatch('is_enable', form);
  const editingId = role?.role?.id;
  const isEdit = editingId != null;

  const keyToId = useMemo(() => {
    const map = new Map<string, number>();
    permCatalog.forEach((p) => {
      if (p.key && p.id != null) map.set(p.key, p.id);
    });
    return map;
  }, [permCatalog]);

  const permModules = useMemo(
    () => buildPermModules(permCatalog),
    [permCatalog]
  );

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    let cancelled = false;

    const fetchAllPermissions = async () => {
      const pageSize = 100;
      let page = 1;
      let total = Infinity;
      const all: AdminAPI.SysPermission[] = [];
      while (all.length < total) {
        const res = await postV1AdminPermissionsList({
          page,
          page_size: pageSize
        });
        const list = res.data?.list || [];
        total = res.data?.total ?? list.length;
        all.push(...list);
        if (!list.length || list.length < pageSize) break;
        page += 1;
      }
      return all;
    };

    (async () => {
      setPermLoading(true);
      try {
        const catalog = await fetchAllPermissions();
        if (cancelled) return;
        setPermCatalog(catalog);
      } catch {
        if (!cancelled) setPermCatalog([]);
      } finally {
        if (!cancelled) setPermLoading(false);
      }

      if (cancelled) return;

      if (editingId == null) {
        form.setFieldsValue({ is_enable: true, permission_keys: [] });
        return;
      }

      try {
        const detail = await postV1AdminRolesDetail({ id: editingId });
        if (cancelled) return;
        const r = detail.data?.role;
        const perms =
          detail.data?.permissions?.permissions ||
          role?.permissions?.permissions ||
          [];
        form.setFieldsValue({
          name: r?.name || role?.role?.name || '',
          description: r?.description ?? role?.role?.description,
          is_enable: (r?.is_enable ?? role?.role?.is_enable) !== false,
          permission_keys: perms
            .map((p) => p.key)
            .filter((k): k is string => Boolean(k))
        });
      } catch {
        if (cancelled) return;
        form.setFieldsValue({
          name: role?.role?.name || '',
          description: role?.role?.description,
          is_enable: role?.role?.is_enable !== false,
          permission_keys: (role?.permissions?.permissions || [])
            .map((p) => p.key)
            .filter((k): k is string => Boolean(k))
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, editingId, form, role]);

  const submit = async () => {
    try {
      const values = await form.validate();
      const keys = values.permission_keys || [];
      const permission_ids = keys
        .map((k) => keyToId.get(k))
        .filter((id): id is number => typeof id === 'number');

      if (keys.length && !permission_ids.length && permCatalog.length) {
        Message.warning(t['createRole.perm.mapFail']);
        return;
      }

      setSubmitting(true);
      const payload = {
        name: values.name,
        description: values.description || undefined,
        is_enable: values.is_enable !== false,
        permission_ids: permission_ids.length ? permission_ids : undefined
      };

      if (isEdit && editingId != null) {
        await postV1AdminRolesUpdate({
          id: editingId,
          code: role?.role?.code || toRoleCode(values.name),
          ...payload
        });
      } else {
        await postV1AdminRolesCreate({
          code: toRoleCode(values.name),
          ...payload
        });
      }

      Message.success(common['common.success']);
      onSuccess?.();
      onCancel();
    } catch {
      // validate
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      className="use-biz-form-modal use-create-role-modal"
      wrapClassName="use-create-role-modal-wrap"
      title={isEdit ? t['editRole.title'] : t['createRole.title']}
      visible={visible}
      onCancel={onCancel}
      unmountOnExit
      closable={false}
      maskClosable={false}
      style={{ width: 780 }}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[14px] text-arco-text-1">
            <span>{t['createRole.field.enableRole']}</span>
            <Switch
              className="use-switch-success"
              checked={isEnable !== false}
              onChange={(v) => form.setFieldValue('is_enable', v)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="outline" className="min-w-[80px]" onClick={onCancel}>
              {common['common.cancel']}
            </Button>
            <Button
              type="primary"
              className="min-w-[80px]"
              loading={submitting}
              onClick={submit}
            >
              {isEdit ? common['common.save'] : common['common.create']}
            </Button>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredSymbol={{ position: 'end' }}
        className="use-create-role-form"
      >
        <Row gutter={12}>
          <Col span={12} xs={24} md={12}>
            <FormItem
              field="name"
              label={t['createRole.field.name']}
              rules={[
                {
                  required: true,
                  message: t['createRole.placeholder.name']
                }
              ]}
            >
              <Input
                allowClear
                maxLength={64}
                placeholder={t['createRole.placeholder.name']}
              />
            </FormItem>
          </Col>
          <Col span={12} xs={24} md={12}>
            <FormItem
              field="description"
              label={t['createRole.field.description']}
            >
              <Input
                allowClear
                maxLength={200}
                placeholder={t['createRole.placeholder.description']}
              />
            </FormItem>
          </Col>
        </Row>

        <FormItem
          field="permission_keys"
          label={t['createRole.field.permissions']}
          rules={[
            {
              required: true,
              validator: (value, callback) => {
                if (!value?.length) {
                  callback(t['createRole.perm.required']);
                  return;
                }
                callback();
              }
            }
          ]}
          triggerPropName="value"
        >
          <PermissionConfig modules={permModules} loading={permLoading} />
        </FormItem>
      </Form>
    </Modal>
  );
}
