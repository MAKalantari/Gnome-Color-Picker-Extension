import Gio from "gi://Gio";
import GObject from "gi://GObject";
import St from "gi://St";
import Meta from "gi://Meta";
import Shell from "gi://Shell";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Util from "resource:///org/gnome/shell/misc/util.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";

function runScript(scriptPath) {
  // Quiet, no terminal, no output
  let proc = new Gio.Subprocess({
    argv: [scriptPath],
    flags: Gio.SubprocessFlags.NONE, // or STDOUT/STDERR silence below
  });

  // If you want to silence output completely:
  // let proc = new Gio.Subprocess({
  //     argv: [scriptPath],
  //     flags: Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE,
  // });

  proc.init(null);
  proc.wait_async(null, null);
}

export default class ColorPickerExtension extends Extension {
  enable() {
    this._indicator = new ColorPickerIndicator();
    Main.panel.addToStatusArea("Color Picker", this._indicator);
    this._settings = this.getSettings(
      "org.gnome.shell.extensions.color-picker@gnome",
    );
    Main.wm.addKeybinding(
      "color-picker-bind",
      this._settings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
      () => {
        // Action to perform when shortcut is pressed
        let path =
          Extension.lookupByUUID("color-picker@gnome").path +
          "/scripts/main.py";
        runScript(path);
        //Util.spawn(["gnome-terminal", "--", "bash", "-c", path, "; exec bash"]);
      },
    );
  }

  disable() {
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
    Main.wm.removeKeybinding("color-picker-bind");
    this._settings = null;
  }
}

const ColorPickerIndicator = GObject.registerClass(
  class ColorPickerIndicator extends PanelMenu.Button {
    _init() {
      super._init(0.5, "ColorPickerIndicator");

      let icon = new St.Icon({
        gicon: Gio.icon_new_for_string("color-select-symbolic"),
        style_class: "system-status-icon",
      });

      this.add_child(icon);
      this.connect("button-press-event", () => this._runColorPicker());
    }

    _getExtensionPath() {
      return Extension.lookupByUUID("color-picker@gnome").path;
    }

    _runColorPicker() {
      let path = this._getExtensionPath() + "/scripts/main.py";
      // Util.spawn(["gnome-terminal", "--", "bash", "-c", path, "; exec bash"]);
      runScript(path);
    }
  },
);
