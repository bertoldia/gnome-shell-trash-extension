/*
 * Copyright 2011 Axel von Bertoldi
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 2 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to:
 * The Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor
 * Boston, MA 02110-1301, USA.
 */

const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

function PopupMenuItem(label, icon, callback) {
    this._init(label, icon, callback);
}

PopupMenuItem.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function(text, icon, callback) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this);

        this.icon = new St.Icon({ icon_name: icon,
                                  icon_type: St.IconType.FULLCOLOR,
                                  style_class: 'popup-menu-icon' });
        this.addActor(this.icon);
        this.label = new St.Label({ text: text });
        this.addActor(this.label);

        this.connect('activate', callback);
    }
};

function TrashButton() {
    this._init();
}

TrashButton.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,

    _init: function() {
        PanelMenu.SystemStatusButton.prototype._init.call(this, 'user-trash');

        this.trash_path = 'trash:///';
        this.trash_file = Gio.file_new_for_uri(this.trash_path);

        this.empty_item = new PopupMenuItem(_('Empty Trash'),
                                            Gtk.STOCK_REMOVE,
                                            Lang.bind(this, this._emptyTrash));
        this.menu.addMenuItem(this.empty_item);

        this.open_item = new PopupMenuItem(_('Open Trash'),
                                           Gtk.STOCK_OPEN,
                                           Lang.bind(this, this._openTrash));
        this.menu.addMenuItem(this.open_item);

        this._onTrashChange();
        this._setupWatch();
    },

    _openTrash: function() {
        Gio.app_info_launch_default_for_uri(this.trash_path, null);
    },

    _setupWatch: function() {
        this.monitor = this.trash_file.monitor_directory(0, null, null);
        this.monitor.connect('changed', Lang.bind(this, this._onTrashChange));
    },

    _onTrashChange: function() {
      let children = this.trash_file.enumerate_children('*', 0, null, null);
      if (children.next_file(null, null) == null) {
          this.actor.visible = false;
      } else {
          this.actor.show();
          this.actor.visible = true;
      }
    },

    _emptyTrash: function() {
      let children = this.trash_file.enumerate_children('*', 0, null, null);
      let child_info = null;
      while ((child_info = children.next_file(null, null)) != null) {
        let child = this.trash_file.get_child(child_info.get_name());
        child.delete(null);
      }
    }
};

function init(metadata) {
  imports.gettext.bindtextdomain('gnome-shell-extensions', metadata.localedir);
}

let _indicator;

function enable() {
  _indicator = new TrashButton;
  Main.panel.addToStatusArea('trash_button', _indicator);
}

function disable() {
  _indicator.destroy();
}
