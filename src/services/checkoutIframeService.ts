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
    // Create message handling function
    this.messageHandler = this.handleIframeMessage.bind(this)
  }

  /**
   * Initialize Iframe
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
   * Cleanup function - called when component is destroyed
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
   * Actively push access token to iframe
   */
  public async sendAccessToken(): Promise<void> {
    if (!this.iframe || !this.iframeLoaded) {
      return
    }

    try {
      // Get valid access token
      const accessToken = await getAccessToken()

      // Send INIT message
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
   * Actively push checkout info to iframe
   */
  public async sendCheckoutInfo(): Promise<void> {
    if (!this.iframe || !this.iframeLoaded) {
      return
    }
    try {
      // Send INIT message
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
   * Handle messages from iframe
   */
  private handleIframeMessage(event: MessageEvent): void {
    // Ensure message comes from correct source (may need to relax this restriction in test environment)
    // if (event.origin !== IFRAME_ORIGIN) {
    //   return
    // }

    // Filter out React DevTools messages
    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.source === 'react-devtools-content-script'
    ) {
      return
    }

    // Check if message is valid
    if (!event.data || typeof event.data !== 'object' || !event.data.type) {
      // Non-standard message, ignore
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
        // Token expired, get new token
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

// Export singleton instance
export const checkoutIframeManager = new CheckoutIframeManager()

export default checkoutIframeManager
