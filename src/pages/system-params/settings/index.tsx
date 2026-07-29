import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  InputNumber,
  Layout,
  Menu,
  Message,
  Modal,
  Space,
  Switch,
  Typography
} from '@arco-design/web-react';
import {
  getSystemParams,
  saveSystemParams
} from '@shared/api/biz';

const MenuItem = Menu.Item;
const Sider = Layout.Sider;
const Content = Layout.Content;

type SectionKey =
  | 'login'
  | 'invite'
  | 'friend'
  | 'group'
  | 'message'
  | 'push';

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'login', label: '登录注册' },
  { key: 'invite', label: '邀请码配置' },
  { key: 'friend', label: '好友与通讯录' },
  { key: 'group', label: '群聊配置' },
  { key: 'message', label: '聊天消息配置' },
  { key: 'push', label: '通知推送配置' }
];

function SwitchField({
  field,
  label,
  tip,
  onBeforeOff
}: {
  field: string;
  label: string;
  tip?: string;
  onBeforeOff?: () => Promise<boolean>;
}) {
  return (
    <Form.Item
      field={field}
      label={label}
      triggerPropName="checked"
      extra={tip}
    >
      <Switch
        onChange={async (checked, event) => {
          if (checked || !onBeforeOff) return;
          event.preventDefault?.();
          const ok = await onBeforeOff();
          if (!ok) {
            // revert handled by form not updating if we throw — use Modal flow in parent
          }
        }}
      />
    </Form.Item>
  );
}

