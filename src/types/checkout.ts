import type { ITransaction } from './refund'

export enum OrderStatus {
  Pending = 'Pending', // 待支付
  Processing = 'Processing', // 支付中
  Completed = 'Completed', // 支付完成
  Expired = 'Expired', // 订单过期
  Underpaid = 'Underpaid', // 未支付足额
}

// 订单信息接口
export interface IOrder {
  orderId: string // Cobo订单ID
  merchantId: string // 商户ID
  tokenId: string // 代币ID
  chainId: string // 链ID
  orderAmount: string // 订单金额
  receiveAddress: string // 接收地址
  currency: string // 法币币种
  payableAmount: string // 应付金额
  feeAmount: string // 手续费
  exchangeRate: string // 法币汇率
  expiredAt: number // 订单过期时间
  merchantOrderCode: string // 商户订单号
  pspOrderCode: string // 服务商订单号
  status: OrderStatus // 订单状态
  receivedTokenAmount: string // 接收到的代币数量
  transactions: ITransaction[]
}

export interface ICheckoutInfo {
  locale: 'zh' | 'en' // 语言
  fiatCurrency: string // 法币币种
  fiatAmount: string // 法币金额
  feeAmount: string // 手续费
  merchantOrderCode: string // 商户订单号
  pspOrderCode: string // 服务商订单号
  expiredIn?: number // 订单过期时间（可选）
  merchantId: string // 商户ID
  merchantName: string // 商户名称
  merchantLogo: string // 商户Logo
  merchantUrl: string // 商户URL
  supportToken?: string[]; // 支持的币种(可选)
  supportChain?: string[]; // 支持的链(可选)
}

export interface IAccessInfo {
  accessToken: String
  refreshToken: string
  tokenType: string
  expiresIn: number
}

// 业务方前端发送给iframe的消息类型
export enum CheckoutOutboundMessageType {
  INIT = 'INIT',
  GET_TOKEN = 'GET_TOKEN',
  CUSTOM_ACTION = 'CUSTOM_ACTION',
}

// iframe发送给业务方前端的消息类型
export enum CheckoutInboundMessageType {
  LOADED = 'LOADED',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ERROR = 'ERROR',
  GOTO_URL = 'GOTO_URL',
}

// 业务方前端发送给iframe的消息
export interface CheckoutIframeOutboundMessage {
  type: CheckoutOutboundMessageType
  payload: {
    config?: ICheckoutInfo
    accessInfo?: IAccessInfo
  }
}

// iframe发送给业务方前端的消息
export interface CheckoutIframeInboundMessage {
  type: CheckoutInboundMessageType
  payload: {
    order?: IOrder
    error?: {
      code: string
      message: string
    }
    ready?: boolean
    url?: string
  }
}
