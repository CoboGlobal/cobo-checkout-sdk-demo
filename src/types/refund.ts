export enum RefundStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  PartiallyCompleted = 'PartiallyCompleted',
  Failed = 'Failed',
}

export enum RefundTransactionStatus {
  Submitted = 'Submitted',
  PendingScreening = 'PendingScreening',
  PendingAuthorization = 'PendingAuthorization',
  PendingSignature = 'PendingSignature',
  Broadcasting = 'Broadcasting',
  Confirming = 'Confirming',
  Completed = 'Completed',
  Failed = 'Failed',
  Rejected = 'Rejected',
  Pending = 'Pending',
}

export interface ITransaction {
  txId: string
  txHash: string
  fromAddress: string
  toAddress: string
  amount: string
  status: RefundTransactionStatus
  createdTimestamp: number
  updatedTimestamp: number
}
export interface IRefundDetail {
  requestId: string
  refundId: string
  merchantId: string
  tokenId: string
  chainId: string
  amount: string
  toAddress: string
  status: RefundStatus
  transactions: ITransaction[]
  fee: string
}

export interface IRefundInfo {
  refundId: string
  orderId: string
  token: string
  network: string
  refundAmount: string
  fee: string
  userEmail: string
  walletAddress?: string
  status: RefundStatus
  txHash?: string
  fiatCurrency: string
  fiatAmount: string
  expiryTime?: number // 验证码过期时间戳（毫秒）
}

// 退款iframe配置接口
export interface IRefundIframeConfig {
  // iframe参数
  url: string // iframe URL
  width: string // iframe宽度
  height: string // iframe高度
  style?: object // 自定义样式

  // 业务参数
  merchantId: string // 商户ID
  merchantName: string // 商户名称
  merchantLogo: string // 商户Logo
  merchantOrderCode?: string // 商户订单号

  // 退款信息
  refundInfo?: IRefundInfo

  // 回调函数
  onCheckVerificationCode?: (code: string) => Promise<boolean> // 验证码校验回调
  onResendVerificationCode?: () => Promise<void> // 重发验证码回调
  onRefund?: (refundInfo: IRefundInfo) => Promise<void> // 退款回调
  onRefundStatusChange?: (refundInfo: IRefundInfo) => Promise<void> // 退款状态变更回调
}
export enum RefundInboundMessageType {
  INIT = 'INIT',
  GET_TOKEN = 'GET_TOKEN',
  CUSTOM_ACTION = 'CUSTOM_ACTION',
  REFUND_INIT = 'REFUND_INIT',
  VERIFICATION_CODE_CHECK_RESULT = 'VERIFICATION_CODE_CHECK_RESULT',
  VERIFICATION_CODE_RESENT = 'VERIFICATION_CODE_RESENT',
  REFUND_STATUS_UPDATE = 'REFUND_STATUS_UPDATE',
}

export enum RefundOutboundMessageType {
  LOADED = 'LOADED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ERROR = 'ERROR',
  CHECK_VERIFICATION_CODE = 'CHECK_VERIFICATION_CODE',
  RESEND_VERIFICATION_CODE = 'RESEND_VERIFICATION_CODE',
  REFUND_SUBMITTED = 'REFUND_SUBMITTED',
  REFUND_STATUS_CHANGE = 'REFUND_STATUS_CHANGE',
}

export interface RefundIframeInboundMessage {
  type: RefundInboundMessageType
  payload: {
    // INIT消息的payload
    config?: IRefundIframeConfig
    // GET_TOKEN消息的payload
    accessToken?: string
    // REFUND_INIT消息的payload
    refundConfig?: IRefundIframeConfig
    // VERIFICATION_CODE_CHECK_RESULT消息的payload
    isCodeValid?: boolean
    // 其他自定义参数...
    [key: string]: any
  }
}

export interface RefundIframeOutboundMessage {
  type: RefundOutboundMessageType
  payload: {
    // TOKEN_EXPIRED消息
    errorCode?: 'TOKEN_EXPIRED'
    errorMessage?: string
    // ERROR消息的payload
    error?: {
      code: string
      message: string
    }
    // CHECK_VERIFICATION_CODE消息的payload
    verificationCode?: string
    // REFUND_SUBMITTED消息的payload
    refundInfo?: IRefundInfo
    // 其他特定消息的payload...
    [key: string]: any
  }
}
