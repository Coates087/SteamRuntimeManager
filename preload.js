
const { contextBridge, ipcRenderer } = require('electron');

// Only use the preload script to expose Electron/Node functionality if needed
contextBridge.exposeInMainWorld('electronAPI', {
    // e.g., sendMessages: (data) => ipcRenderer.send('message', data)
    loadJson: (fileName) => ipcRenderer.invoke('load-json', fileName),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    saveFileDial: (strFilePath) => ipcRenderer.invoke('save-file-dial', strFilePath),
    messageSaveDial: (strFilePath, openFile) => ipcRenderer.invoke('message-save-dial', strFilePath, openFile),
    messageLoadDial: (strFilePath) => ipcRenderer.invoke('message-load-dial', strFilePath),
    dialLoadFile: () => ipcRenderer.invoke('dial-load-file'),
    onDecompressComplete: (callback) => ipcRenderer.on('decompress-complete', (_event, strText) => callback(strText)),
    checkRuntime: () => ipcRenderer.send('check-runtime-major-version'),
    downloadRuntime: (strFilePath, targetPath) => ipcRenderer.send('download-runtime', strFilePath, targetPath),
    installRuntime: async (strInputPath, strVersion) => ipcRenderer.invoke('install-runtime', strInputPath, strVersion),
    onInstallComplete: (callback) => ipcRenderer.on('install-runtime-complete', (_event, path) => callback(path)),
    getHomeDIR: () => ipcRenderer.invoke('get-home-dir'),
    getInstalledRuntime: (dirPath) => ipcRenderer.invoke('get-installed-runtime', dirPath),
    getInstalledRuntimeVersion: (strFilePath, compressed) => ipcRenderer.invoke('get-installed-runtime-version',strFilePath, compressed),
    //startDownload: (fileUrl, outputPath) => ipcRenderer.send('start-download', { fileUrl, outputPath }),
    onProgress: (callback) => ipcRenderer.on('download-progress', (_event, data) => callback(data)),
    onComplete: (callback) => ipcRenderer.on('download-complete', (_event, path) => callback(path)),
    onCheckComplete: (callback) => ipcRenderer.on('check-complete', (_event, dataResult) => callback(dataResult)),
    onError: (callback) => ipcRenderer.on('download-error', (_event, err) => callback(err)),
    onCloseApp: () => ipcRenderer.send('app-close'),
});