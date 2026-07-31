/**
 * 登录相关文案 — Toast 对齐 Figma 979:39539
 * Toast 只展示前端文案，不透出后端 message
 */
const i18n = {
  'en-US': {
    'login.form.title': 'Welcome back',
    'login.form.subTitle': 'Enter your credentials to access the admin portal.',
    'login.form.userName.errMsg': 'Please enter account',
    'login.form.password.errMsg': 'Please enter password',
    'login.form.userName.placeholder': 'Enter account',
    'login.form.password.placeholder': 'Enter password',
    'login.form.login': 'Sign in',
    'login.form.slider': 'Please complete the slider verification',

    'login.msg.loginSuccess': 'Signed in',
    'login.msg.accountPwdErr': 'Incorrect account or password',
    'login.msg.accountDisabled':
      'This account has been disabled, please contact the administrator',
    'login.msg.accountLocked':
      'Account locked, please contact the administrator',
    'login.msg.loginTooMany':
      'Too many failed login attempts, please try again later',
    'login.msg.network': 'Network error, please try again later',

    'login.msg.qrLoadFail': 'Failed to load QR code, please refresh and retry',
    'login.msg.qrExpired': 'QR code expired, please request a new one',
    'login.msg.setupFail':
      'Security verification initialization failed, please try again later',

    'login.msg.codeEmpty': 'Please enter verification code',
    'login.msg.codeFormat': 'Please enter a 6-digit verification code',
    'login.msg.codeFormatShort': 'Please enter a 6-digit code',
    'login.msg.codeWrong': 'Incorrect code, please re-enter',
    'login.msg.codeExpired': 'Code expired, please re-enter',
    'login.msg.codeUsed': 'Code already used, please enter a new one',
    'login.msg.bindFail': 'Binding failed, please try again later',
    'login.msg.verifyFail': 'Verification failed, please try again later',
    'login.msg.gaNotBound':
      'This account has not completed security setup, please contact the administrator',

    'login.msg.pwdNewEmpty': 'Please enter new password',
    'login.msg.pwdConfirmEmpty': 'Please enter password again',
    'login.msg.pwdMismatch': 'The two passwords do not match',
    'login.msg.pwdLength': 'Password must be 8-20 characters',
    'login.msg.pwdComplexity':
      'Password must include numbers, letters and special characters',
    'login.msg.pwdSameAsInitial':
      'New password cannot be the same as the initial password',
    'login.msg.pwdHasSpace': 'Password cannot contain spaces',
    'login.msg.pwdChangeFail': 'Failed to change password, please try again later',
    'login.msg.pwdHistory': 'New password cannot match a previous password',
    'login.msg.pwdCurrentEmpty': 'Please enter the default password',
    'login.msg.secretCopied': 'Secret copied',
    'login.msg.secretCopyFail': 'Copy failed'
  },
  'zh-CN': {
    'login.form.title': 'Welcome back',
    'login.form.subTitle': 'Enter your credentials to access the admin portal.',
    'login.form.userName.errMsg': '请输入账号',
    'login.form.password.errMsg': '请输入密码',
    'login.form.userName.placeholder': '输入账号',
    'login.form.password.placeholder': '输入密码',
    'login.form.login': '登录',
    'login.form.slider': '请完成滑块验证',

    'login.msg.loginSuccess': '登录成功',
    'login.msg.accountPwdErr': '账号或密码错误',
    'login.msg.accountDisabled': '该账号已被禁用，请联系管理员',
    'login.msg.accountLocked': '账号已锁定，请联系管理员',
    'login.msg.loginTooMany': '登录失败次数过多，请稍后再试',
    'login.msg.network': '网络异常，请稍后重试',

    'login.msg.qrLoadFail': '二维码加载失败，请刷新重试',
    'login.msg.qrExpired': '二维码已失效，请重新获取',
    'login.msg.setupFail': '安全验证初始化失败，请稍后重试',

    'login.msg.codeEmpty': '请输入验证码',
    'login.msg.codeFormat': '请输入6位数字验证码',
    'login.msg.codeFormatShort': '请输入6位验证码',
    'login.msg.codeWrong': '验证码错误，请重新输入',
    'login.msg.codeExpired': '验证码已失效，请重新输入',
    'login.msg.codeUsed': '验证码已使用，请输入新的验证码',
    'login.msg.bindFail': '绑定失败，请稍后重试',
    'login.msg.verifyFail': '验证失败，请稍后重试',
    'login.msg.gaNotBound': '该账号未完成安全验证设置，请联系管理员',

    'login.msg.pwdNewEmpty': '请输入新密码',
    'login.msg.pwdConfirmEmpty': '请再次输入密码',
    'login.msg.pwdMismatch': '两次输入密码不一致',
    'login.msg.pwdLength': '密码长度需为8-20位',
    'login.msg.pwdComplexity': '密码需包含数字、字母及特殊字符',
    'login.msg.pwdSameAsInitial': '新密码不能与初始密码相同',
    'login.msg.pwdHasSpace': '密码不能包含空格',
    'login.msg.pwdChangeFail': '密码修改失败，请稍后重试',
    'login.msg.pwdHistory': '新密码不能与历史密码相同',
    'login.msg.pwdCurrentEmpty': '请输入默认密码',
    'login.msg.secretCopied': '已复制密钥',
    'login.msg.secretCopyFail': '复制失败'
  }
};

export default i18n;
