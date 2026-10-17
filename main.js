// https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app

const { app, BrowserWindow, ipcMain, ipcRenderer, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const tar = require('tar-stream');
const zlib = require('zlib');

const https = require('https');

const tempPath = path.join(__dirname,".temp");
const outputSteamRunFile = path.join(tempPath, 'SteamLinuxRuntime_4.tar.xz');
const fileUrl = "https://repo.steampowered.com/steamrt4/images/4.0.20260914.260627/SteamLinuxRuntime_4.tar.xz" //'https://steampowered.com';

const strSteamRepoURL = "https://repo.steampowered.com/";
const strSteamRun = "steamrt";
const numDefaultCurrentSteamRunVersion = 4;
const strLatestPubBeta = "images/latest-public-beta/";
const strSteamRunTime = "SteamLinuxRuntime_{@}.tar.xz";
var numCurrentSteamRunVersion = numDefaultCurrentSteamRunVersion;
const strDefaultCurrentSteamRunVersion = "steamrt4";
var strCurrentSteamRunVersion = `{strDefaultCurrentSteamRunVersion}{numDefaultCurrentSteamRunVersion}`;
const updateTxtURL = "images/latest-public-beta.txt";

var localVersion = 0;

const createWindow = () => {
  var preloadPath = path.join(__dirname, 'preload.js');
  console.log(path.join(__dirname, 'preload.js'));

  try{
    if(fs.existsSync(preloadPath)){
      // add read/write permissions
      fs.chmodSync(preloadPath, 0o755); 
    }
  }
  catch(error){
    console.error(`Failed to modify permissions for preload.js:`, error);
  }

  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 880,
    minHeight: 440,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.loadFile('index.html');
}

ipcMain.handle('save-file-dial', async (event, strFilePath)=>{
  // https://www.electronjs.org/docs/latest/api/dialog

  var fileParts = [];
  var defaultFileName = "";
  var downloadsPath = `${getUserHomeDir()}/Downloads/`;

  var finalDefaultPath = ""

  if (!["",undefined].includes(strFilePath)){
    fileParts = strFilePath.split("/");
    defaultFileName = fileParts[fileParts.length - 1];
    finalDefaultPath = downloadsPath + defaultFileName;
  }
  
  var dialogOptions = {
    title: "Save Steam Runtime file",
    defaultPath: finalDefaultPath,
    filters: [
      { name: 'Tar file', extensions: ['xz'] },
    ]
  };


  var result = await dialog.showSaveDialog(dialogOptions);

  return result;
});

ipcMain.on('download-runtime', (event, strFilePath, targetPath)=>{
  // https://www.electronjs.org/docs/latest/api/dialog


  downloadSteamRun(event, strFilePath, targetPath);
});

ipcMain.on('check-runtime-major-version', async (event)=>{
  var results = await checkForNewestRuntimeMajorVersion(event);
  //event.sender.send('check-complete', results);
  
});

ipcMain.handle('message-save-dial', async (event, filePath) => {
  //https://www.electronjs.org/docs/latest/api/dialog#dialogshowmessageboxsyncwindow-options


  var dialogOptions = {
    title: "Steam Runtime Download Successful",
    message: "Would you like to open the directory for the file?",
    buttons: ["Yes","No"],
    type: "info",
  };

  var result = dialog.showMessageBoxSync(dialogOptions);

  // if result = 0, then open the directory
  if (result == 0){
    var fileDir = path.dirname(filePath);
    shell.showItemInFolder(filePath);
  }
  
  return result;
});

ipcMain.handle('message-load-dial', async (event, filePath) => {
  //https://www.electronjs.org/docs/latest/api/dialog#dialogshowmessageboxsyncwindow-options

  var strMessage = `Would you like to select the following file to prep for installation?\n\n${filePath}`;

  var result = false;

  var dialogOptions = {
    title: "Steam Runtime Load File",
    message: strMessage,
    buttons: ["Yes","No"],
    type: "info",
  };

  var messageResult = dialog.showMessageBoxSync(dialogOptions);

  // if result = 0, then open the directory
  if (messageResult == 0){
    result = true;
  }
  
  return result;
});

ipcMain.handle('get-installed-runtime', async (event, dirPath) => {
  var result = await checkInstalledRuntimeFolders(dirPath)
  return result;
});

ipcMain.handle('get-installed-runtime-version', async (event, strFilePath, compressed) => {
  var versionNum = '0';
  var result = await checkVersionsFile(strFilePath);

  var txtVer = parseVersionsFile(result);

  var psuedoVerNum = txtVer.replaceAll(".","")
  if (!isNaN(psuedoVerNum)){
    versionNum = txtVer
  }
  return versionNum;
});

ipcMain.handle('get-home-dir', () => {
  var result = getUserHomeDir();

  return result;
});

async function checkVersionsFile(strFilePath){
  var strContent = "";
  return fs.promises.readFile(strFilePath, 'utf-8', (err, data) => {
        if(err){
            alert("An error ocurred reading the file :" + err.message);
            return;
        }

        strContent = data;
        // Change how to handle the file content
        //console.log("The file content is : " + data);
        return strContent;
    });
}

async function checkInstalledRuntimeFolders(dirPath){
  var steamFolders = [];
  var strNewerFolder = "";
  var finalDirPath = dirPath;

  if (dirPath.endsWith("/")){
    finalDirPath = dirPath.substring(0, dirPath.length - 1);
  }

  try{
    var entries = await fs.promises.readdir(finalDirPath, { withFileTypes: true });
    // Filter for directories that start with "steamrt" (case-insensitive)
    var steamFolders2 = entries
      .filter((entry) => entry.isDirectory() && entry.name.toLowerCase().startsWith(strSteamRun))
      .map((entry2) => entry2.name);

    if (steamFolders2){
      steamFolders.push(...steamFolders2.sort().reverse());
    }

    /*
    When installing, will need to create the "var" folder and create a link (named "umu") to the file "v2-entry-point"
    */
  }
  catch (err){
    console.error(`Failed to scan directory ${finalDirPath}:`, err);
  }

  if (steamFolders?.length > 0){
    strNewerFolder = steamFolders[0];
  }

  return strNewerFolder;
}

// needed for creating the umu link file
async function createSymLink(linkPath, targetPath, linkType = "file"){
  if(["", undefined].inlclude(linkPath)){
    console.error("Link Path cannot be empty");
    return;
  }
  if(["", undefined].inlclude(targetPath)){
    console.error("Target Path cannot be empty");
    return;
  }

  if(!["file", "dir"].inlclude(linkType)){
    console.error(`Link Type must be "file" or "dir"`);
    return;
  }

  try {
    await fs.promises.symlink(targetPath, linkPath);
    console.log(`Link path created for target ${targetPath}`)
  }
  catch (err){

  }
}


function getUserHomeDir() {
  var homePath = app.getPath("home"); //process.env['HOME'];
  return homePath;
}

async function checkForNewestRuntimeMajorVersion(event){ //
  //strSteamRun
  var validVersion = numCurrentSteamRunVersion;
  var nextVersion = numCurrentSteamRunVersion + 1

  var finalResults = {};

  var results = await checkRuntimeMajorVersion(nextVersion);

  if (results.available == true){
    finalResults = results;
    //finalResults.majorVersionNumber = nextVersion;
  }
  else {
    finalResults = await checkRuntimeMajorVersion(validVersion);
  }

  if (event != undefined){
    //finalResults.majorVersionNumber = numCurrentSteamRunVersion;
    event.sender.send('check-complete', finalResults);
  }

  return finalResults;
}

async function checkRuntimeMajorVersion(versionNumber){
  //strSteamRun
  //var validVersion = numCurrentSteamRunVersion;
  var nextVersion = 4
  if (!isNaN(versionNumber)){
    nextVersion = versionNumber;
  }

  var strURL = `${strSteamRepoURL}${strSteamRun}${versionNumber}/${updateTxtURL}`;

  var results = await checkNewestSteamRuntimeVersionNumber(strURL, versionNumber);

  return results;
}

function checkNewestSteamRuntimeVersionNumber(strURL, majorVersion){
  var strFinalVerName = majorVersion.toString();

  if (majorVersion == 3){
    strFinalVerName = "sniper";
  }

  var strReplaceAtSymbol = strSteamRunTime.replaceAll("{@}",strFinalVerName);

  var runTimeURL = `${strSteamRepoURL}${strSteamRun}${majorVersion.toString()}/${strLatestPubBeta}${strReplaceAtSymbol}`;
  var versionPromise = new Promise((resolve) => {
    https.get(strURL, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {

          // read the data while trimming any newlines
          var dataString = data.trim();
          resolve({ majorVersion: majorVersion, available: true, versionString: dataString, url: strURL, downloadURL: runTimeURL, errorStr: ""  });
        });
      } else {
        // Consume and discard response body to free up memory
        res.resume();
        resolve({ majorVersion: majorVersion, available: false, versionString: "", url: strURL, downloadURL: "", errorStr: "" });
      }
    }).on('error', (err) => {
      resolve({ majorVersion: majorVersion, available: false, versionString: "", url: strURL, downloadURL: "", errorStr: err.message });
    });
  });

  return versionPromise;
}

