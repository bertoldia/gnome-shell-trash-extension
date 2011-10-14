const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Gettext = imports.gettext;
const _ = Gettext.gettext;

const MYPLACES_ICON_SIZE = 24;

function PopupMenuItem() {
    this._init.apply(this, arguments);
}

PopupMenuItem.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function(text, icon, params) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this, params);
        this.icon = new St.Icon({ icon_name: icon,
                                  icon_type: St.IconType.FULLCOLOR,
                                  style_class: 'system-status-icon' });
        this.addActor(this.icon);
        this.label = new St.Label({ text: text });
        this.addActor(this.label);
    }
};

function TrashButton() {
    this._init();
}

TrashButton.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0);

        this.trash_path = 'trash:///';

        this.trash_file = Gio.file_new_for_uri(this.trash_path);

        //this.trash_empty_icon = new St.Icon({ icon_name: 'trashcan_empty',
                                              //icon_type: St.IconType.FULLCOLOR,
                                              //style_class: 'system-status-icon' });
        this.trash_full_icon = new St.Icon({ icon_name: 'trashcan_full',
                                             icon_type: St.IconType.FULLCOLOR,
                                             style_class: 'system-status-icon' });
        this.actor.set_child(this.trash_full_icon);

        this.empty_item = new PopupMenuItem(_('Empty Trash'), Gtk.STOCK_REMOVE);
        this.empty_item.connect('activate', Lang.bind(this, this._emptyTrash));
        this.menu.addMenuItem(this.empty_item);

        this.open_item = new PopupMenuItem(_('Open Trash'), Gtk.STOCK_OPEN);
        this.open_item.connect('activate', Lang.bind(this, this._openTrash));
        this.menu.addMenuItem(this.open_item);

        let children = Main.panel._rightBox.get_children();
        Main.panel._rightBox.insert_actor(this.actor, children.length - 1);
        Main.panel._menus.addMenu(this.menu);

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
          //this.actor.set_child(this.trash_empty_icon);
          this.actor.hide();
      } else {
          //this.actor.set_child(this.trash_full_icon);
          this.actor.show();
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

function main(extensionMeta) {
    let userExtensionLocalePath = extensionMeta.localedir;
    Gettext.bindtextdomain('trash_button', userExtensionLocalePath);
    Gettext.textdomain('trash_button');
    new TrashButton();
}
