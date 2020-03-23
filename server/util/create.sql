CREATE TABLE public.users
(
    password character varying(50) COLLATE pg_catalog."default" NOT NULL,
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    token character varying(50)[] COLLATE pg_catalog."default",
    CONSTRAINT username PRIMARY KEY (username)
);
CREATE TABLE files
(
    id character varying(6) COLLATE pg_catalog."default" NOT NULL,
    owner character varying(50) COLLATE pg_catalog."default" NOT NULL,
    extension character varying(10) COLLATE pg_catalog."default",
    created timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT files_pkey PRIMARY KEY (id),
    CONSTRAINT "Owner" FOREIGN KEY (owner)
        REFERENCES public.users (username) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
CREATE TABLE links
(
    id character varying(6) COLLATE pg_catalog."default" NOT NULL,
    url character varying(100) COLLATE pg_catalog."default" NOT NULL,
    owner character varying(50) COLLATE pg_catalog."default" NOT NULL,
    created timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT main PRIMARY KEY (id),
    CONSTRAINT owner_check FOREIGN KEY (id)
        REFERENCES public.users (username) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);