function checkTarFile(){
  // See the link below:
  // https://stackoverflow.com/a/32916564

  /*

  First, extract tar file, then read the VERSIONS.txt file.

  See here for reading text file by line:
  https://stackoverflow.com/a/23332116


  See here for reading text file by tab:
  https://stackoverflow.com/a/29976895
  */
}


function parseVersionsFile(strFileText){
  var allText = "";
  var text = ""
  allText = strFileText;
  try {
    var lineArray = allText.split("\n");
    var tabText = lineArray[1]; //"depot	4.0.20261007.263973			# Overall version number";
    var tabArray = tabText.split("\t");
    text = tabArray[1];
  }
  catch (err) {
    console.error(`Couldn't parse data: \n${err}`)
  }

  return text;
}


function downloadSteamRun(event, strFilePath, targetPath){
    var fileDir = path.dirname(targetPath);

    // need to create the temp path first
    var tempPathExists = fs.existsSync(fileDir); //fs.existsSync(tempPath);
    if(!tempPathExists){
      //fs.mkdirSync(tempPath, { recursive: true });
      fs.mkdirSync(fileDir, { recursive: true });
    }

    //event.sender.send('start-download', {fileUrl, outputSteamRunFile})

    //const fileStream = fs.createWriteStream(outputSteamRunFile);
    const fileStream = fs.createWriteStream(targetPath, { highWaterMark: 4 * 1024 * 1024 });

    // fileUrl
    https.get(strFilePath, (response) => {
      const totalBytes = parseInt(response.headers['content-length'], 10);
      let downloadedBytes = 0;

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const progress = (downloadedBytes / totalBytes) * 100;

        // Send progress to renderer
        event.sender.send('download-progress', { progress, downloadedBytes, totalBytes });
      });

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        event.sender.send('download-complete', outputSteamRunFile);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete partial file on error
      event.sender.send('download-error', err.message);
    });
    
}

