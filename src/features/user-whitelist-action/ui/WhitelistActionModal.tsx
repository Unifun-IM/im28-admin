import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Radio,
  Result,
  Select,
  Spin
} from '@arco-design/web-react';
import {
  IconCheckCircleFill,
  IconClose,
  IconCopy,
  IconSearch
} from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import cs from 'classnames';
import {
  postV1AdminUsersSearch,
  postV1AdminUsersWhitelistAdd,
  postV1AdminUsersWhitelistBatchRemove,
  postV1AdminUsersWhitelistCreate,
  postV1AdminUsersWhitelistRemove
} from '@shared/api/admin/users';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import { GaVerifyModal } from '@features/ga-verify';
import { UserAvatar } from '@shared/ui';
import useLocale from '@shared/lib/useLocale';
import './whitelist-action-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

type SearchType = AdminAPI.AdminSearchUserRequest['type'];
type TargetType = 'registered' | 'unregistered';

export type WhitelistActionModalProps = {
  visible: boolean;
  /** add = 添加白名单；remove = 移除白名单 */
  mode: 'add' | 'remove';
  variant?: 'single' | 'batch';
  /** 已选用户；add 且为空时走搜索选人 */
  userIds?: string[];
  onCancel: () => void;
  onSuccess?: () => void;
};

type FormValues = {
  reason?: string;
  reason_description?: string;
};

type PendingPayload = FormValues & {
  ids: string[];
  targetType: TargetType;
};

type Step = 'form' | 'ga' | 'success';

type SelectedUser = {
  user_id: string;
  nickname?: string;
  avatar_url?: string;
  account?: string;
};

type CreatedCredential = {
  user_id: string;
  account: string;
  password: string;
};

const SEARCH_TYPES: SearchType[] = [
  'user_id',
  'nickname',
  'phone',
  'email',
  'account'
];

/**
 * 白名单操作 — Figma 805:20062 / 966:19453 / 966:19304 / 966:19968 / 966:20131
 * 添加：选对象 →（已注册）模糊搜索选人 → 原因 → GaVerifyModal →（未注册 create）成功页
 * 移除：原因 → GaVerifyModal
 */
