CREATE TABLE users
(
    password TEXT NOT NULL,
    username TEXT NOT NULL,
    token TEXT,
    CONSTRAINT username PRIMARY KEY (username)
);
CREATE TABLE files
(
    id TEXT NOT NULL,
    owner TEXT NOT NULL,
    extension TEXT,
    created integer NOT NULL DEFAULT (strftime('%s','now')),
    CONSTRAINT files_pkey PRIMARY KEY (id),
    CONSTRAINT fk_owner FOREIGN KEY (owner)
        REFERENCES users (username) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
CREATE TABLE links
(
    id TEXT NOT NULL,
    url TEXT NOT NULL,
    owner TEXT NOT NULL,
    created integer NOT NULL DEFAULT (strftime('%s','now')),
    CONSTRAINT main PRIMARY KEY (id),
    CONSTRAINT owner_check FOREIGN KEY (owner)
        REFERENCES users (username) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);


