/**
 * 验证手机号
 */
export const isPhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证邮箱
 */
export const isEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
}

/**
 * 验证密码强度
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
  return Math.min(strength, 4)
}

/**
 * 验证用户名
 */
export const isUsername = (username: string): boolean => {
  return /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/.test(username)
}

/**
 * 验证身份证号
 */
export const isIdCard = (idCard: string): boolean => {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
}

/**
 * 验证 URL
 */
export const isUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证是否为空
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 验证是否为数字
 */
export const isNumber = (value: unknown): boolean => {
  return !isNaN(parseFloat(String(value))) && isFinite(Number(value))
}

/**
 * 验证金额格式
 */
export const isAmount = (amount: string): boolean => {
  return /^\d+(\.\d{1,2})?$/.test(amount)
}

/**
 * 验证订单号格式
 */
export const isOrderNo = (orderNo: string): boolean => {
  return /^\d{17}[A-Z0-9]{8}$/.test(orderNo)
}

/**
 * 表单验证规则生成器
 */
export const createRules = {
  required: (message: string = '此项为必填项') => ({
    required: true,
    message,
    trigger: 'blur' as const
  }),
  
  phone: (message: string = '请输入正确的手机号') => ({
    validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
      if (!value || isPhone(value)) {
        callback()
      } else {
        callback(new Error(message))
      }
    },
    trigger: 'blur' as const
  }),
  
  email: (message: string = '请输入正确的邮箱地址') => ({
    validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
      if (!value || isEmail(value)) {
        callback()
      } else {
        callback(new Error(message))
      }
    },
    trigger: 'blur' as const
  }),
  
  password: (minLength: number = 6, message?: string) => ({
    min: minLength,
    message: message || `密码长度不能少于${minLength}位`,
    trigger: 'blur' as const
  }),
  
  range: (min: number, max: number, message?: string) => ({
    min,
    max,
    message: message || `长度在 ${min} 到 ${max} 个字符`,
    trigger: 'blur' as const
  })
}
