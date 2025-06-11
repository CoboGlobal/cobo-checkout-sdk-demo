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
  expiryTime?: number // Verification code expiration timestamp (milliseconds)
}

// Refund iframe configuration interface
export interface IRefundIframeConfig {
  // iframe parameters
  url: string // iframe URL
  width: string // iframe width
  height: string // iframe height
  style?: object // Custom styles

  // Business parameters
  merchantId: string // Merchant ID
  merchantName: string // Merchant name
  merchantLogo: string // Merchant logo
  merchantOrderCode?: string // Merchant order code

  // Refund information
  refundInfo?: IRefundInfo

  // Callback functions
  onCheckVerificationCode?: (code: string) => Promise<boolean> // Verification code validation callback
  onResendVerificationCode?: () => Promise<void> // Resend verification code callback
  onRefund?: (refundInfo: IRefundInfo) => Promise<void> // Refund callback
  onRefundStatusChange?: (refundInfo: IRefundInfo) => Promise<void> // Refund status change callback
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
    // INIT message payload
    config?: IRefundIframeConfig
    // GET_TOKEN message payload
    accessToken?: string
    // REFUND_INIT message payload
    refundConfig?: IRefundIframeConfig
    // VERIFICATION_CODE_CHECK_RESULT message payload
    isCodeValid?: boolean
    // Other custom parameters...
    [key: string]: any
  }
}

export interface RefundIframeOutboundMessage {
  type: RefundOutboundMessageType
  payload: {
    // TOKEN_EXPIRED message
    errorCode?: 'TOKEN_EXPIRED'
    errorMessage?: string
    // ERROR message payload
    error?: {
      code: string
      message: string
    }
    // CHECK_VERIFICATION_CODE message payload
    verificationCode?: string
    // REFUND_SUBMITTED message payload
    refundInfo?: IRefundInfo
    // Other specific message payloads...
    [key: string]: any
  }
}
