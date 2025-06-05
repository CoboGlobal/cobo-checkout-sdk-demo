# Cobo Checkout Vue 3 Demo

这是一个基于Vue 3的演示应用，用于展示如何集成Cobo Checkout SDK。

## 项目概述

该项目模拟了一个客户/PSP如何通过iframe集成Cobo Checkout的流程。主要功能包括：

1. 直接从前端调用OAuth认证接口
2. 自动处理token过期和刷新逻辑
3. 通过iframe嵌入本地运行的Checkout应用
4. 使用postMessage进行iframe通信
5. 完整展示订单创建和状态变化的流程

## 预备条件

在运行此演示前，请确保：

1. 前端已配置正确的Checkout SDK环境（请在`src/views/CheckoutDemo.vue`中修改iframeUrl）
2. 后端已实现通过API Key获取token的逻辑（可以暂时在`src/services/authService.ts`中mock数据）

## 安装和运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
npm run dev
```

## 使用说明

1. 【demo】输入交易金额和订单编号（或使用自动生成的）
2. 【demo】点击"开始结账"按钮启动结账流程（涉及iframe通信，将订单相关信息传入sdk）
3. 【sdk】iframe初始化完成后，会请求demo获取token（涉及iframe通信，将token传入sdk）
4. 【sdk】在iframe中完成支付流程

## 项目结构

- `src/services/authService.ts` - 认证服务，处理token获取和刷新
- `src/services/iframeService.ts` - iframe通信服务
- `src/types/index.ts` - 类型定义
- `src/views/CheckoutDemo.vue` - 主演示组件
