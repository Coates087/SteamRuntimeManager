

const fileUrl = 'https://steampowered.com';
// reference this video from Zac of All Tech:
// https://www.youtube.com/watch?v=8eLNA2-8fs0

// Check here for packaging this program as an AppImage:
// https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging
let divMain = $('#mainWin');
let divFileProgressBar = $('#fileProgressBar');
var localVersion = '';
var localMajorVersion = '';
var tarFilePath = "";

( async () => {
  // let content = document.getElementById('content').innerText;

  // document.getElementById('save').addEventListener('click', saveContent(content));

  // window.ipcRender.receive('editor:getContent', () => { saveContent(content); });

  var myContent = `
      <p>Welcome to the Steam Runtime Manager!</p>
      <p>This app allows you to download and manage Steam runtimes for your games on Linux.</p>
      <div class="vert-spacer">
        <button id="checkBtn">Check Latest Runtime</button>
        <button id="downloadBtn">Download Runtime</button>
      </div>
      <div class="vert-spacer">
        <button id="loadRunTimeFileBtn">Load Runtime File</button>
        <button id="installRunTimeFileBtn">Install Runtime File</button>
      </div>
      `;

  divMain.html(myContent)
  //divMain2.innerHTML = myContent;
  console.log(divMain);

  //await checkSteamRun();
})();

$(async function(){
  var umuStr = await getUmuPath();
  console.log(umuStr);

  var resultPath = "";
  resultPath = await searchSRTFolders(umuStr);

  console.log(`UMU Dir: ${resultPath}`);

  // check version installed locally
  var versionFilePath = `${umuStr}${resultPath}/VERSIONS.txt`

  localVersion = '0';
  //VERSIONS.txt
  localVersion = await checkVersion(versionFilePath, false)

  checkSteamRun();
});

const strSteamRun = "steamrt";
const numDefaultCurrentSteamRunVersion = 4;

var newestSteamRunTimeURL = "";

var $versionMessage = $("#versionMessage");
var $updateVersionMessage = $("#updateVersionMessage");
var $statusMessage = $("#statusMessage");

var $fileSelected = $("#fileSelected");
var $filePath = $("#filePath");

var $fileVersionDiv = $("#fileVersionDiv");
var $fileVersion = $("#fileVersion");

var $downloadBtn = $("#downloadBtn");
var $checkBtn = $("#checkBtn");
var $loadRunTimeFileBtn = $("#loadRunTimeFileBtn");
var $installRunTimeFileBtn = $("#installRunTimeFileBtn");

var $openRunTimeFileBtn = $("#openRunTimeFileBtn");
var $exitBtn = $("#exitBtn")

var $loaderDiv = $("#loaderDiv");

var $specialModal = $("#specialModal");

var $specialModalText = $("#specialModalText")

function disableInputs(){
  console.log("Disabling Buttons");
  $downloadBtn.prop("disabled",true);
  $checkBtn.prop("disabled",true);
  $loadRunTimeFileBtn.prop("disabled",true);
  $installRunTimeFileBtn.prop("disabled",true);
  $openRunTimeFileBtn.prop("disabled",true);
  $exitBtn.prop("disabled",true);
}

function enableInputs(){
  console.log("Enabling Buttons");
  $downloadBtn.prop("disabled",false);
  $checkBtn.prop("disabled",false);
  $loadRunTimeFileBtn.prop("disabled",false);
  $installRunTimeFileBtn.prop("disabled",false);
  $openRunTimeFileBtn.prop("disabled",false);
  $exitBtn.prop("disabled",false);
}

function hideLoadingWheel(){
  $loaderDiv.addClass("invisible-el");
}

function showLoadingWheel(){
  $loaderDiv.removeClass("invisible-el");
}

function openModal(){
  $specialModal.addClass("modal-open");
  $specialModal.removeClass("modal-close");
}

function closeModal(){
  $specialModal.addClass("modal-close");
  $specialModal.removeClass("modal-open");
}

let modalSpan = document.getElementById("modal-close");

modalSpan.addEventListener('click', () => {
  closeModal();
});

let closeModalBtn = document.getElementById("closeModalBtn");

closeModalBtn.addEventListener('click', () => {
  closeModal();
});

let downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener('click', () => {
  // Here you would add the logic to download the Steam runtime

  resetProgressBar();
  // newestSteamRunTimeURL
  downloadSteamRun();
});

let checkBtn = document.getElementById('checkBtn');

checkBtn.addEventListener('click', () => {
  checkSteamRun();
});

let installRunTimeFileBtn = document.getElementById('installRunTimeFileBtn');

installRunTimeFileBtn.addEventListener('click', async () => {
  
  
  await installSteamRuntime();
});

let openRunTimeFileBtn = document.getElementById('openRunTimeFileBtn');

openRunTimeFileBtn.addEventListener('click', async () => {
  disableInputs();
  openSelectedFile();
  enableInputs();
});


let loadRunTimeFileBtn = document.getElementById('loadRunTimeFileBtn');

loadRunTimeFileBtn.addEventListener('click', async () => {
  disableInputs();
  resetProgressBar();
  await loadTarFileFrontEnd();
  enableInputs();
});


let exitBtn = document.getElementById("exitBtn");

exitBtn.addEventListener('click', (e) => {
  e.preventDefault()
  window.electronAPI.onCloseApp();
});

function resetProgressBar() {
  divFileProgressBar.val(0);
}

function openSelectedFile() {

  if(["", undefined].includes(tarFilePath)){
    //tarFilePath
    var errMessgae = "No file loaded.\nUse the Load Runtime File button to prep the runtime installation."

    //alert(errMessgae);

    $specialModalText.html(errMessgae);
    openModal();
  }
  else{
    window.electronAPI.messageSaveDial(tarFilePath, true);
  }
}

async function installSteamRuntime(){
  resetProgressBar();

  if(["", undefined].includes(tarFilePath)){
    //tarFilePath
    var errMessgae = "No file loaded.\nUse the Load Runtime File button to prep the runtime installation."

    //alert(errMessgae);
    
    $specialModalText.html(errMessgae);
    openModal();

  }
  else{
    console.log("Input Path: " + tarFilePath);

    disableInputs();
    // since we can't count the number of files in the compressed tar file, we have to go with a loading wheel to let the user know that...
    //...the files are being extracted
    showLoadingWheel(); 

    setTimeout( async()=>{
      await window.electronAPI.installRuntime(tarFilePath, localMajorVersion);
    },125)
  }
}

window.electronAPI.onInstallComplete(async (strFileText) => {

  console.log("Install Complete:");
  console.log(strFileText);
  hideLoadingWheel();
  enableInputs();

  var successMessage = "Steam Runtime files installed successfully."
  $specialModalText.html(successMessage);
  openModal();
  
})

async function downloadSteamRun(){
  //console.log(__dirname);

  var saveResult = await window.electronAPI.saveFileDial(newestSteamRunTimeURL);

  console.log(saveResult)
  if (saveResult.canceled == false){
    tarFilePath = saveResult.filePath
    disableInputs();

    $statusMessage.html(`Downloading file: ${tarFilePath}`);
    await window.electronAPI.downloadRuntime(newestSteamRunTimeURL, tarFilePath);
  }

}

async function checkSteamRun(){
  //console.log(__dirname);
  disableInputs();
  await window.electronAPI.checkRuntime();
}

async function getUmuPath(){
  var homePath = await window.electronAPI.getHomeDIR();
  var umuPath = `${homePath}/.local/share/umu/`;
  return umuPath;
}

window.electronAPI.onCheckComplete(async (dataResult) => {
  enableInputs();
  var downloadVersion = "";
  if (dataResult.available == true){
    downloadVersion = dataResult.versionString.toString();
  }
  console.log('Public Release: ', downloadVersion);
  $versionMessage.html(downloadVersion);

  newestSteamRunTimeURL = dataResult.downloadURL;

  console.log(`URL: ${newestSteamRunTimeURL}`);

  var numDownloadVersion = formatPsuedoVersionAsNum(downloadVersion);
  var numLocalVersion = formatPsuedoVersionAsNum(localVersion);

  console.log(`Download: ${numDownloadVersion}`)
  console.log(`Local: ${numLocalVersion}`)

  if (numDownloadVersion > numLocalVersion){
    console.log("Download is Newer")
    $updateVersionMessage.removeClass("invisible-el");
    //$updateVersionMessage.addClass("invisible-el");
    console.log('Element found:', $updateVersionMessage.length);
  }
  else {
    console.log("Local is Newer")
    $updateVersionMessage.addClass("invisible-el");
  }

});

