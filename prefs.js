/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */

/* most of the code is borrowed from
 * > js/ui/altTab.js <
 * of the gnome-shell source code
 */

const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;
const N_ = function(e) { return e };

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const SETTINGS_SHOWFILES_KEY = 'showfiles';

const TrashSettingsWidget = new GObject.Class({
    Name: 'Trash.Prefs.TrashSettingsWidget',
    GTypeName: 'TrashSettingsWidget',
    Extends: Gtk.Grid,

    _init : function(params) {
        this.parent(params);
        this.column_spacing = 10;
        this.margin = 10;

        this._settings = Convenience.getSettings();

        let introLabel = _("You can switch the behaviour of the Trash applet here.");

        this.attach(new Gtk.Label({ label: introLabel, wrap: true, sensitive: true,
                                    margin_bottom: 10, margin_top: 5 }),
                    0, 0, 2, 1);


        let top = 1;
        let key = SETTINGS_SHOWFILES_KEY;
        let label = _("Show files");
        
        let extra = new Gtk.CheckButton({ label: label });
        this._settings.bind(key, extra, 'active', Gio.SettingsBindFlags.DEFAULT);

        this.attach(extra, 0, top, 1, 1);                            

        let description = _("Show the files stored in the trash in popup menu.\nYou need to restart the Shell to take this in effect.");
        let descriptionLabel = new Gtk.Label({ label: description, wrap: true, sensitive: true,
                                           xalign: 0.0, justify: Gtk.Justification.FILL });
        this.attach(descriptionLabel, 1, top, 1, 1);

    },


});

function init() {
    Convenience.initTranslations();
}

function buildPrefsWidget() {
    let widget = new TrashSettingsWidget();
    widget.show_all();

    return widget;
}
