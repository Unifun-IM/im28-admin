import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Select
} from '@arco-design/web-react';
import { IconSearch, IconUser } from '@arco-design/web-react/icon';
import { getUserList, postWhitelistAction } from '@shared/api/biz';
import iconWarning from './assets/icon-exclamation-circle-fill.svg';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

const WHITELIST_TYPE_OPTIONS = [
  { label: '测试账号', value: '测试账号' },
  { label: '内部员工', value: '内部员工' },
  { label: 'VIP 用户', value: 'VIP用户' },
  { label: '合作方', value: '合作方' },
  { label: '其他', value: '其他' }
];

const REMOVE_REASON_OPTIONS = [
  { label: '不再需要', value: '不再需要' },
  { label: '误添加', value: '误添加' },
  { label: '账号注销', value: '账号注销' },
  { label: '其他', value: '其他' }
];

export type WhitelistActionModalProps = {
  visible: boolean;
  /** add = 添加白名单（805:20062）；remove = 移除白名单（805:20148） */
  mode: 'add' | 'remove';
  /** 移除时：单条 / 批量 */
  variant?: 'single' | 'batch';
  userIds?: string[];
  onCancel: () => void;
  onSuccess?: () => void;
};

/**
 * 添加 / 移除白名单弹窗
 * 添加 Figma 805:20062；移除 Figma 805:20148
 */
export default function WhitelistActionModal({
  visible,
  mode,
  variant = 'single',
  userIds = [],
  onCancel,
  onSuccess
}: WhitelistActionModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [userOptions, setUserOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [userSearching, setUserSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAdd = mode === 'add';
  const isBatch = variant === 'batch';
  const count = userIds.length || 1;

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    setUserOptions([]);
  }, [visible, mode, form]);

  const searchUsers = useCallback(async (keyword: string) => {
    setUserSearching(true);
    try {
      const res = await getUserList({
        page: 1,
        pageSize: 20,
        keyword: keyword || undefined
      });
      setUserOptions(
        ((res.list || []) as Record<string, unknown>[]).map((row) => ({
          value: String(row.id || row.userId || ''),
          label: `${row.nickname || '--'}（ID：${row.userId || '--'}）`
        }))
      );
    } finally {
      setUserSearching(false);
    }
  }, []);

  const onUserSearch = (keyword: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      searchUsers(keyword.trim());
    }, 300);
  };

  const handleOk = async () => {
    let values: {
      targetUser?: string;
      whitelistType?: string;
      reason?: string;
      reasonDetail?: string;
      remark?: string;
    };
    try {
      values = await form.validate();
    } catch {
      return;
    }
    setSubmitting(true);
    try {
      const ids = isAdd
        ? values.targetUser
          ? [values.targetUser]
          : []
        : userIds;
      await postWhitelistAction({
        ids,
        action: mode,
        whitelistType: values.whitelistType,
        reason: values.reason || values.whitelistType,
        reasonDetail: values.reasonDetail,
        remark: values.remark
      });
      Message.success(
        isAdd
          ? '已添加白名单'
          : isBatch
            ? `已移除 ${count} 位用户白名单`
            : '已移除白名单'
      );
      onSuccess?.();
      onCancel();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      className="use-blacklist-action-modal"
      wrapClassName="use-blacklist-action-modal-wrap"
      visible={visible}
      title={null}
      footer={null}
      closable={false}
      maskClosable={false}
      unmountOnExit
      onCancel={onCancel}
      style={{ width: 780 }}
    >
      <div className="box-border flex h-[48px] items-center gap-[8px] border-b border-solid border-[rgba(0,0,0,0.08)] px-[24px]">
        {!isAdd && (
          <span className="relative inline-block size-[20px] shrink-0">
            <img
              alt=""
              src={iconWarning}
              className="absolute left-[1.67px] top-[1.67px] block size-[16.67px] max-w-none"
            />
          </span>
        )}
        <div className="text-[16px] font-medium leading-[24px] text-arco-text-1">
          {isAdd ? '添加白名单用户' : '移除白名单用户'}
        </div>
      </div>

      <div className="box-border flex flex-col gap-[12px] px-[24px] pb-[12px] pt-[12px]">
        <p className="m-0 text-[14px] leading-[21px] text-arco-text-1">
          {isAdd
            ? '加入白名单后，用户可豁免平台规则。白名单不会解除账号封禁，不会跳过违法内容识别和监管要求。'
            : isBatch
              ? `移除后，${count}位用户后续提交的新操作将按照平台正常规则校验；已经完成的历史操作不受影响。`
              : '移除后，用户后续提交的新操作将按照平台正常规则校验；已经完成的历史操作不受影响。'}
        </p>

        <Form
          form={form}
          layout="vertical"
          className="use-blacklist-action-form"
          requiredSymbol={{ position: 'end' }}
        >
          {isAdd ? (
            <>
              <FormItem
                field="targetUser"
                label="目标用户"
                rules={[{ required: true, message: '请选择目标用户' }]}
              >
                <Select
                  showSearch
                  allowClear
                  filterOption={false}
                  loading={userSearching}
                  placeholder="搜索选择用户ID，昵称，手机号，邮箱，账号"
                  options={userOptions}
                  onSearch={onUserSearch}
                  onFocus={() => {
                    if (!userOptions.length) searchUsers('');
                  }}
                  prefix={<IconUser className="text-arco-text-3" />}
                  suffixIcon={<IconSearch className="text-arco-text-3" />}
                />
              </FormItem>
              <FormItem
                field="whitelistType"
                label="白名单类型"
                rules={[{ required: true, message: '请选择白名单类型' }]}
              >
                <Select
                  placeholder="请选择"
                  options={WHITELIST_TYPE_OPTIONS}
                  allowClear
                />
              </FormItem>
              <FormItem field="reasonDetail" label="原因说明">
                <TextArea
                  placeholder="请输入添加具体原因"
                  style={{ minHeight: 50 }}
                />
              </FormItem>
            </>
          ) : (
            <>
              <FormItem
                field="reason"
                label="移除原因"
                rules={[{ required: true, message: '请选择移除原因' }]}
              >
                <Select
                  placeholder="请选择"
                  options={REMOVE_REASON_OPTIONS}
                  allowClear
                />
              </FormItem>
              <FormItem field="reasonDetail" label="原因说明">
                <TextArea placeholder="添加说明" style={{ minHeight: 50 }} />
              </FormItem>
            </>
          )}

          <FormItem field="remark" label="备注">
            <TextArea placeholder="添加备注" style={{ minHeight: 50 }} />
          </FormItem>
        </Form>
      </div>

      <div className="box-border flex h-[48px] items-center justify-end gap-[8px] border-t border-solid border-[var(--color-border-1,#f2f3f5)] px-[24px]">
        <Button className="min-w-[80px]" onClick={onCancel}>
          取消
        </Button>
        <Button
          className="min-w-[80px]"
          type="primary"
          status={isAdd ? undefined : 'danger'}
          loading={submitting}
          onClick={handleOk}
        >
          {isAdd ? '确认添加' : '移除白名单'}
        </Button>
      </div>
    </Modal>
  );
}
