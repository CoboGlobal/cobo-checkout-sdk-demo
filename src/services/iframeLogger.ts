/**
 * iframeLogger.ts
 * 用于捕获iframe中的console.log并在主页面显示
 */

// 父页面使用这个函数来设置消息事件监听器
export const setupParentConsoleListener = () => {
  window.addEventListener('message', (event) => {
    // 安全检查，只接受来自您信任的来源的消息
    // 在开发环境中可以放宽这个限制
    try {
      const { type, level, args } = event.data
      if (type === 'iframe-console') {
        switch (level) {
          case 'log':
            console.log('[IFRAME]', ...args)
            break
          case 'info':
            console.info('[IFRAME]', ...args)
            break
          case 'warn':
            console.warn('[IFRAME]', ...args)
            break
          case 'error':
            console.error('[IFRAME]', ...args)
            break
          case 'debug':
            console.debug('[IFRAME]', ...args)
            break
          default:
            console.log('[IFRAME]', ...args)
        }
      }
    } catch (error) {
      // 忽略解析错误
    }
  })
}

// iframe内部使用这个脚本来重写console方法
export const setupIframeConsole = () => {
  // 保存原始的console方法
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  }

  // 重写console方法
  const overrideConsole = (level: 'log' | 'info' | 'warn' | 'error' | 'debug') => {
    return function (...args: any[]) {
      // 调用原始的console方法，保留iframe中的日志
      originalConsole[level].apply(console, args)

      // 将日志发送到父窗口
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            {
              type: 'iframe-console',
              level,
              args: args.map((arg) =>
                // 尝试序列化复杂对象
                typeof arg === 'object' ? JSON.stringify(arg) : arg,
              ),
            },
            '*', // 在开发环境中可以使用'*'，生产环境应指定确切的来源
          )
        }
      } catch (error) {
        // 忽略发送错误
        originalConsole.error('Failed to send log to parent:', error)
      }
    }
  }

  // 替换所有的console方法
  console.log = overrideConsole('log')
  console.info = overrideConsole('info')
  console.warn = overrideConsole('warn')
  console.error = overrideConsole('error')
  console.debug = overrideConsole('debug')
}
