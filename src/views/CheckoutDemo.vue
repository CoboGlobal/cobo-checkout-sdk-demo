<template>
  <div>
    <div class="checkout-demo" v-if="!showIframe">
      <div class="settings">
        <h2>Transaction Settings</h2>
        <div class="form-row">
          <label for="amount">Amount:</label>
          <input id="amount" v-model="amount" type="number" min="1" step="0.01" />
        </div>
        <div class="form-row">
          <label for="paymentType">Payment Type:</label>
          <select id="paymentType" v-model="paymentType">
            <option value="fiat">Fiat</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>
        <div class="form-row">
          <label for="locale">Language:</label>
          <select id="locale" v-model="locale">
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="form-row">
          <label for="merchantOrderCode">Order Number:</label>
          <input id="merchantOrderCode" v-model="merchantOrderCode" type="text" />
        </div>
        <div class="form-row">
          <label for="merchantOrderCode">Order Number:</label>
          <input id="pspOrderCode" v-model="pspOrderCode" type="text" />
        </div>
        <div class="form-row">
          <button @click="refreshOrderCode">Generate New Merchant Order Code</button>
          <button @click="refreshPSPOrderCode">Get New PSP Order Code</button>
          <button @click="initializeCheckout">Start Checkout</button>
        </div>
      </div>

      <div v-if="currentOrder" class="order-info">
        <h2>Current Order Information</h2>
        <div class="info-item">
          <span class="label">Order ID:</span>
          <span class="value">{{ currentOrder.orderId }}</span>
        </div>
        <div class="info-item">
          <span class="label">Status:</span>
          <span class="value" :class="getStatusClass(currentOrder.status)">
            {{ getStatusText(currentOrder.status) }}
          </span>
        </div>
        <div class="info-item">
          <span class="label">Fiat Amount:</span>
          <span class="value">{{ currentOrder.orderAmount }} {{ currentOrder.currency }}</span>
        </div>
        <div class="info-item">
          <span class="label">Crypto Currency:</span>
          <span class="value">{{ currentOrder.payableAmount }} {{ currentOrder.tokenId }}</span>
        </div>
        <div class="info-item">
          <span class="label">Chain:</span>
          <span class="value">{{ currentOrder.chainId }}</span>
        </div>
        <div class="info-item">
          <span class="label">Receive Address:</span>
          <span class="value address">{{ currentOrder.receiveAddress }}</span>
        </div>
        <div class="info-item">
          <span class="label">Expiration Time:</span>
          <span class="value">{{ formatExpireTime(currentOrder.expiredAt) }}</span>
        </div>
      </div>

      <div class="event-log">
        <h2>Event Log</h2>
        <div class="log-controls">
          <button @click="clearEventLog">Clear Log</button>
        </div>
        <div class="log-entries">
          <div v-for="(event, index) in eventLog" :key="index" class="log-entry">
            <span class="time">{{ formatTime(event.timestamp) }}</span>
            <span class="type" :class="event.type.toLowerCase()">{{ event.type }}</span>
            <pre class="data">{{ formatEventData(event.data) }}</pre>
          </div>
        </div>
      </div>
    </div>
    <div class="iframe-container" v-if="showIframe">
      <iframe
        ref="checkoutIframe"
        :src="iframeUrl"
        width="100%"
        height="100%"
        frameborder="0"
        allow="clipboard-write"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { IOrder } from '@/types'
import { OrderStatus } from '../types'
import { checkoutIframeManager } from '../services/checkoutIframeService'

// Test environment
const iframeUrl = 'https://payout-checkout.dev.cobo.com';
// Production environment
// const iframeUrl = 'https://payout-checkout.cobo.com';

// Basic configuration
const amount = ref('0.1')
const merchantId = 'M1002'
const merchantName = 'Demo Store'
const merchantLogo = 'https://placeholder.com/logo.png'
const merchantUrl = 'https://example.com'
const merchantOrderCode = ref(`order-${Date.now()}`)
const pspOrderCode = ref(`psp-${Date.now()}`)
const locale = ref<'zh' | 'en'>('en')
const paymentType = ref<'fiat' | 'crypto'>('fiat')
// UI state
const showIframe = ref(false)
const checkoutIframe = ref<HTMLIFrameElement | null>(null)
const currentOrder = ref<IOrder | null>(null)
const eventLog = ref<Array<{ type: string; timestamp: Date; data: any }>>([])

// Refresh order code
const refreshOrderCode = () => {
  merchantOrderCode.value = `order-${Date.now()}`
  addEventLog('INFO', 'New order code generated')
}

// Refresh PSP order code
const refreshPSPOrderCode = () => {
  pspOrderCode.value = `psp-${Date.now()}`
  addEventLog('INFO', 'New PSP order code generated')
}

