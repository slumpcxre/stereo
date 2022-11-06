/**
 * @name FreeStereo
 * @version 2000
 * @youtube https://www.youtube.com/channel/UCarVONrCvzC3jMYc5fq6-HA
 * @github https://github.com/slumpcxre
 */
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

module.exports = (() => {
    const config = {"main":"index.js","info":{"name":"FreeStereo","authors":[{"name":"By $lump","discord_id":"664823917902299175","github_username":"slumpcxre"}],"authorLink":"https://github.com/slumpcxre","version":"2000","description":"stereo plugin made in 5 mins by slump .gg/mono .","github":"https://github.com/slumpcxre","github_raw":"https://raw.githubusercontent.com/bepvte/bd-addons/main/plugins/StereoSound.plugin.js"},"changelog":[{"title":"Changes","items":["Slump Injected FreeStereo"]}],"defaultConfig":[{"type":"switch","id":"enableToasts","name":"Enable Toasts","note":"Allows the plugin to let you know it is working, and also warn you about voice settings","value":true}]};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
  const { WebpackModules, Patcher, Toasts } = Library;

  return class StereoSound extends Plugin {
    onStart() {
      this.settingsWarning();
      const voiceModule = WebpackModules.getByPrototypes("setSelfDeaf");
      Patcher.after(voiceModule.prototype, "initialize", this.replacement.bind(this));
    }
    settingsWarning() {
      const voiceSettingsStore = WebpackModules.getByProps("getEchoCancellation");
      if (
        voiceSettingsStore.getNoiseSuppression() ||
        voiceSettingsStore.getNoiseCancellation() ||
        voiceSettingsStore.getEchoCancellation()
      ) {
        if (this.settings.enableToasts) {
          Toasts.show(
            "Please disable echo cancellation, noise reduction, and noise suppression for KachcordStereo2",
            { type: "warning", timeout: 5000 }
          );
        }
        // This would not work, noise reduction would be stuck to on
        // const voiceSettings = WebpackModules.getByProps("setNoiseSuppression");
        // 2nd arg is for analytics
        // voiceSettings.setNoiseSuppression(false, {});
        // voiceSettings.setEchoCancellation(false, {});
        // voiceSettings.setNoiseCancellation(false, {});
        return true;
      } else return false;
    }
    replacement(thisObj, _args, ret) {
      const setTransportOptions = thisObj.conn.setTransportOptions;
      thisObj.conn.setTransportOptions = function (obj) {
        if (obj.audioEncoder) {
          obj.audioEncoder.params = {
            stereo: "2",
          };
          obj.audioEncoder.channels = 20;
        }
        if (obj.fec) {
          obj.fec = false;
        }
        setTransportOptions.call(thisObj, obj);
      };
      if (!this.settingsWarning()) {
        if (this.settings.enableToasts) {
          Toasts.info("FREE STEREO INJECTED .GG/MONO");
        }
      }
      return ret;
    }
    onStop() {
      Patcher.unpatchAll();
    }
    getSettingsPanel() {
      const panel = this.buildSettingsPanel();
      return panel.getElement();
    }
  };
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();


/*@end@*/