export default function SystemParamsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<SectionKey>('login');
  const [dirty, setDirty] = useState(false);
  const initialRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    setLoading(true);
    getSystemParams()
      .then((res) => {
        const data = res as Record<string, unknown>;
        initialRef.current = data;
        form.setFieldsValue(data);
      })
      .finally(() => setLoading(false));
  }, [form]);

  const confirmLeave = () =>
    new Promise<boolean>((resolve) => {
      if (!dirty) {
        resolve(true);
        return;
      }
      Modal.confirm({
        title: '有未保存修改',
        content: '离开当前分类将丢失未保存的修改，是否继续？',
        onOk: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });

  const confirmTurnOff = (title: string, content: string) =>
    new Promise<boolean>((resolve) => {
      Modal.confirm({
        title,
        content,
        onOk: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });

  const sectionContent = useMemo(() => {
    switch (section) {
      case 'login':
        return (
          <>
            <Typography.Title heading={6}>登录注册方式</Typography.Title>
            <SwitchField
              field="loginPhone"
              label="手机登录/注册入口"
              tip="关闭后 APP 登录注册页隐藏对应入口；已登录用户不受影响"
              onBeforeOff={() =>
                confirmTurnOff(
                  '确认关闭该登录/注册入口？',
                  '关闭某个登录或注册入口后，APP 登录注册页隐藏对应入口；已登录用户不受影响。'
                )
              }
            />
            <SwitchField field="loginEmail" label="邮箱登录/注册入口" />
            <SwitchField field="loginPassword" label="账号密码登录入口" />
            <SwitchField
              field="registerAccount"
              label="账号注册入口"
              tip="关闭账号注册入口不等于关闭账号密码登录"
            />
          </>
        );
      case 'invite':
        return (
          <>
            <Typography.Title heading={6}>邀请码配置</Typography.Title>
            <SwitchField
              field="inviteEnabled"
              label="邀请功能总开关"
              onBeforeOff={() =>
                confirmTurnOff('确认关闭邀请功能？', '关闭后新用户注册将无法使用邀请码。')
              }
            />
            <SwitchField field="inviteRequired" label="注册是否必须邀请码" />
            <Form.Item field="inviteExpireDays" label="邀请码有效期（天）">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item field="inviteMaxUse" label="邀请码使用次数">
              <InputNumber min={1} />
            </Form.Item>
          </>
        );
      case 'friend':
        return (
          <>
            <Typography.Title heading={6}>好友与通讯录</Typography.Title>
            <SwitchField field="friendSearchById" label="用户 ID 搜索好友" />
          </>
        );
      case 'group':
        return (
          <>
            <Typography.Title heading={6}>群聊配置</Typography.Title>
            <SwitchField
              field="allowCreateGroup"
              label="是否允许用户创建群聊"
              onBeforeOff={() =>
                confirmTurnOff('确认关闭创建群聊？', '关闭后用户将无法新建群聊。')
              }
            />
            <Form.Item field="minGroupMembers" label="建群最少人数">
              <InputNumber min={2} />
            </Form.Item>
            <Form.Item field="maxGroupMembers" label="普通群人数上限">
              <InputNumber min={3} />
            </Form.Item>
            <SwitchField field="groupVerify" label="加群验证总开关" />
            <SwitchField field="defaultGroupVerify" label="新群默认入群验证" />
            <Form.Item field="joinExpireHours" label="入群申请有效期（小时）">
              <InputNumber min={1} />
            </Form.Item>
            <SwitchField field="allowInviteFriend" label="允许邀请好友" />
            <SwitchField field="allowAddFriendInGroup" label="允许群内加好友" />
            <SwitchField field="allowEditGroupNick" label="允许群昵称修改" />
          </>
        );
      case 'message':
        return (
          <>
            <Typography.Title heading={6}>消息类型开关</Typography.Title>
            {(
              [
                ['msgText', '文字消息'],
                ['msgImage', '图片消息'],
                ['msgVideo', '视频消息'],
                ['msgAudio', '音频消息'],
                ['msgFile', '文件消息'],
                ['msgVoice', '语音消息'],
                ['msgCard', '名片消息']
              ] as const
            ).map(([field, label]) => (
              <SwitchField
                key={field}
                field={field}
                label={label}
                onBeforeOff={() =>
                  confirmTurnOff('确认关闭该消息类型？', `关闭后用户将无法发送${label}。`)
                }
              />
            ))}
            <Typography.Title heading={6}>消息规格与能力</Typography.Title>
            <Form.Item field="textMaxLen" label="文字消息字数上限">
              <InputNumber min={1} />
            </Form.Item>
            <SwitchField field="multiSelect" label="多选消息开关" />
            <Form.Item field="multiSelectMax" label="多选消息上限">
              <InputNumber min={1} />
            </Form.Item>
            <SwitchField field="msgEdit" label="消息编辑能力" />
            <SwitchField field="msgQuote" label="消息引用能力" />
            <SwitchField field="msgForward" label="消息转发能力" />
            <SwitchField field="msgDownload" label="消息下载能力" />
          </>
        );
      case 'push':
        return (
          <>
            <Typography.Title heading={6}>通知推送配置</Typography.Title>
            <SwitchField field="pushPrivate" label="私聊消息推送" />
            <SwitchField field="pushGroup" label="群聊消息推送" />
            <SwitchField field="pushFriendGroupApply" label="好友/群申请推送" />
          </>
        );
      default:
        return null;
    }
  }, [section]);

  const onSave = async () => {
    setSaving(true);
    try {
      const values = form.getFieldsValue();
      await saveSystemParams(values);
      initialRef.current = values;
      setDirty(false);
      Message.success('保存成功');
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    form.setFieldsValue(initialRef.current);
    setDirty(false);
    Message.info('已还原未保存修改');
  };

  return (
    <Card loading={loading} bordered={false} bodyStyle={{ padding: 0 }}>
      <Alert
        type="info"
        content="修改系统参数将影响客户端行为，关闭关键入口或消息类型前请确认影响范围。"
        style={{ marginBottom: 0, borderRadius: 0 }}
      />
      <Layout style={{ minHeight: 640 }}>
        <Sider width={220} style={{ background: 'var(--color-bg-2)' }}>
          <Menu
            selectedKeys={[section]}
            onClickMenuItem={async (key) => {
              const ok = await confirmLeave();
              if (ok) {
                if (dirty) form.setFieldsValue(initialRef.current);
                setDirty(false);
                setSection(key as SectionKey);
              }
            }}
          >
            {SECTIONS.map((item) => (
              <MenuItem key={item.key}>{item.label}</MenuItem>
            ))}
          </Menu>
        </Sider>
        <Content style={{ padding: 24 }}>
          <Form
            form={form}
            layout="vertical"
            onValuesChange={() => setDirty(true)}
            style={{ maxWidth: 560 }}
          >
            {sectionContent}
          </Form>
          <Space style={{ marginTop: 24 }}>
            <Button onClick={onCancel} disabled={!dirty}>
              取消
            </Button>
            <Button type="primary" loading={saving} onClick={onSave}>
              保存
            </Button>
          </Space>
        </Content>
      </Layout>
    </Card>
  );
}