// Initialize checkout
const initializeCheckout = async () => {
  showIframe.value = true
  currentOrder.value = null
  // Wait for DOM update before initializing iframe
  await nextTick()
  if (checkoutIframe.value) {
    // For detailed parameter explanation, please refer to API documentation: https://www.cobo.com/developers/v2/api-references/payment/create-pay-in-order
    checkoutIframeManager.initialize(checkoutIframe.value, {
      // Required fields
      merchantId,
      merchantName,
      merchantLogo,
      merchantUrl,
      feeAmount: '0.01', // Developer fee, determined by PSP
      merchantOrderCode: merchantOrderCode.value,
      pspOrderCode: pspOrderCode.value, // Service provider order code, determined by PSP
      locale: locale.value,
      // If amount is fiat, the following fields are required, feeAmount is also calculated in fiat
      fiatCurrency: paymentType.value === 'fiat' ? 'USD' : undefined,
      fiatAmount: paymentType.value === 'fiat' ? amount.value : undefined,
      // If amount is crypto, the following fields are required, feeAmount is also calculated in crypto
      cryptoAmount: paymentType.value === 'crypto' ? amount.value : undefined,
      // Optional fields
      expiredIn: 30 * 60, // Order expiration time, determined by PSP, minimum 30 minutes, maximum 3 hours (unit: seconds)
      developerName: 'xxx', // Powered by xxx, only supports letters and @, length cannot exceed 20 characters, will be hidden if not passed or invalid
      supportToken: ['USDT', 'USDC'],
      supportChain: ['ARBITRUM_ETH', 'BASE_ETH', 'BSC_BNB', 'ETH', 'MATIC', 'SOL', 'TRON'],
    })
    addEventLog('INFO', 'Checkout initialized')
  }
}

// Add event log
const addEventLog = (type: string, data: any) => {
  eventLog.value.unshift({
    type,
    timestamp: new Date(),
    data,
  })
}

// Clear event log
const clearEventLog = () => {
  eventLog.value = []
}

// Format event data
const formatEventData = (data: any) => {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2)
  }
  return data
}

// Format time
const formatTime = (date: Date) => {
  return date.toLocaleTimeString()
}

// Format expiration time
const formatExpireTime = (timestamp: number) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// Get status text
const getStatusText = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    [OrderStatus.Pending]: 'Pending Payment',
    [OrderStatus.Processing]: 'Processing',
    [OrderStatus.Completed]: 'Completed',
    [OrderStatus.Expired]: 'Expired',
    [OrderStatus.Underpaid]: 'Underpaid',
  }
  return statusMap[status] || status
}

// Get status CSS class
const getStatusClass = (status: OrderStatus) => {
  return status.toLowerCase()
}

// Component mounted
onMounted(() => {
  addEventLog('INFO', 'Component loaded')
})

// Cleanup before component unmount
onBeforeUnmount(() => {
  checkoutIframeManager.cleanup()
  addEventLog('INFO', 'Component unmounted')
})
</script>

<style scoped>
.checkout-demo {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
  font-family: Arial, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.settings {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.form-row label {
  width: 100px;
  font-weight: bold;
}

.form-row input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-row button {
  margin-right: 10px;
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-row button:hover {
  background-color: #3a80d2;
}

.iframe-container {
  width: 100vw;
  height: 100vh;
  border: none;
  overflow: hidden;
  z-index: 1000;
  background-color: #fff;
}

.order-info {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 10px;
  display: flex;
}

.info-item .label {
  font-weight: bold;
  width: 120px;
}

.info-item .value {
  flex: 1;
}

.info-item .value.address {
  word-break: break-all;
}

.value.pending {
  color: #f0ad4e;
}

.value.processing {
  color: #5bc0de;
}

.value.completed {
  color: #5cb85c;
}

.value.expired,
.value.failed {
  color: #d9534f;
}

.value.underpaid {
  color: #f0ad4e;
}

.event-log {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.log-controls {
  margin-bottom: 10px;
}

.log-entries {
  height: 300px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

.log-entry {
  margin-bottom: 8px;
  font-family: monospace;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.log-entry .time {
  color: #666;
  margin-right: 10px;
}

.log-entry .type {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 10px;
  font-weight: bold;
}

.log-entry .type.info {
  background-color: #d9edf7;
  color: #31708f;
}

.log-entry .type.order_created {
  background-color: #dff0d8;
  color: #3c763d;
}

.log-entry .type.order_status {
  background-color: #fcf8e3;
  color: #8a6d3b;
}

.log-entry .type.error {
  background-color: #f2dede;
  color: #a94442;
}

.log-entry .type.token_expired {
  background-color: #f2dede;
  color: #a94442;
}

.log-entry .data {
  margin-top: 5px;
  white-space: pre-wrap;
  font-size: 12px;
}
</style>
