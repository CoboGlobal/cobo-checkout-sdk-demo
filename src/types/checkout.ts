import type { ITransaction } from './refund'

export enum OrderStatus {
  Pending = 'Pending', // Awaiting payment
  Processing = 'Processing', // Processing payment
  Completed = 'Completed', // Payment completed
  Expired = 'Expired', // Order expired
  Underpaid = 'Underpaid', // Insufficient payment
}

// Order information interface
export interface IOrder {
  orderId: string // Cobo order ID
  merchantId: string // Merchant ID
  tokenId: string // Token ID
  chainId: string // Chain ID
  orderAmount: string // Order amount
  receiveAddress: string // Receive address
  currency: string // Fiat currency
  payableAmount: string // Payable amount
  feeAmount: string // Fee amount
  exchangeRate: string // Fiat exchange rate
  expiredAt: number // Order expiration time
  merchantOrderCode: string // Merchant order code
  pspOrderCode: string // Service provider order code
  status: OrderStatus // Order status
  receivedTokenAmount: string // Received token amount
  transactions: ITransaction[]
}

export interface ICheckoutInfo {
  locale: 'zh' | 'en' // Language
  fiatCurrency: string // Fiat currency
  fiatAmount: string // Fiat amount
  feeAmount: string // Fee amount
  merchantOrderCode: string // Merchant order code
  pspOrderCode: string // Service provider order code
  expiredIn?: number // Order expiration time (optional)
  merchantId: string // Merchant ID
  merchantName: string // Merchant name
  merchantLogo: string // Merchant logo
  merchantUrl: string // Merchant URL
  supportToken?: string[]; // Supported tokens (optional)
  supportChain?: string[]; // Supported chains (optional)
}

export interface IAccessInfo {
  accessToken: String
  refreshToken: string
  tokenType: string
  expiresIn: number
}

// Message types sent from business frontend to iframe
export enum CheckoutOutboundMessageType {
  INIT = 'INIT',
  GET_TOKEN = 'GET_TOKEN',
  CUSTOM_ACTION = 'CUSTOM_ACTION',
}

// Message types sent from iframe to business frontend
export enum CheckoutInboundMessageType {
  LOADED = 'LOADED',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ERROR = 'ERROR',
  GOTO_URL = 'GOTO_URL',
}

// Messages sent from business frontend to iframe
export interface CheckoutIframeOutboundMessage {
  type: CheckoutOutboundMessageType
  payload: {
    config?: ICheckoutInfo
    accessInfo?: IAccessInfo
  }
}

// Messages sent from iframe to business frontend
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
