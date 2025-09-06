// Chrome Extension Types
declare namespace chrome {
  namespace runtime {
    function onInstalled: {
      addListener(callback: (details: { reason: string }) => void): void
    }
    function onMessage: {
      addListener(callback: (request: any, sender: any, sendResponse: (response?: any) => void) => boolean | void): void
    }
    function sendMessage(message: any): Promise<any>
    function openOptionsPage(): void
  }

  namespace storage {
    namespace local {
      function get(keys?: string | string[] | object): Promise<any>
      function set(items: object): Promise<void>
      function remove(keys: string | string[]): Promise<void>
    }
    namespace sync {
      function get(keys?: string | string[] | object): Promise<any>
      function set(items: object): Promise<void>
    }
  }

  namespace tabs {
    function create(createProperties: { url: string }): Promise<any>
    function query(queryInfo: { active?: boolean; currentWindow?: boolean }): Promise<any[]>
    function sendMessage(tabId: number, message: any): Promise<any>
    function onUpdated: {
      addListener(callback: (tabId: number, changeInfo: any, tab: any) => void): void
    }
  }

  namespace contextMenus {
    function create(createProperties: { id: string; title: string; contexts: string[] }): void
    const onClicked: {
      addListener(callback: (info: any, tab: any) => void): void
    }
  }

  namespace commands {
    const onCommand: {
      addListener(callback: (command: string) => void): void
    }
  }

  namespace alarms {
    function create(name: string, alarmInfo: { when?: number; periodInMinutes?: number }): void
    const onAlarm: {
      addListener(callback: (alarm: any) => void): void
    }
  }

  namespace notifications {
    function create(notification: {
      type: string
      iconUrl: string
      title: string
      message: string
    }): void
  }
}

// Firebase types for website sync
declare global {
  interface Window {
    firebase?: {
      auth(): {
        currentUser: any
        onAuthStateChanged(callback: (user: any) => void): void
      }
    }
  }
}

export {}
