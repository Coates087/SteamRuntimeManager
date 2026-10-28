<meta name="google-site-verification" content="vq4CEq-9DQ1LWwSCuiW0w79paZ55SpvC_0yHuzYvMSY" />

This project is for downloading, archiving and installing the Steam Runtimes on Linux. You can even install the archived runtimes offline.

![Steam Runtime Manager](./../github_assets/Steam_Runtime_Manager_main.png)

To better understand why I made this program, I recommend checking out this video from YouTuber "Zac of All Tech":

[![Which Distro Is Best For Gaming Without Internet?](./../github_assets/Offline_Gaming_Distr-ZackOfAllTech.jpg)](https://www.youtube.com/watch?v=8eLNA2-8fs0)

https://www.youtube.com/watch?v=8eLNA2-8fs0

# Why do we need the Steam Runtimes?

In order to play Windows games on Linux, we need to use a runner, such as [Steam Proton](https://github.com/ValveSoftware/Proton), or [Proton GE](https://github.com/GloriousEggroll/proton-ge-custom). This readme will assume that you want to use Proton GE. Certain versions of Proton GE require a certain major version of Steam Runtime. Newer versions &#40;as of 2026&#41; of Prtono GE will require [Steam Runtime V4](https://repo.steampowered.com/steamrt4/images/).

If you are a fan of **Fairy Fencer F Advent Dark Force** like me, you want to specifically use [Proton GE 9-11](https://github.com/GloriousEggroll/proton-ge-custom/releases/tag/GE-Proton9-11), as that version makes the game more playable than playing it on Windows. See [here](https://youtu.be/M1Ou_R1Qr_Y?si=l1XLvOJGlDO9D2BQ) for an extended look at the game with Proton GE 9-11. 

![Fairy Fencer F Advent Dark Force on Linux](./../github_assets/Fairy_Fencer_F_on_Linux.png)

See here for how to make the game playable on [GOG](https://youtu.be/5HwC8cMpVfM?si=CbS1xuz1oVCIwtyz) and [Steam](https://youtu.be/uoPcn9JgrjY?si=YKolwtUoGd7_448h). Proton GE 9-11 requires [Steam Runtime V3 &#40;Sniper&#41;](https://repo.steampowered.com/steamrt3/images/).


# How to use the Steam Runtime Manager

After you download the appImage file assets portion of this link [here](https://github.com/Coates087/SteamRuntimeManager/releases) and you start up the app, you will get screen:

![Steam Runtime Manager](./../github_assets/Steam-Runtime-Manager_check_runtimes.png)

Unless you are offline, the app will immediately check for Runtime updates from Steam's repo. You can see the repo [here](https://repo.steampowered.com/).

Currently, these are the links you would care about for looking at the major version of the Steam Runtime for Linux:
- [Steam Runtime V1 &#40;Scout&#41;](https://repo.steampowered.com/steamrt1/images/)
- [Steam Runtime V2 &#40;Soldier&#41;](https://repo.steampowered.com/steamrt2/images/)
- [Steam Runtime V3 &#40;Sniper&#41;](https://repo.steampowered.com/steamrt3/images/)
- [Steam Runtime V4](https://repo.steampowered.com/steamrt4/images/)

After checking for the latest runtimes, you can click on the the **Runtime Selected** dropdown to select the Steam Runtime you want to download.

![Select Runtime](./../github_assets/Steam-Runtime-Manager_select_runtime.png)

For now, we'll select **Runtime V 4**.

To download the selected runtime, click on the **Download Runtime** button.

![Download Runtime](./../github_assets/Steam-Runtime-Manager_download_runtime.png)

It will then bring up a save file dialog box.

![Saving Runtime](./../github_assets/Steam-Runtime-Manager_saving_runtime.png)

After you chose a destination for your runtime file, the file will start downloading.

![Downloading Runtime](./../github_assets/Steam-Runtime-Manager_downloading_runtime.png)

Once that is done, the Manager will ask you if you want to load the file into the Steam Runtime Manager. This will be necessary to install the runtime later.

![Load Runtime](./../github_assets/Steam-Runtime-Manager_downloading_runtime_message_load.png)

After that, it will ask you if you want to open the directory of where you saved your runtime file as a tarball file &#40;tar.xz&#41;. This is just for if you want to locate the file.

![Load Runtime Directory](./../github_assets/Steam-Runtime-Manager_downloading_runtime_load_location.png)

You can also click on the **Open Runtime File Dir** to open the directory for the downloaded file.

![Load Runtime Directory Button](./../github_assets/Steam-Runtime-Manager_downloading_runtime_load_location_button.png)

If you wanted to load the Steam Runtime file that you previous downloaded, just click on the **Load Runtime File** button.

![Load Runtime File Button](./../github_assets/Steam-Runtime-Manager_load_runtime.png)

It will bring up the following dialog box:

![Load Runtime File Dialog](./../github_assets/Steam-Runtime-Manager_load_runtime_dialog.png)

After we're done loading the Steam Runtime file, click on the **Install Runtime File** button

![Load Runtime File Dialog](./../github_assets/Steam-Runtime-Manager_install_runtime.png)

We'll see a loading indicator, letting us know that the runtime is being installed. Note that installation will take a while and requires about 1 GB of storage.

![Steam Runtime Installing](./../github_assets/Steam-Runtime-Manager_installing.png)

When it is done installing, we'll get the following message below:

![Steam Runtime Install Finish](./../github_assets/Steam-Runtime-Manager_install_finished.png)

Now you will be able to play your Windows games on Linux via [Heroic Games Launcher](https://heroicgameslauncher.com) or [Lutris](https://lutris.net), when using Proton GE, without an internet connection &#40;in order to download the Steam Runtime files&#41;.

The Steam Runtime files install in the directory below:

> ~/.local/share/umu

Unlike with the **Check Latest Runtime** and **Download Runtime** buttons, The **Load Runtime File** and the **Install Runtime File** buttons do not require an internet connection &#40;since that's kind of the point of this app&#41;.