export default function WhitelistActionModal({
  visible,
  mode,
  variant = 'single',
  userIds = [],
  onCancel,
  onSuccess
}: WhitelistActionModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<FormValues>();
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [gaErrorTick, setGaErrorTick] = useState(0);
  const [pending, setPending] = useState<PendingPayload | null>(null);

  const [targetType, setTargetType] = useState<TargetType>('registered');
  const [searchType, setSearchType] = useState<SearchType>('user_id');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<AdminAPI.User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [created, setCreated] = useState<CreatedCredential | null>(null);
  const searchSeq = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdd = mode === 'add';
  const ids = userIds.filter(Boolean);
  const isBatch = !isAdd && (variant === 'batch' || ids.length > 1);
  const count = ids.length || 1;
  const needSearch = isAdd && ids.length === 0;

  const searchTypeOptions = useMemo(
    () =>
      SEARCH_TYPES.map((value) => ({
        label: t[`whitelist.keywordType.${value}`],
        value
      })),
    [t]
  );

  const searchPlaceholder = useMemo(() => {
    const map: Record<SearchType, string> = {
      user_id: t['whitelistAction.placeholder.searchId'],
      nickname: t['whitelistAction.placeholder.searchNickname'],
      phone: t['whitelistAction.placeholder.searchPhone'],
      email: t['whitelistAction.placeholder.searchEmail'],
      account: t['whitelistAction.placeholder.searchAccount']
    };
    return map[searchType];
  }, [searchType, t]);

  const resetAddState = useCallback(() => {
    setTargetType('registered');
    setSearchType('user_id');
    setSearchKeyword('');
    setSearchResults([]);
    setDropdownOpen(false);
    setSelectedUser(null);
    setCreated(null);
  }, []);

  useEffect(() => {
    if (!visible) return;
    setStep('form');
    setPending(null);
    setGaErrorTick(0);
    form.resetFields();
    resetAddState();
    if (isAdd && ids.length === 1) {
      const uid = ids[0];
      setSelectedUser({ user_id: uid });
      postV1AdminUsersSearch({ type: 'user_id', keyword: uid })
        .then((res) => {
          const hit = res.data?.list?.[0];
          if (hit?.user_id) {
            setSelectedUser({
              user_id: hit.user_id,
              nickname: hit.nickname,
              avatar_url: hit.avatar_url,
              account: hit.account
            });
          }
        })
        .catch(() => {
          // keep id-only card
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, mode, variant, form, resetAddState]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = useCallback(
    async (type: SearchType, keyword: string) => {
      const kw = keyword.trim();
      if (!kw) {
        setSearchResults([]);
        setDropdownOpen(false);
        return;
      }
      const seq = ++searchSeq.current;
      setSearchLoading(true);
      try {
        const res = await postV1AdminUsersSearch({ type, keyword: kw });
        if (seq !== searchSeq.current) return;
        setSearchResults(res.data?.list || []);
        setDropdownOpen(true);
      } catch {
        if (seq !== searchSeq.current) return;
        setSearchResults([]);
        setDropdownOpen(false);
      } finally {
        if (seq === searchSeq.current) setSearchLoading(false);
      }
    },
    []
  );

  const scheduleSearch = (type: SearchType, keyword: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(type, keyword);
    }, 300);
  };

  const handleSelectUser = (user: AdminAPI.User) => {
    const userId = user.user_id?.trim();
    if (!userId) return;
    setSelectedUser({
      user_id: userId,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      account: user.account
    });
    setSearchKeyword('');
    setSearchResults([]);
    setDropdownOpen(false);
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
  };

  const handleTargetChange = (value: TargetType) => {
    setTargetType(value);
    setSearchKeyword('');
    setSearchResults([]);
    setDropdownOpen(false);
    if (needSearch) setSelectedUser(null);
  };

  const goGa = async () => {
    try {
      const values = await form.validate();
      if (isAdd) {
        if (targetType === 'unregistered') {
          setPending({
            ...values,
            ids: [],
            targetType: 'unregistered'
          });
          setGaErrorTick(0);
          setStep('ga');
          return;
        }
        const userId = (selectedUser?.user_id || ids[0] || '').trim();
        if (!userId) {
          Message.error(t['whitelistAction.msg.selectUserRequired']);
          return;
        }
        setPending({
          ...values,
          ids: [userId],
          targetType: 'registered'
        });
      } else {
        const removeIds = ids.slice(0, 100);
        if (!removeIds.length) return;
        setPending({ ...values, ids: removeIds, targetType: 'registered' });
      }
      setGaErrorTick(0);
      setStep('ga');
    } catch {
      // validate
    }
  };

  const submitGa = async (code: string) => {
    if (submitting || !pending) return;
    try {
      setSubmitting(true);
      const reason = String(pending.reason || '').trim();
      const reasonDescription =
        String(pending.reason_description || '').trim() || undefined;

      if (isAdd && pending.targetType === 'unregistered') {
        const res = await postV1AdminUsersWhitelistCreate({
          reason,
          two_factor_code: code
        });
        setCreated({
          user_id: res.data?.user_id || '',
          account: res.data?.account || '',
          password: res.data?.temporary_password || ''
        });
        setStep('success');
        return;
      }
      if (isAdd) {
        const userId = (pending.ids[0] || '').trim();
        await postV1AdminUsersWhitelistAdd({
          user_id: userId,
          reason,
          two_factor_code: code
        });
        Message.success(t['whitelistAction.msg.addSuccess']);
        onSuccess?.();
        onCancel();
      } else if (isBatch) {
        await postV1AdminUsersWhitelistBatchRemove({
          user_ids: pending.ids,
          reason,
          reason_description: reasonDescription,
          two_factor_code: code
        });
        Message.success(t['whitelistAction.msg.removeSuccess']);
        onSuccess?.();
        onCancel();
      } else {
        await postV1AdminUsersWhitelistRemove({
          user_id: pending.ids[0],
          reason,
          reason_description: reasonDescription,
          two_factor_code: code
        });
        Message.success(t['whitelistAction.msg.removeSuccess']);
        onSuccess?.();
        onCancel();
      }
    } catch {
      setGaErrorTick((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = (text: string) => {
    copy(text);
    Message.success(common['common.copied']);
  };

  const copyAccountAndPassword = () => {
    if (!created) return;
    copyText(
      `${t['whitelistAction.success.userId']}：${created.user_id}\n${t['whitelistAction.success.account']}：${created.account}\n${t['whitelistAction.success.password']}：${created.password}`
    );
  };

  const finishSuccess = () => {
    onSuccess?.();
    onCancel();
  };

  const confirmLabel = isAdd
    ? targetType === 'unregistered'
      ? t['whitelistAction.action.createAndAdd']
      : t['whitelistAction.action.confirmAdd']
    : common['common.confirm'];

  const renderSearchField = () => (
    <div className="use-whitelist-search-block">
      <FormItem
        label={t['whitelistAction.field.searchUser']}
        required
        className="use-whitelist-search-item"
      >
        <div className="use-whitelist-search-wrap relative">
          <Input
            value={searchKeyword}
            allowClear
            placeholder={searchPlaceholder}
            addBefore={
              <Select
                value={searchType}
                options={searchTypeOptions}
                style={{ width: 100 }}
                onChange={(v) => {
                  const next = v as SearchType;
                  setSearchType(next);
                  setSearchResults([]);
                  setDropdownOpen(false);
                  if (searchKeyword.trim()) scheduleSearch(next, searchKeyword);
                }}
              />
            }
            suffix={
              searchLoading ? (
                <Spin size={14} />
              ) : (
                <IconSearch
                  className="cursor-pointer text-arco-text-3"
                  onClick={() => runSearch(searchType, searchKeyword)}
                />
              )
            }
            onChange={(v) => {
              setSearchKeyword(v);
              if (selectedUser) setSelectedUser(null);
              scheduleSearch(searchType, v);
            }}
            onFocus={() => {
              if (searchResults.length) setDropdownOpen(true);
            }}
            onBlur={() => {
              // 延迟关闭，便于点击下拉项
              setTimeout(() => setDropdownOpen(false), 180);
            }}
            onPressEnter={() => runSearch(searchType, searchKeyword)}
          />
          {dropdownOpen ? (
            <div className="use-whitelist-search-dropdown">
              {searchResults.length ? (
                searchResults.map((user) => {
                  const uid = user.user_id || '';
                  return (
                    <button
                      key={uid}
                      type="button"
                      className="use-whitelist-search-option"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectUser(user)}
                    >
                      <UserAvatar
                        size={24}
                        userId={uid}
                        name={user.nickname}
                        src={user.avatar_url}
                      />
                      <div className="min-w-0 flex flex-col gap-1">
                        <span className="truncate text-[12px] leading-none text-arco-text-1">
                          {user.nickname || user.account || uid || '—'}
                        </span>
                        <span className="truncate text-[10px] leading-none text-arco-text-3">
                          {t['whitelistAction.search.idPrefix']}
                          {uid}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-[12px] text-arco-text-3">
                  {t['whitelistAction.search.empty']}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </FormItem>
      {selectedUser ? (
        <div className="use-whitelist-selected-user">
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar
              size={24}
              userId={selectedUser.user_id}
              name={selectedUser.nickname}
              src={selectedUser.avatar_url}
            />
            <div className="min-w-0 flex flex-col gap-1">
              <span className="truncate text-[12px] leading-none text-arco-text-1">
                {selectedUser.nickname ||
                  selectedUser.account ||
                  selectedUser.user_id}
              </span>
              <span className="truncate text-[10px] leading-none text-arco-text-3">
                {t['whitelistAction.search.idPrefix']}
                {selectedUser.user_id}
              </span>
            </div>
          </div>
          {needSearch ? (
            <button
              type="button"
              className="inline-flex size-[14px] shrink-0 items-center justify-center border-0 bg-transparent p-0 text-arco-text-3"
              onClick={clearSelectedUser}
              aria-label="clear"
            >
              <IconClose />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const renderAddForm = () => (
    <>
      <p className="m-0 text-[14px] leading-[21px] text-arco-text-1">
        {t['whitelistAction.desc.add']}
      </p>

      <Form
        form={form}
        layout="vertical"
        requiredSymbol={{ position: 'end' }}
        className="use-whitelist-action-form mt-3 flex flex-col gap-3"
      >
        <FormItem label={t['whitelistAction.field.target']}>
          <Radio.Group
            value={targetType}
            className="use-whitelist-target-radio"
            onChange={(v) => handleTargetChange(v as TargetType)}
          >
            <Radio value="registered">
              {t['whitelistAction.target.registered']}
            </Radio>
            <Radio value="unregistered">
              {t['whitelistAction.target.unregistered']}
            </Radio>
          </Radio.Group>
          {targetType === 'unregistered' ? (
            <div className="use-whitelist-unreg-tip">
              {t['whitelistAction.tip.unregistered']}
            </div>
          ) : null}
        </FormItem>

        {targetType === 'registered' ? renderSearchField() : null}

        <FormItem
          field="reason"
          label={t['whitelistAction.field.reason']}
          rules={[
            {
              required: true,
              message: t['whitelistAction.msg.reasonRequired']
            }
          ]}
        >
          <TextArea
            placeholder={t['whitelistAction.placeholder.reason']}
            autoSize={{ minRows: 2, maxRows: 4 }}
            maxLength={500}
          />
        </FormItem>
      </Form>
    </>
  );

  const renderRemoveForm = () => (
    <>
      <p className="m-0 text-[14px] leading-[21px] text-arco-text-1">
        {isBatch
          ? t['whitelistAction.hint.removeBatch'].replace(
              '{count}',
              String(count)
            )
          : t['whitelistAction.hint.removeSingle'].replace(
              '{id}',
              ids[0] || ''
            )}
      </p>
      <Form
        form={form}
        layout="vertical"
        requiredSymbol={{ position: 'end' }}
        className="use-whitelist-action-form mt-3 flex flex-col gap-3"
      >
        <FormItem
          field="reason"
          label={t['whitelistAction.field.removeReason']}
          rules={[
            {
              required: true,
              message: t['whitelistAction.msg.reasonRequired']
            }
          ]}
        >
          <TextArea
            placeholder={t['whitelistAction.placeholder.removeReason']}
            autoSize={{ minRows: 2, maxRows: 4 }}
            maxLength={500}
          />
        </FormItem>
        <FormItem
          field="reason_description"
          label={t['whitelistAction.field.reasonDescription']}
        >
          <TextArea
            placeholder={t['whitelistAction.placeholder.reasonDescription']}
            autoSize={{ minRows: 2, maxRows: 4 }}
            maxLength={500}
          />
        </FormItem>
      </Form>
    </>
  );

  const renderSuccess = () => (
    <div className="use-whitelist-action-success px-20 py-6">
      <Result
        status="success"
        icon={
          <IconCheckCircleFill className="text-[48px] text-[rgb(var(--success-6))]" />
        }
        title={t['whitelistAction.success.title']}
        subTitle={
          <span className="inline-block max-w-[420px] text-center">
            {t['whitelistAction.success.subTitle']}
          </span>
        }
      />
      <div className="use-whitelist-credential mx-auto mt-4 w-full max-w-[520px] rounded-lg border border-solid border-[var(--color-border-2,rgba(0,0,0,0.08))] p-3 text-[12px] leading-[1.5] text-arco-text-1">
        <div className="flex items-center gap-6">
          <span className="w-[120px] shrink-0">
            {t['whitelistAction.success.userId']}
          </span>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <span className="truncate">{created?.user_id}</span>
            <button
              type="button"
              className="inline-flex size-[14px] shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
              onClick={() => created?.user_id && copyText(created.user_id)}
            >
              <IconCopy />
            </button>
          </div>
        </div>
        <div className="my-[6px] h-px w-full bg-[var(--color-border-2,rgba(0,0,0,0.08))]" />
        <div className="flex items-center gap-6">
          <span className="w-[120px] shrink-0">
            {t['whitelistAction.success.account']}
          </span>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <span className="truncate">{created?.account}</span>
            <button
              type="button"
              className="inline-flex size-[14px] shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
              onClick={() => created?.account && copyText(created.account)}
            >
              <IconCopy />
            </button>
          </div>
        </div>
        <div className="my-[6px] h-px w-full bg-[var(--color-border-2,rgba(0,0,0,0.08))]" />
        <div className="flex items-center gap-6">
          <span className="w-[120px] shrink-0">
            {t['whitelistAction.success.password']}
          </span>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <span className="truncate">{created?.password}</span>
            <button
              type="button"
              className="inline-flex size-[14px] shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
              onClick={() => created?.password && copyText(created.password)}
            >
              <IconCopy />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <Button type="secondary" onClick={copyAccountAndPassword}>
          {t['whitelistAction.success.copyBoth']}
        </Button>
        <Button
          type="primary"
          className="!min-w-[100px]"
          onClick={finishSuccess}
        >
          {common['common.done']}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        visible={visible && (step === 'form' || step === 'success')}
        onCancel={step === 'success' ? finishSuccess : onCancel}
        unmountOnExit
        closable={false}
        maskClosable={false}
        className={cs('use-whitelist-action-modal', {
          'is-success': step === 'success'
        })}
        wrapClassName="use-whitelist-action-modal-wrap"
        style={{ width: 780 }}
        title={null}
        footer={null}
      >
        {step === 'success' ? (
          renderSuccess()
        ) : (
          <>
            <div className="use-whitelist-action-header">
              {!isAdd ? (
                <img alt="" src={iconWarning} className="size-5 shrink-0" />
              ) : null}
              <span className="text-[16px] font-medium leading-6 text-arco-text-1">
                {isAdd
                  ? t['whitelistAction.title.add']
                  : isBatch
                    ? t['whitelistAction.title.removeBatch'].replace(
                        '{count}',
                        String(count)
                      )
                    : t['whitelistAction.title.removeSingle']}
              </span>
            </div>

            <div className="use-whitelist-action-body">
              {isAdd ? renderAddForm() : renderRemoveForm()}
            </div>

            <div className="use-whitelist-action-footer">
              <Button
                type="outline"
                className="!min-w-[80px]"
                onClick={onCancel}
              >
                {common['common.cancel']}
              </Button>
              <Button
                type="primary"
                status={isAdd ? undefined : 'danger'}
                className="!min-w-[80px]"
                onClick={goGa}
              >
                {confirmLabel}
              </Button>
            </div>
          </>
        )}
      </Modal>

      <GaVerifyModal
        visible={visible && step === 'ga'}
        loading={submitting}
        errorTick={gaErrorTick}
        onCancel={onCancel}
        onOk={submitGa}
      />
    </>
  );
}
