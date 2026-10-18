
const { contextBridge, ipcRenderer } = require('electron');

// Only use the preload script to expose Electron/Node functionality if needed
contextBridge.exposeInMainWorld('electronAPI', {
    // e.g., sendMessages: (data) => ipcRenderer.send('message', data)
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    saveFileDial: (strFilePath) => ipcRenderer.invoke('save-file-dial', strFilePath),
    messageSaveDial: (strFilePath) => ipcRenderer.invoke('message-save-dial', strFilePath),
    messageLoadDial: (strFilePath) => ipcRenderer.invoke('message-load-dial', strFilePath),
    dialLoadFile: () => ipcRenderer.invoke('dial-load-file'),
    onDecompressComplete: (callback) => ipcRenderer.on('decompress-complete', (_event, strText) => callback(strText)),
    checkRuntime: () => ipcRenderer.send('check-runtime-major-version'),
    downloadRuntime: (strFilePath, targetPath) => ipcRenderer.send('download-runtime', strFilePath, targetPath),
    getHomeDIR: () => ipcRenderer.invoke('get-home-dir'),
    getInstalledRuntime: (dirPath) => ipcRenderer.invoke('get-installed-runtime', dirPath),
    getInstalledRuntimeVersion: (strFilePath, compressed) => ipcRenderer.invoke('get-installed-runtime-version',strFilePath, compressed),
    //startDownload: (fileUrl, outputPath) => ipcRenderer.send('start-download', { fileUrl, outputPath }),
    onProgress: (callback) => ipcRenderer.on('download-progress', (_event, data) => callback(data)),
    onComplete: (callback) => ipcRenderer.on('download-complete', (_event, path) => callback(path)),
    onCheckComplete: (callback) => ipcRenderer.on('check-complete', (_event, dataResult) => callback(dataResult)),
    onError: (callback) => ipcRenderer.on('download-error', (_event, err) => callback(err))
});