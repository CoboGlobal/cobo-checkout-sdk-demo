<template>
  <div class="checkout-demo">
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
    <div class="settings">
      <h2>交易设置</h2>
      <div class="form-row">
        <label for="amount">金额 (USD):</label>
        <input id="amount" v-model="amount" type="number" min="1" step="0.01" />
      </div>
      <div class="form-row">
        <label for="locale">语言:</label>
        <select id="locale" v-model="locale">
          <option value="zh">中文</option>
          <option value="en">英文</option>
        </select>
      </div>
      <div class="form-row">
        <label for="merchantOrderCode">订单号:</label>
        <input id="merchantOrderCode" v-model="merchantOrderCode" type="text" />
      </div>
      <div class="form-row">
        <label for="merchantOrderCode">订单号:</label>
        <input id="pspOrderCode" v-model="pspOrderCode" type="text" />
      </div>
      <div class="form-row">
        <button @click="refreshOrderCode">生成新商户订单号</button>
        <button @click="refreshPSPOrderCode">获取新的PSP订单号</button>
        <button @click="initializeCheckout">开始结账</button>
      </div>
    </div>

    <div v-if="currentOrder" class="order-info">
      <h2>当前订单信息</h2>
      <div class="info-item">
        <span class="label">订单ID:</span>
        <span class="value">{{ currentOrder.orderId }}</span>
      </div>
      <div class="info-item">
        <span class="label">状态:</span>
        <span class="value" :class="getStatusClass(currentOrder.status)">
          {{ getStatusText(currentOrder.status) }}
        </span>
      </div>
      <div class="info-item">
        <span class="label">法币金额:</span>
        <span class="value">{{ currentOrder.orderAmount }} {{ currentOrder.currency }}</span>
      </div>
      <div class="info-item">
        <span class="label">加密货币:</span>
        <span class="value">{{ currentOrder.payableAmount }} {{ currentOrder.tokenId }}</span>
      </div>
      <div class="info-item">
        <span class="label">链:</span>
        <span class="value">{{ currentOrder.chainId }}</span>
      </div>
      <div class="info-item">
        <span class="label">接收地址:</span>
        <span class="value address">{{ currentOrder.receiveAddress }}</span>
      </div>
      <div class="info-item">
        <span class="label">过期时间:</span>
        <span class="value">{{ formatExpireTime(currentOrder.expiredAt) }}</span>
      </div>
    </div>

    <div class="event-log">
      <h2>事件日志</h2>
      <div class="log-controls">
        <button @click="clearEventLog">清空日志</button>
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
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { IOrder } from '@/types'
import { OrderStatus } from '../types'
import { checkoutIframeManager } from '../services/checkoutIframeService'

// 测试环境
const iframeUrl = 'https://payout-checkout.dev.cobo.com';
// 生产环境
// const iframeUrl = 'https://payout-checkout.cobo.com';

// 基本配置
const amount = ref('0.1')
const merchantId = 'M1002'
const merchantName = 'Demo Store'
const merchantLogo = 'https://placeholder.com/logo.png'
const merchantUrl = 'https://example.com'
const merchantOrderCode = ref(`order-${Date.now()}`)
const pspOrderCode = ref(`psp-${Date.now()}`)
const locale = ref<'zh' | 'en'>('zh')
// UI状态
const showIframe = ref(false)
const checkoutIframe = ref<HTMLIFrameElement | null>(null)
const currentOrder = ref<IOrder | null>(null)
const eventLog = ref<Array<{ type: string; timestamp: Date; data: any }>>([])

// 刷新订单号
const refreshOrderCode = () => {
  merchantOrderCode.value = `order-${Date.now()}`
  addEventLog('INFO', '已生成新订单号')
}

// 刷新PSP订单号
const refreshPSPOrderCode = () => {
  pspOrderCode.value = `psp-${Date.now()}`
  addEventLog('INFO', '已生成新PSP订单号')
}

// 初始化结账
const initializeCheckout = async () => {
  showIframe.value = true
  currentOrder.value = null
  // 等待DOM更新后初始化iframe
  await new Promise((resolve) => setTimeout(resolve, 100))
  if (checkoutIframe.value) {
    checkoutIframeManager.initialize(checkoutIframe.value, {
      fiatCurrency: 'USD',
      fiatAmount: amount.value,
      merchantId,
      merchantName,
      merchantLogo,
      merchantUrl,
      feeAmount: '0.01', // 手续费,PSP方决定，真实业务场景需要PSP调用接口获取
      merchantOrderCode: merchantOrderCode.value,
      pspOrderCode: pspOrderCode.value, // 服务商订单号,PSP方决定
      expiredIn: 30 * 60, // 订单过期时间，PSP方决定，最小30分钟，最大3小时（单位：秒）
      locale: locale.value,
      supportToken: ['USDT', 'USDC'],
      supportChain: ['ARBITRUM_ETH', 'BASE_ETH', 'BSC_BNB', 'ETH', 'MATIC', 'SOL', 'TRON'],
    })
    addEventLog('INFO', '结账已初始化')
  }
}

// 添加事件日志
const addEventLog = (type: string, data: any) => {
  eventLog.value.unshift({
    type,
    timestamp: new Date(),
    data,
  })
}

// 清空事件日志
const clearEventLog = () => {
  eventLog.value = []
}

// 格式化事件数据
const formatEventData = (data: any) => {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2)
  }
  return data
}

// 格式化时间
const formatTime = (date: Date) => {
  return date.toLocaleTimeString()
}

// 格式化过期时间
const formatExpireTime = (timestamp: number) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 获取状态文本
const getStatusText = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    [OrderStatus.Pending]: '待支付',
    [OrderStatus.Processing]: '支付中',
    [OrderStatus.Completed]: '已完成',
    [OrderStatus.Expired]: '已过期',
    [OrderStatus.Underpaid]: '支付不足',
  }
  return statusMap[status] || status
}

// 获取状态CSS类
const getStatusClass = (status: OrderStatus) => {
  return status.toLowerCase()
}

// 组件挂载
onMounted(() => {
  addEventLog('INFO', '组件已加载')
})

// 组件销毁前清理
onBeforeUnmount(() => {
  checkoutIframeManager.cleanup()
  addEventLog('INFO', '组件已卸载')
})
</script>

<style scoped>
.checkout-demo {
  max-width: 1000px;
  margin: 0 auto;
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
  position: fixed;
  top: 0;
  left: 0;
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
