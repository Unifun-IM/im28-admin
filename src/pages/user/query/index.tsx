import React, { useCallback, useEffect, useState } from 'react';
import {
  Form,
  Input,
  DatePicker,
  Button,
  Select,
  Tag,
  Dropdown,
  Menu
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import {
  ActionLinks,
  AvatarNameCell,
  BizListPage,
  DoubleLineCell,
  FilterField,
  FilterSelect,
  StatusBadge
} from '@widgets/biz-list';
import { getUserList } from '@shared/api/biz';
import UserDetailDrawer from '../detail/UserDetailDrawer';
import BlacklistActionModal from '../BlacklistActionModal';

const FormItem = Form.Item;

const USER_KEYWORD_OPTIONS = [
  { label: '用户ID', value: 'userId' },
  { label: '昵称', value: 'nickname' },
  { label: '手机号', value: 'phone' },
  { label: '邮箱', value: 'email' },
  { label: '账号', value: 'account' }
];

const INVITER_KEYWORD_OPTIONS = [
  { label: '邀请码', value: 'inviteCode' },
  { label: '邀请人昵称', value: 'inviterNickname' }
];

function statusToBadge(v: string): 'success' | 'error' | 'warning' | 'default' {
  if (v === '正常') return 'success';
  if (v === '黑名单') return 'error';
  if (v === '注销') return 'warning';
  return 'default';
}

/**
 * 用户查询 — Figma 741:24735
 * 批量搜索 — Figma 811:22055
 */
export default function UserQueryPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [blacklistModal, setBlacklistModal] = useState<{
    mode: 'add' | 'remove';
    userIds: string[];
    variant: 'single' | 'batch';
  } | null>(null);

  const openBlacklistModal = (
    mode: 'add' | 'remove',
    userIds: string[],
    variant: 'single' | 'batch' = 'single'
  ) => {
    if (!userIds.length) return;
    setBlacklistModal({ mode, userIds, variant });
  };

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await getUserList({ page: p, pageSize: size, ...values });
        setData((res.list || []) as Record<string, unknown>[]);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [form, page, pageSize]
  );

  useEffect(() => {
    fetchData(1, pageSize);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sharedFilters = (
    <>
      <FilterField span="narrow">
        <FormItem field="status" label="账号状态" initialValue="">
          <FilterSelect
            placeholder="全部"
            options={[
              { label: '全部', value: '' },
              { label: '正常', value: '正常' },
              { label: '黑名单', value: '黑名单' },
              { label: '注销', value: '注销' }
            ]}
          />
        </FormItem>
      </FilterField>
      <FilterField span="narrow">
        <FormItem field="online" label="在线状态" initialValue="">
          <FilterSelect
            placeholder="全部"
            options={[
              { label: '全部', value: '' },
              { label: '在线', value: '在线' },
              { label: '离线', value: '离线' }
            ]}
          />
        </FormItem>
      </FilterField>
      <FilterField span={2}>
        <FormItem field="registerTime" label="注册时间">
          <DatePicker.RangePicker
            style={{ width: '100%' }}
            placeholder={['开始时间', '结束时间']}
          />
        </FormItem>
      </FilterField>
      <FilterField span={2}>
        <FormItem field="lastActiveTime" label="最后操作时间">
          <DatePicker.RangePicker
            style={{ width: '100%' }}
            placeholder={['开始时间', '结束时间']}
          />
        </FormItem>
      </FilterField>
      <FilterField span={2}>
        <FormItem
          field="inviterKeyword"
          label="邀请人关键词搜索"
          triggerPropName="value"
        >
          <Input
            allowClear
            placeholder="请输入"
            addBefore={
              <FormItem field="inviterKeywordType" noStyle initialValue="inviteCode">
                <Select
                  options={INVITER_KEYWORD_OPTIONS}
                  style={{ width: 108 }}
                  triggerProps={{ autoAlignPopupWidth: false }}
                />
              </FormItem>
            }
            suffix={<IconSearch className="text-arco-text-3" />}
          />
        </FormItem>
      </FilterField>
    </>
  );

  return (
    <>
    <BizListPage
      form={form}
      title="用户列表"
      filterCollapsible={false}
      filterDefaultCollapsed={false}
      filterResetText="重置"
      filterExtraActions={
        batchMode ? (
          <Button
            type="text"
            className="use-biz-filter-action-text is-danger"
            onClick={() => {
              setBatchMode(false);
              form.setFieldValue('batchUserIds', undefined);
            }}
          >
            取消批量搜索
          </Button>
        ) : (
          <Button
            type="text"
            className="use-biz-filter-action-text"
            onClick={() => setBatchMode(true)}
          >
            批量搜索
          </Button>
        )
      }
      filter={
        batchMode ? (
          <>
            <FilterField span="full">
              <FormItem
                field="batchUserIds"
                label={
                  <span className="inline-flex items-center gap-[4px]">
                    <span>批量用户ID</span>
                    <span className="use-biz-filter-label-hint">
                      可输入用户ID，支持逗号、空格或从Excel复制一列
                    </span>
                  </span>
                }
              >
                <Input.TextArea placeholder="请输入" style={{ minHeight: 56 }} />
              </FormItem>
            </FilterField>
            {sharedFilters}
          </>
        ) : (
          <>
            <FilterField span="narrow">
              <FormItem field="keyword" label="关键词搜索">
                <Input
                  allowClear
                  placeholder="请输入"
                  addBefore={
                    <FormItem field="keywordType" noStyle initialValue="userId">
                      <Select
                        options={USER_KEYWORD_OPTIONS}
                        style={{ width: 80 }}
                        triggerProps={{ autoAlignPopupWidth: false }}
                      />
                    </FormItem>
                  }
                  suffix={<IconSearch className="text-arco-text-3" />}
                />
              </FormItem>
            </FilterField>
            {sharedFilters}
          </>
        )
      }
      onSearch={() => {
        setPage(1);
        fetchData(1, pageSize);
      }}
      onReset={() => {
        form.resetFields();
        setPage(1);
        fetchData(1, pageSize);
      }}
      onRefresh={() => fetchData(page, pageSize)}
      toolbar={
        <Dropdown
          disabled={!selectedRowKeys.length}
          droplist={
            <Menu
              onClickMenuItem={(key) => {
                openBlacklistModal(
                  key as 'add' | 'remove',
                  selectedRowKeys.map(String),
                  'batch'
                );
              }}
            >
              <Menu.Item key="add">批量加入黑名单</Menu.Item>
              <Menu.Item key="remove">批量解除黑名单</Menu.Item>
            </Menu>
          }
        >
          <Button type="primary" disabled={!selectedRowKeys.length}>
            批量操作
          </Button>
        </Dropdown>
      }
      batchActions={{
        extra: (
          <>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-2 border-0 border-l border-solid border-[#262828] bg-transparent px-3 text-sm leading-[21px] text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() =>
                openBlacklistModal(
                  'add',
                  selectedRowKeys.map(String),
                  'batch'
                )
              }
            >
              拉黑
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-2 border-0 border-l border-solid border-[#262828] bg-transparent px-3 text-sm leading-[21px] text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() =>
                openBlacklistModal(
                  'remove',
                  selectedRowKeys.map(String),
                  'batch'
                )
              }
            >
              解禁
            </button>
          </>
        )
      }}
      tableProps={{
        loading,
        data,
        columns: [
          {
            title: '用户',
            dataIndex: 'nickname',
            width: 160,
            ellipsis: false,
            render: (_: unknown, row: Record<string, unknown>) => (
              <AvatarNameCell
                name={row.nickname as string}
                sub={`ID：${row.userId}`}
                copyText={String(row.userId || '')}
                avatar={row.avatar as string | undefined}
              />
            )
          },
          {
            title: '联系方式',
            dataIndex: 'phone',
            width: 167,
            ellipsis: false,
            render: (_: unknown, row: Record<string, unknown>) => (
              <DoubleLineCell
                primary={`手机：${(row.phone as string) || '--'}`}
                secondary={`邮箱：${(row.email as string) || '--'}`}
              />
            )
          },
          {
            title: '账号',
            dataIndex: 'account',
            width: 120
          },
          {
            title: '邀请人',
            dataIndex: 'inviteCode',
            width: 160,
            ellipsis: false,
            render: (_: unknown, row: Record<string, unknown>) => (
              <AvatarNameCell
                hideAvatar
                name={(row.inviterName as string) || '—'}
                sub={`邀请码：${row.inviteCode || '--'}`}
                copyText={String(row.inviteCode || '')}
              />
            )
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 89,
            render: (v: string) => (
              <StatusBadge status={statusToBadge(v)} text={v} />
            )
          },
          {
            title: '注册时间',
            dataIndex: 'registerTime',
            width: 154
          },
          {
            title: '最后操作时间',
            dataIndex: 'lastActiveTime',
            width: 154
          },
          {
            title: '在线',
            dataIndex: 'online',
            width: 120,
            render: (v: string) => (
              <Tag
                color={v === '在线' ? 'green' : 'gray'}
                size="small"
                className="!m-0"
              >
                {v}
              </Tag>
            )
          },
          {
            title: '操作',
            dataIndex: 'op',
            width: 80,
            fixed: 'right',
            render: (_: unknown, row: Record<string, unknown>) => {
              const blacklisted = row.status === '黑名单';
              return (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'blacklist',
                      label: blacklisted ? '解禁' : '拉黑',
                      onClick: () =>
                        openBlacklistModal(
                          blacklisted ? 'remove' : 'add',
                          [String(row.id || row.userId || '')],
                          'single'
                        )
                    },
                    {
                      key: 'detail',
                      label: '详情',
                      onClick: () =>
                        setDetailUserId(String(row.id || row.userId || ''))
                    }
                  ]}
                />
              );
            }
          }
        ],
        rowSelection: {
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys)
        },
        pagination: {
          current: page,
          pageSize,
          total,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
            fetchData(p, s);
          }
        }
      }}
    />
    <UserDetailDrawer
      visible={!!detailUserId}
      userId={detailUserId}
      onClose={() => setDetailUserId(null)}
    />
    <BlacklistActionModal
      visible={!!blacklistModal}
      mode={blacklistModal?.mode || 'add'}
      variant={blacklistModal?.variant || 'single'}
      userIds={blacklistModal?.userIds || []}
      onCancel={() => setBlacklistModal(null)}
      onSuccess={() => {
        setSelectedRowKeys([]);
        fetchData(page, pageSize);
      }}
    />
    </>
  );
}
