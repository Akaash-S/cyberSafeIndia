// Chrome Extension Types
declare namespace chrome {
  namespace runtime {
    const onInstalled: {
      addListener(callback: (details: { reason: string }) => void): void
    }
    const onMessage: {
      addListener(callback: (request: any, sender: any, sendResponse: (response?: any) => void) => boolean | void): void
    }
    const onStartup: {
      addListener(callback: () => void): void
    }
    const onSuspend: {
      addListener(callback: () => void): void
    }
    const onSuspendCanceled: {
      addListener(callback: () => void): void
    }
    function sendMessage(message: any): Promise<any>
    function sendMessage(extensionId: string, message: any): Promise<any>
    function sendMessage(extensionId: string, message: any, options: any): Promise<any>
    function openOptionsPage(): void
    function getURL(path: string): string
    function getManifest(): any
    function getPlatformInfo(): Promise<{
      os: string
      arch: string
      nacl_arch: string
    }>
    const lastError: {
      message?: string
    } | undefined
  }

  namespace storage {
    namespace local {
      function get(keys?: string | string[] | object): Promise<any>
      function set(items: object): Promise<void>
      function remove(keys: string | string[]): Promise<void>
      function clear(): Promise<void>
      const onChanged: {
        addListener(callback: (changes: { [key: string]: { oldValue: any; newValue: any } }, areaName: string) => void): void
      }
    }
    namespace sync {
      function get(keys?: string | string[] | object): Promise<any>
      function set(items: object): Promise<void>
      function remove(keys: string | string[]): Promise<void>
      function clear(): Promise<void>
      const onChanged: {
        addListener(callback: (changes: { [key: string]: { oldValue: any; newValue: any } }, areaName: string) => void): void
      }
    }
    namespace session {
      function get(keys?: string | string[] | object): Promise<any>
      function set(items: object): Promise<void>
      function remove(keys: string | string[]): Promise<void>
      function clear(): Promise<void>
      const onChanged: {
        addListener(callback: (changes: { [key: string]: { oldValue: any; newValue: any } }, areaName: string) => void): void
      }
    }
  }

  namespace tabs {
    function create(createProperties: { 
      url?: string
      active?: boolean
      pinned?: boolean
      windowId?: number
      index?: number
    }): Promise<Tab>
    function query(queryInfo: { 
      active?: boolean
      currentWindow?: boolean
      windowId?: number
      url?: string | string[]
      title?: string
      pinned?: boolean
      audible?: boolean
      muted?: boolean
      discarded?: boolean
      groupId?: number
    }): Promise<Tab[]>
    function get(tabId: number): Promise<Tab>
    function getCurrent(): Promise<Tab | undefined>
    function sendMessage(tabId: number, message: any): Promise<any>
    function sendMessage(tabId: number, message: any, options: any): Promise<any>
    function update(tabId: number, updateProperties: {
      url?: string
      active?: boolean
      pinned?: boolean
      muted?: boolean
      autoDiscardable?: boolean
    }): Promise<Tab>
    function remove(tabIds: number | number[]): Promise<void>
    function reload(tabId: number, reloadProperties?: { bypassCache?: boolean }): Promise<void>
    function duplicate(tabId: number): Promise<Tab>
    function captureVisibleTab(windowId?: number, options?: {
      format?: 'jpeg' | 'png'
      quality?: number
    }): Promise<string>
    const onUpdated: {
      addListener(callback: (tabId: number, changeInfo: TabChangeInfo, tab: Tab) => void): void
    }
    const onActivated: {
      addListener(callback: (activeInfo: { tabId: number; windowId: number }) => void): void
    }
    const onCreated: {
      addListener(callback: (tab: Tab) => void): void
    }
    const onRemoved: {
      addListener(callback: (tabId: number, removeInfo: { windowId: number; isWindowClosing: boolean }) => void): void
    }
  }

  namespace contextMenus {
    function create(createProperties: { 
      id?: string
      title: string
      contexts?: string[]
      visible?: boolean
      enabled?: boolean
      type?: 'normal' | 'checkbox' | 'radio' | 'separator'
      checked?: boolean
      parentId?: string | number
      documentUrlPatterns?: string[]
      targetUrlPatterns?: string[]
    }): void
    function update(id: string | number, updateProperties: {
      title?: string
      contexts?: string[]
      visible?: boolean
      enabled?: boolean
      type?: 'normal' | 'checkbox' | 'radio' | 'separator'
      checked?: boolean
      parentId?: string | number
      documentUrlPatterns?: string[]
      targetUrlPatterns?: string[]
    }): void
    function remove(id: string | number): void
    function removeAll(): void
    const onClicked: {
      addListener(callback: (info: MenuClickInfo, tab: Tab) => void): void
    }
  }

  namespace commands {
    const onCommand: {
      addListener(callback: (command: string) => void): void
    }
  }

