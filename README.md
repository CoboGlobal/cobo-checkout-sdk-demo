# Cobo Checkout Vue 3 Demo

This is a Vue 3-based demo application that demonstrates how to integrate the Cobo Checkout SDK.

## Project Overview

This project simulates how a customer/PSP integrates Cobo Checkout through iframe. Main features include:

1. Direct OAuth authentication API calls from frontend
2. Automatic token expiration and refresh logic handling
3. Embedding locally running Checkout application through iframe
4. Using postMessage for iframe communication
5. Complete demonstration of order creation and status change process

## Prerequisites

Before running this demo, please ensure:

1. Frontend has correctly configured Checkout SDK environment (please modify iframeUrl in `src/views/CheckoutDemo.vue`)
2. Backend has implemented logic to obtain token through API Key (can temporarily mock data in `src/services/authService.ts`)

## Installation and Running

```bash
# Install dependencies
pnpm install

# Start development server
npm run dev
```

## Usage Instructions

1. 【demo】Enter transaction amount and order number (or use auto-generated ones)
2. 【demo】Click "Start Checkout" button to initiate checkout process (involves iframe communication, passing order-related information to SDK)
3. 【sdk】After iframe initialization is complete, it will request demo to get token (involves iframe communication, passing token to SDK)
4. 【sdk】Complete payment process in iframe

## Project Structure

- `src/services/authService.ts` - Authentication service, handles token acquisition and refresh
- `src/services/iframeService.ts` - iframe communication service
- `src/types/index.ts` - Type definitions
- `src/views/CheckoutDemo.vue` - Main demo component
