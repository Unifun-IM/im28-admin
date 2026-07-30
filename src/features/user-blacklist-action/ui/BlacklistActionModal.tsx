import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Radio,
  Select
} from '@arco-design/web-react';
import { postBlacklistAction } from '@shared/api/biz';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import iconSuccess from '@shared/assets/icon-check-circle-fill.svg';
import './blacklist-action-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

const ADD_REASON_OPTIONS = [
  { label: '诈骗或钓鱼', value: '诈骗或钓鱼' },
  { label: '频繁转账异常', value: '频繁转账异常' },
  { label: '骚扰他人', value: '骚扰他人' },
  { label: '违规内容', value: '违规内容' },
  { label: '其他', value: '其他' }
];

const REMOVE_REASON_OPTIONS = [
  { label: '误封', value: '误封' },
  { label: '申诉通过', value: '申诉通过' },
  { label: '处罚期满', value: '处罚期满' },
  { label: '其他', value: '其他' }
];

export type BlacklistActionModalProps = {
  visible: boolean;
  /** add = 加入黑名单；remove = 解除黑名单 */
  mode: 'add' | 'remove';
  /** single = 单条（750:16425/16440）；batch = 批量（804:19981/20090） */
  variant?: 'single' | 'batch';
  userIds: string[];
  onCancel: () => void;
  onSuccess?: () => void;
};

function addDescription(count: number, batch: boolean) {
  if (batch) {
    return `拉黑后，${count}位用户将无法登录IM28。用户当前登录会话将失效，用户邀请码同步失效。历史邀请关系、好友关系、群聊关系及服务端留存记录不会删除。解除封禁后，用户可重新登录，邀请码恢复有效。`;
  }
  return '拉黑后，该用户将无法登录IM28。用户当前登录会话将失效，用户邀请码同步失效。历史邀请关系、好友关系、群聊关系及服务端留存记录不会删除。解除封禁后，用户可重新登录，邀请码恢复有效。';
}

function removeDescription(count: number, batch: boolean) {
  if (batch) {
    return `解禁后，${count}位用户可以重新登录IM28，用户邀请码恢复有效。历史邀请关系、好友关系、群聊关系及服务端留存记录不受影响。`;
  }
  return '解禁后，该用户可以重新登录IM28，用户邀请码恢复有效。历史邀请关系、好友关系、群聊关系及服务端留存记录不受影响。';
}

/**
 * 加入 / 解除黑名单弹窗
 * 单条 Figma 750:16425 / 750:16440
 * 批量 Figma 804:19981 / 804:20090
 */
export default function BlacklistActionModal({
  visible,
  mode,
  variant = 'single',
  userIds,
  onCancel,
  onSuccess
}: BlacklistActionModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isAdd = mode === 'add';
  const isBatch = variant === 'batch';
  const count = userIds.length || 1;

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    if (isBatch && isAdd) {
      form.setFieldsValue({ durationType: 'permanent' });
    }
  }, [visible, mode, variant, form, isBatch, isAdd]);

  const handleOk = async () => {
    let values: {
      durationType?: 'temporary' | 'permanent';
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
      await postBlacklistAction({
        ids: userIds,
        action: mode,
        durationType: values.durationType,
        reason: values.reason,
        reasonDetail: values.reasonDetail,
        remark: values.remark
      });
      Message.success(
        isAdd
          ? isBatch
            ? `已将 ${count} 位用户加入黑名单`
            : '已加入黑名单'
          : isBatch
            ? `已解除 ${count} 位用户黑名单`
            : '已解除黑名单'
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
        <span className="relative inline-block size-[20px] shrink-0">
          <img
            alt=""
            src={isAdd ? iconWarning : iconSuccess}
            className="absolute left-[1.67px] top-[1.67px] block size-[16.67px] max-w-none"
          />
        </span>
        <div className="text-[16px] font-medium leading-[24px] text-arco-text-1">
          {isAdd ? '确认将该用户加入黑名单？' : '确认将该用户解除黑名单？'}
        </div>
      </div>

      <div className="box-border flex flex-col gap-[12px] px-[24px] pb-[12px] pt-[12px]">
        <p className="m-0 text-[14px] leading-[21px] text-arco-text-1">
          {isAdd
            ? addDescription(count, isBatch)
            : removeDescription(count, isBatch)}
        </p>

        <Form
          form={form}
          layout="vertical"
          className="use-blacklist-action-form"
          requiredSymbol={{ position: 'end' }}
        >
          {isBatch && isAdd && (
            <FormItem
              field="durationType"
              label="消息类型"
              rules={[{ required: true, message: '请选择拉黑类型' }]}
              initialValue="permanent"
            >
              <Radio.Group className="use-blacklist-duration-radio">
                <Radio value="temporary">限时拉黑</Radio>
                <Radio value="permanent">永久拉黑</Radio>
              </Radio.Group>
            </FormItem>
          )}

          <FormItem
            field="reason"
            label={isAdd ? '拉黑原因' : '解禁原因'}
            rules={[
              {
                required: true,
                message: isAdd ? '请选择拉黑原因' : '请选择解禁原因'
              }
            ]}
          >
            <Select
              placeholder={isAdd ? '选择拉黑原因' : '选择解禁原因'}
              options={isAdd ? ADD_REASON_OPTIONS : REMOVE_REASON_OPTIONS}
              allowClear
            />
          </FormItem>

          <FormItem field="reasonDetail" label="原因说明">
            <TextArea
              placeholder={
                isAdd
                  ? '频繁转账，诈骗或钓鱼信息'
                  : '请输入解除封禁的具体原因'
              }
              style={{ minHeight: 50 }}
            />
          </FormItem>

          {(isBatch || !isAdd) && (
            <FormItem field="remark" label="备注">
              <TextArea placeholder="添加备注" style={{ minHeight: 50 }} />
            </FormItem>
          )}
        </Form>
      </div>

      <div className="box-border flex h-[48px] items-center justify-end gap-[8px] border-t border-solid border-[var(--color-border-1,#f2f3f5)] px-[24px]">
        <Button className="min-w-[80px]" onClick={onCancel}>
          取消
        </Button>
        <Button
          className="min-w-[80px]"
          type="primary"
          status={isAdd ? 'danger' : undefined}
          loading={submitting}
          onClick={handleOk}
        >
          {isAdd ? '加入黑名单' : '确认解除'}
        </Button>
      </div>
    </Modal>
  );
}