function formatPsuedoVersionAsNum(strVersion){

  var psuedoVerNum = 0;
  var txtVer = "";
  if (!["",undefined].includes(strVersion)){
    txtVer = strVersion.replaceAll(".","")
    console.log(`txtVer: ${txtVer}`)
    if (!isNaN(txtVer)){
      psuedoVerNum = Number(txtVer);
      console.log(`psuedoVerNum: ${psuedoVerNum}`);
    }
  }

  return psuedoVerNum;
}

async function searchSRTFolders(dirPath){
  var resultPath = "";
  if (!["", undefined].includes(dirPath)){
    resultPath = await window.electronAPI.getInstalledRuntime(dirPath);
    console.log(`UMU P: ${resultPath}`)
  }
  return resultPath;
}

async function checkVersion(strFilePath, compressed = false){
  var result = "";
  var verNum = '0'
  if (!["", undefined].includes(strFilePath)){

    verNum = await window.electronAPI.getInstalledRuntimeVersion(strFilePath, compressed);

    console.log(`VerNum: ${verNum}`)
    
  }
  return verNum
}


async function loadTarFileFrontEnd(){
  //var strFileText = "";
  var fileDetails = {fileName: "", fileDir: "", versionNo: ""};
  fileDetails = await window.electronAPI.dialLoadFile();

  console.log('Load File');
  console.log(fileDetails);

  if (!["",undefined].includes(fileDetails.versionNo)){
    $fileVersionDiv.removeClass("invisible-el");

    $fileVersion.html(fileDetails.versionNo);
    $fileSelected.html(fileDetails.fileName);
    $filePath.html(fileDetails.fileDir);

    localVersion = fileDetails.versionNo;

    var verNum1 = fileDetails.versionNo.split(".")[0];

    // setting major version version
    localMajorVersion = verNum1;
    

    tarFilePath = `${fileDetails.fileDir}${fileDetails.fileName}`;
  }
  else{
    $fileVersionDiv.addClass("invisible-el");
    tarFilePath = "";
  }
}

window.electronAPI.onProgress((data) => {
  divFileProgressBar.val(data.progress.toFixed(0))
  console.log(`Downloaded ${data.downloadedBytes} of ${data.totalBytes} (${data.progress.toFixed(2)}%)`);
});

window.electronAPI.onComplete(async (path) => {
  enableInputs();
  console.log('Download finished at:', path);

  var strTempFile = "";

  if (!["",undefined].includes(path)){
    strTempFile = tarFilePath;
    $statusMessage.html(`Downloading finished: ${strTempFile}`);

    var fileResults = await window.electronAPI.messageLoadDial(strTempFile);

    if (fileResults == true){
      loadFileToApp(strTempFile);


      var strVersionNum = $versionMessage.html();
      var verNum1 = strVersionNum.split(".")[0];
      // setting major version version
      localVersion = strVersionNum;

      localMajorVersion = verNum1;
      // load version number here:
      $fileVersion.html(strVersionNum);
      $fileVersionDiv.removeClass("invisible-el");
    }
    else {
      $fileVersionDiv.addClass("invisible-el");
      tarFilePath = "";
      localVersion = "";
      localMajorVersion = "";
    }

    await window.electronAPI.messageSaveDial(strTempFile, false);

  }
});


window.electronAPI.onDecompressComplete(async (strFileText) => {

});

async function loadFileToApp(strTempFile){
    var fileParts = [];
    var strFileName = "";
    var strFilePath = "";
    fileParts = strTempFile.split("/");

    strFileName = fileParts[fileParts.length - 1];

    strFilePath = strTempFile.substring(0, strTempFile.lastIndexOf("/") + 1);
    
    $fileSelected.html(strFileName);
    $filePath.html(strFilePath);
}

window.electronAPI.onError((err) => {
  enableInputs();
  console.error('Download failed:', err);
});




// https://medium.com/@python-javascript-php-html-css/handling-dynamic-file-downloads-in-javascript-via-ajax-7cb7ce81904f

// https://stackoverflow.com/a/48231664