// /home/loco/.local/share/umu/

// ipcMain.on('start-download', (event, { fileUrl, outputPath }) => {
//   const fileStream = fs.createWriteStream(outputPath);

//   https.get(fileUrl, (response) => {
//     const totalBytes = parseInt(response.headers['content-length'], 10);
//     let downloadedBytes = 0;

//     response.on('data', (chunk) => {
//       downloadedBytes += chunk.length;
//       const progress = (downloadedBytes / totalBytes) * 100;

//       // Send progress to renderer
//       event.sender.send('download-progress', { progress, downloadedBytes, totalBytes });
//     });

//     response.pipe(fileStream);

//     fileStream.on('finish', () => {
//       fileStream.close();
//       event.sender.send('download-complete', outputPath);
//     });
//   }).on('error', (err) => {
//     fs.unlink(outputPath, () => {}); // Delete partial file on error
//     event.sender.send('download-error', err.message);
//   });
// });


app.whenReady().then(() => {
  createWindow()
});

app.on('window-all-closed', () => {
    // darwin is MacOS, so we don't want to quit the app when all windows are closed on MacOS
  if (process.platform !== 'darwin') app.quit()
});



    
    //const fileStream = fs.createWriteStream(outputSteamRunFile);

    // https.get(fileUrl, (response) => {
    //     if (response.statusCode === 200) {
    //         response.pipe(fileStream);
    //         fileStream.on('finish', () => {
    //         fileStream.close();
    //         console.log('Download completed successfully.');
    //         });
    //     } else {
    //         console.error(`Failed to download. Status code: ${response.statusCode}`);
    //         fs.unlink(outputPath, () => {});
    //     }
    //     })
    //     .on('error', (err) => {
    //         fs.unlink(outputSteamRunFile, () => {});
    //         console.error(`Error: ${err.message}`);
    // });