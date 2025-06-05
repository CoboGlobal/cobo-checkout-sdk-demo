import type {
  IOrder,
  CheckoutIframeInboundMessage,
  CheckoutIframeOutboundMessage,
  ICheckoutInfo,
} from '../types/checkout'
import { CheckoutInboundMessageType, CheckoutOutboundMessageType } from '../types/checkout'
import { getAccessToken } from './authService'

export class CheckoutIframeManager {
  private iframe: HTMLIFrameElement | null = null
  private messageHandler: ((event: MessageEvent) => void) | null = null
  private onOrderCreated: ((order: IOrder) => void) | null = null
  private onOrderStatusChanged: ((order: IOrder) => void) | null = null
  private config: Partial<ICheckoutInfo> = {}
  private iframeLoaded = false
  private messageCount = 0

  constructor() {
    // 创建消息处理函数
    this.messageHandler = this.handleIframeMessage.bind(this)
  }

  /**
   * 初始化Iframe
   */
  public initialize(iframeElement: HTMLIFrameElement, config: Partial<ICheckoutInfo>): void {
    this.iframe = iframeElement
    this.config = config
    this.messageCount = 0
    window.addEventListener('message', this.messageHandler as EventListener)
    this.iframe.onload = () => {
      this.iframeLoaded = true
    }
  }

  /**
   * 清理函数 - 在组件销毁时调用
   */
  public cleanup(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler as EventListener)
      this.messageHandler = null
    }

    this.iframe = null
    this.iframeLoaded = false
    this.messageCount = 0
    console.log('Iframe manager cleaned up')
  }

  /**
   * 主动推送access token到iframe
   */
  public async sendAccessToken(): Promise<void> {
    if (!this.iframe || !this.iframeLoaded) {
      return
    }

    try {
      // 获取有效的访问令牌
      const accessToken = await getAccessToken()

      // 发送INIT消息
      const message: CheckoutIframeOutboundMessage = {
        type: CheckoutOutboundMessageType.GET_TOKEN,
        payload: {
          accessInfo: {
            accessToken: accessToken.access_token,
            refreshToken: accessToken.refresh_token || '',
            tokenType: accessToken.token_type,
            expiresIn: accessToken.expires_in,
          },
        },
      }

      this.iframe.contentWindow?.postMessage(message, '*')
      this.messageCount++
      console.log(
        `Message #${this.messageCount} sent to iframe: Configuration with type=${message.type}`,
      )
    } catch (error) {
      console.error('Failed to send configuration to iframe:', error)
    }
  }

  /**
   * 主动推送结账信息到iframe
   */
  public async sendCheckoutInfo(): Promise<void> {
    if (!this.iframe || !this.iframeLoaded) {
      return
    }
    try {
      // 发送INIT消息
      const message: CheckoutIframeOutboundMessage = {
        type: CheckoutOutboundMessageType.INIT,
        payload: {
          config: this.config as ICheckoutInfo,
        },
      }
      this.iframe.contentWindow?.postMessage(message, '*')
      this.messageCount++
      console.log(
        `Message #${this.messageCount} sent to iframe: Configuration with type=${message.type}`,
      )
    } catch (error) {
      console.error('Failed to send configuration to iframe:', error)
    }
  }
  /**
   * 处理来自iframe的消息
   */
  private handleIframeMessage(event: MessageEvent): void {
    // 确保消息来自正确的源（在测试环境中可能需要放宽这个限制）
    // if (event.origin !== IFRAME_ORIGIN) {
    //   return
    // }

    // 过滤掉React DevTools消息
    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.source === 'react-devtools-content-script'
    ) {
      return
    }

    // 检查消息是否有效
    if (!event.data || typeof event.data !== 'object' || !event.data.type) {
      // 非标准消息，忽略
      return
    }

    const message = event.data as CheckoutIframeInboundMessage

    switch (message.type) {
      case CheckoutInboundMessageType.LOADED:
        this.sendCheckoutInfo()
        this.sendAccessToken()
        break

      case CheckoutInboundMessageType.ORDER_CREATED:
        if (message.payload.order && this.onOrderCreated) {
          console.log('Received ORDER_CREATED message from iframe')
          this.onOrderCreated(message.payload.order)
        }
        break

      case CheckoutInboundMessageType.ORDER_STATUS_CHANGED:
        if (message.payload.order && this.onOrderStatusChanged) {
          console.log('Received ORDER_STATUS_CHANGED message from iframe')
          this.onOrderStatusChanged(message.payload.order)
        }
        break

      case CheckoutInboundMessageType.TOKEN_EXPIRED:
        // 令牌过期，获取新令牌
        console.log('Received TOKEN_EXPIRED message from iframe')
        this.sendAccessToken()
        break

      case CheckoutInboundMessageType.ERROR:
        console.error('Error from iframe:', message.payload.error)
        break

      case CheckoutInboundMessageType.GOTO_URL:
        console.log('Received GOTO_URL message from iframe')
        window.location.href = message.payload.url || ''
        break

      default:
        console.warn('Unknown message type from iframe:', message.type)
    }
  }
}

// 导出单例实例
export const checkoutIframeManager = new CheckoutIframeManager()

export default checkoutIframeManager
