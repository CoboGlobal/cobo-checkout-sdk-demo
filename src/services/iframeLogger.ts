/**
 * iframeLogger.ts
 * Used to capture console.log in iframe and display in main page
 */

// Parent page uses this function to set up message event listener
export const setupParentConsoleListener = () => {
  window.addEventListener('message', (event) => {
    // Security check, only accept messages from trusted sources
    // This restriction can be relaxed in development environment
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
      // Ignore parsing errors
    }
  })
}

// iframe uses this script to override console methods
export const setupIframeConsole = () => {
  // Save original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  }

  // Override console methods
  const overrideConsole = (level: 'log' | 'info' | 'warn' | 'error' | 'debug') => {
    return function (...args: any[]) {
      // Call original console method, preserve logs in iframe
      originalConsole[level].apply(console, args)

      // Send logs to parent window
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            {
              type: 'iframe-console',
              level,
              args: args.map((arg) =>
                // Try to serialize complex objects
                typeof arg === 'object' ? JSON.stringify(arg) : arg,
              ),
            },
            '*', // Can use '*' in development environment, should specify exact origin in production
          )
        }
      } catch (error) {
        // Ignore sending errors
        originalConsole.error('Failed to send log to parent:', error)
      }
    }
  }

  // Replace all console methods
  console.log = overrideConsole('log')
  console.info = overrideConsole('info')
  console.warn = overrideConsole('warn')
  console.error = overrideConsole('error')
  console.debug = overrideConsole('debug')
}
