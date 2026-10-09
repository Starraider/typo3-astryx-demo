CREATE TABLE pages (
    tx_astryx_theme varchar(20) DEFAULT '' NOT NULL,
    tx_astryx_mode varchar(20) DEFAULT '' NOT NULL
);

-- Keep identity and relation columns available even before generated TCA is cached.
-- A partial table without uid cannot be repaired by separate ADD column/key queries.
CREATE TABLE tx_astryx_list_item (
    uid int(11) unsigned NOT NULL auto_increment,
    foreign_table_parent_uid int(11) unsigned DEFAULT '0' NOT NULL,
    PRIMARY KEY (uid)
);
CREATE TABLE tx_astryx_table_item (
    uid int(11) unsigned NOT NULL auto_increment,
    foreign_table_parent_uid int(11) unsigned DEFAULT '0' NOT NULL,
    PRIMARY KEY (uid)
);
CREATE TABLE tx_astryx_table_cell (
    uid int(11) unsigned NOT NULL auto_increment,
    foreign_table_parent_uid int(11) unsigned DEFAULT '0' NOT NULL,
    PRIMARY KEY (uid)
);
CREATE TABLE tx_astryx_card_grid_item (
    uid int(11) unsigned NOT NULL auto_increment,
    foreign_table_parent_uid int(11) unsigned DEFAULT '0' NOT NULL,
    PRIMARY KEY (uid)
);
CREATE TABLE tx_astryx_accordion_item (
    uid int(11) unsigned NOT NULL auto_increment,
    foreign_table_parent_uid int(11) unsigned DEFAULT '0' NOT NULL,
    PRIMARY KEY (uid)
);
CREATE TABLE tx_astryx_carousel_item (
    uid int(11) unsigned NOT NULL auto_increment,
    foreign_table_parent_uid int(11) unsigned DEFAULT '0' NOT NULL,
    PRIMARY KEY (uid)
);
CREATE TABLE tx_astryx_classic_gallery_item (
    uid int(11) unsigned NOT NULL auto_increment,
    foreign_table_parent_uid int(11) unsigned DEFAULT '0' NOT NULL,
    PRIMARY KEY (uid)
);
