const ipcRenderer = require('electron').ipcRenderer
const Mark = require('mark.js')

global.R = (lib) => require(lib)
let svelte, props, Component, componentPath, mark

function runMark () {
  mark = new Mark(document.querySelector('body'))
  mark.mark(['undefined', '01.01.1970', 'null'])
}
ipcRenderer.on('destroy', (event, data) => {
  svelte && svelte.$destroy()
})
ipcRenderer.on('props', (event, data) => {
  props = data.svelteProps
  svelte && svelte.$set(props)
  componentPath = data.componentPath
})
ipcRenderer.on('set_dokument', () => {
  if (svelte) {
    svelte.$destroy()
    delete require.cache[componentPath]
  }
  Component = require(componentPath)
  try {
    svelte = new Component({ target: document.querySelector('svelte'), props })
    console.log('Svelte-Dokument erfolgreich geladen.')
    ipcRenderer.sendToHost('dokument_options', {
      kommentar: svelte.kommentar,
      pdf_name: svelte.pdf_name,
      generic_pdf: svelte.generic_pdf
    })
  } catch (error) {
    const { serializeError } = require('serialize-error')
    console.log('Das Svelte-Dokument konnte nicht geladen werden:', error)
    ipcRenderer.sendToHost('error_message', serializeError(error))
  }
  runMark()
})

ipcRenderer.on('open_devtools', (event, data) => {
  global.daten = data
  console.group('Report-Daten')
  console.log('Die für Reports zur Verfügung stehenden Daten sind unter `daten` abgelegt:')
  console.log(global.daten)
  console.groupEnd()
})
ipcRenderer.on('set_edit', (event, edit) => {
  document.querySelector('#content').setAttribute('contenteditable', edit)
})
ipcRenderer.on('set_mark', (event, state) => {
  state ? runMark() : mark.unmark()
})
