module.exports = {
  packagerConfig: {
    // Exclude specific files, folders, or extensions using regex patterns
    ignore: [
      /^\/\.vscode/,                  // Exclude VS Code folder
      /^\/src/,                       // Exclude raw source code if using a build step
      /\.git/,                        // Exclude Git files
      /\.env$/,                       // Exclude environment variables file
      /\/node_modules\/.*\/test\//,    // Exclude test directories inside node_modules
      /^\/\.files_to_create/,
      /^\/\.temp/
    ],
    executableName: 'Steam-Runtime-Manager.appImage',
    icon: './assets/icon.png',
    
    // Changes the directory path where Electron Forge places the packaged builds
    out: './out-builds/',
  },
  makers: [
    // ... your makers configuration
  ]
};