  namespace alarms {
    function create(name: string, alarmInfo: { 
      when?: number
      delayInMinutes?: number
      periodInMinutes?: number
    }): void
    function get(name?: string): Promise<Alarm | Alarm[]>
    function clear(name?: string): Promise<boolean>
    function clearAll(): Promise<boolean>
    const onAlarm: {
      addListener(callback: (alarm: Alarm) => void): void
    }
  }

  namespace notifications {
    function create(notificationId?: string, options: {
      type: 'basic' | 'image' | 'list' | 'progress'
      iconUrl?: string
      title: string
      message: string
      contextMessage?: string
      priority?: number
      eventTime?: number
      buttons?: Array<{
        title: string
        iconUrl?: string
      }>
      imageUrl?: string
      items?: Array<{
        title: string
        message: string
      }>
      progress?: number
      isClickable?: boolean
      requireInteraction?: boolean
      silent?: boolean
    }): Promise<string>
    function update(notificationId: string, options: any): Promise<boolean>
    function clear(notificationId: string): Promise<boolean>
    function clearAll(): Promise<boolean>
    function getAll(): Promise<{ [notificationId: string]: any }>
    const onClicked: {
      addListener(callback: (notificationId: string) => void): void
    }
    const onButtonClicked: {
      addListener(callback: (notificationId: string, buttonIndex: number) => void): void
    }
    const onClosed: {
      addListener(callback: (notificationId: string, byUser: boolean) => void): void
    }
  }

  namespace scripting {
    function executeScript(details: {
      target: { tabId: number }
      files?: string[]
      func?: Function
      args?: any[]
      world?: 'ISOLATED' | 'MAIN'
    }): Promise<any[]>
    function insertCSS(details: {
      target: { tabId: number }
      files?: string[]
      css?: string
    }): Promise<void>
    function removeCSS(details: {
      target: { tabId: number }
      files?: string[]
      css?: string
    }): Promise<void>
  }

  namespace windows {
    function create(createData?: {
      url?: string | string[]
      tabId?: number
      left?: number
      top?: number
      width?: number
      height?: number
      focused?: boolean
      incognito?: boolean
      type?: 'normal' | 'popup' | 'panel' | 'detached_panel'
      state?: 'normal' | 'minimized' | 'maximized' | 'fullscreen' | 'docked'
    }): Promise<Window>
    function get(windowId: number, populate?: boolean): Promise<Window>
    function getCurrent(populate?: boolean): Promise<Window>
    function getLastFocused(populate?: boolean): Promise<Window>
    function getAll(populate?: boolean): Promise<Window[]>
    function update(windowId: number, updateInfo: {
      left?: number
      top?: number
      width?: number
      height?: number
      focused?: boolean
      drawAttention?: boolean
      state?: 'normal' | 'minimized' | 'maximized' | 'fullscreen' | 'docked'
    }): Promise<Window>
    function remove(windowId: number): Promise<void>
    const onCreated: {
      addListener(callback: (window: Window) => void): void
    }
    const onRemoved: {
      addListener(callback: (windowId: number) => void): void
    }
    const onFocusChanged: {
      addListener(callback: (windowId: number) => void): void
    }
  }
}

// Additional type definitions
interface Tab {
  id?: number
  index: number
  windowId: number
  openerTabId?: number
  selected: boolean
  highlighted: boolean
  active: boolean
  pinned: boolean
  audible?: boolean
  discarded: boolean
  autoDiscardable: boolean
  mutedInfo?: {
    muted: boolean
    reason?: string
    extensionId?: string
  }
  url?: string
  pendingUrl?: string
  title?: string
  favIconUrl?: string
  status?: 'loading' | 'complete'
  incognito: boolean
  width?: number
  height?: number
  sessionId?: string
  groupId?: number
}

interface TabChangeInfo {
  status?: 'loading' | 'complete'
  url?: string
  pinned?: boolean
  audible?: boolean
  discarded?: boolean
  autoDiscardable?: boolean
  mutedInfo?: {
    muted: boolean
    reason?: string
    extensionId?: string
  }
  favIconUrl?: string
  title?: string
}

interface MenuClickInfo {
  menuItemId: string | number
  parentMenuItemId?: string | number
  mediaType?: string
  linkUrl?: string
  srcUrl?: string
  pageUrl?: string
  frameUrl?: string
  selectionText?: string
  editable: boolean
  wasChecked?: boolean
  checked?: boolean
}

interface Alarm {
  name: string
  scheduledTime: number
  periodInMinutes?: number
}

interface Window {
  id?: number
  focused: boolean
  top?: number
  left?: number
  width?: number
  height?: number
  tabs?: Tab[]
  incognito: boolean
  type?: 'normal' | 'popup' | 'panel' | 'detached_panel'
  state?: 'normal' | 'minimized' | 'maximized' | 'fullscreen' | 'docked'
  alwaysOnTop: boolean
  sessionId?: string
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
