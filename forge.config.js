const path = require('path');
const { MakerAppImage } = require('electron-forge-maker-appimage');

module.exports = {
  packagerConfig: {
    ignore: [
      /^\/\.vscode/,                  
      /^\/src/,                       
      /\.git/,                        
      /\.env$/,                       
      /\/node_modules\/.*\/test\//,    
      /^\/\.files_to_create/,
      /^\/\.temp/,
      /\/github_assets/
    ],
    executableName: 'Steam-Runtime-Manager', // Removed .appImage extension
    icon: './assets/icon.png',
    files: [
      "package.json",
      "main.js",
      "scripts/startMain.js",
      "scripts/start.css",
      "preload.js",
      "index.html",
      "assets/*",
      "src/**/*",
      "languages.json"
    ],
    asar: true, 
    out: './out-builds/',
  },
  makers: [
    new MakerAppImage({
      //artifactName: '${name}.${ext}',
      artifactName: 'Steam-Runtime-Manager.${ext}',
      
      
      // Desktop entry categories for Linux application menus
      category: 'Utility',
     })
  ]
};