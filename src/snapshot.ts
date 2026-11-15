// Dashboard snapshot. When someone shares the Nomie dashboard as an image, the app asks this widget for a picture of itself
// with the action 'snapshot'. The picture is this page drawn to a canvas, at the size of the widget, and it goes back to the
// Nomie app only (to window.parent). A widget with nothing to show sends no reply, and the app then shows the plugin's name.
//
// The plugin id (pid) and the widget id (lid) come from the NomiePlugin object: the SDK stores them from the URL and from
// the 'registered' message. This file has no other dependency.

type SnapshotSource = { pid?: string; lid?: string }

// The app ignores a picture larger than this (2,000,000 characters), so a larger one is drawn again at a smaller size
const MAX_CHARS = 2_000_000
// Drawn at twice the widget's size for a sharp picture; the app fits it to the widget's box
const PIXEL_SCALE = 2

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

const hasContent = (root: HTMLElement): boolean =>
  (root.innerText || '').trim().length > 0 || root.querySelector('canvas, img, svg') !== null

// The page's own styles. Stylesheets from another site cannot be read, so they are skipped.
const styleText = (): string => {
  let css = ''
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) css += rule.cssText + '\n'
    } catch {
      // a stylesheet that cannot be read is left out; the picture uses the rest
    }
  }
  return css
}

// A copy of the markup does not carry canvas pixels or what someone has typed, so both are copied in
const copyLiveState = (source: HTMLElement, copy: HTMLElement): void => {
  const canvases = Array.from(source.querySelectorAll('canvas'))
  const canvasCopies = Array.from(copy.querySelectorAll('canvas'))
  canvases.forEach((canvas, index) => {
    const target = canvasCopies[index]
    if (!target) return
    const img = document.createElement('img')
    img.src = canvas.toDataURL('image/png')
    img.width = canvas.clientWidth
    img.height = canvas.clientHeight
    img.setAttribute('style', target.getAttribute('style') ?? '')
    target.replaceWith(img)
  })
  const fields = Array.from(source.querySelectorAll('input, textarea'))
  const fieldCopies = Array.from(copy.querySelectorAll('input, textarea'))
  fields.forEach((field, index) => {
    const target = fieldCopies[index]
    if (!target) return
    if (field instanceof HTMLTextAreaElement) target.textContent = field.value
    else if (field instanceof HTMLInputElement) {
      target.setAttribute('value', field.value)
      if (field.checked) target.setAttribute('checked', '')
    }
  })
}

// Draws the page at width x height, at the given pixel scale. Returns a data URL.
const drawPage = async (
  width: number,
  height: number,
  scale: number,
  type: 'image/png' | 'image/jpeg',
  quality?: number
): Promise<string> => {
  const copy = document.body.cloneNode(true) as HTMLElement
  copyLiveState(document.body, copy)
  const markup = new XMLSerializer().serializeToString(copy)
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<style><![CDATA[${styleText()}]]></style>` +
    `<foreignObject x="0" y="0" width="${width}" height="${height}">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;overflow:hidden">${markup}</div>` +
    `</foreignObject></svg>`
  const img = new Image()
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  await img.decode()
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.scale(scale, scale)
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL(type, quality)
}

// The picture of this widget, or undefined when there is nothing to show or it cannot be drawn
export const pictureOfWidget = async (): Promise<string | undefined> => {
  try {
    if (!hasContent(document.body)) return undefined
    await document.fonts?.ready
    // two frames: the page has finished its layout and painting before it is copied
    await nextFrame()
    await nextFrame()
    const width = Math.round(window.innerWidth)
    const height = Math.round(window.innerHeight)
    if (width < 2 || height < 2) return undefined
    let image = await drawPage(width, height, PIXEL_SCALE, 'image/png')
    if (image.length > MAX_CHARS) image = await drawPage(width, height, 1, 'image/png')
    if (image.length > MAX_CHARS) image = await drawPage(width, height, 1, 'image/jpeg', 0.85)
    if (!image.startsWith('data:image/') || image.length > MAX_CHARS) return undefined
    return image
  } catch {
    // a picture that cannot be drawn (for example a picture from another site) is not sent
    return undefined
  }
}

// Answers the app's 'snapshot' request. Call once, after the plugin object is created.
export const startSnapshots = (plugin: SnapshotSource): void => {
  window.addEventListener('message', async (event) => {
    if (event.source !== window.parent) return
    if (event.data?.action !== 'snapshot') return
    const { pid, lid } = plugin
    if (!pid || !lid) return
    const image = await pictureOfWidget()
    if (!image) return
    window.parent.postMessage({ action: 'snapshot', data: { pid, lid, image } }, '*')
  })
}
