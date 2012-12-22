CREATE TABLE users (
    userid serial NOT NULL,
    username character varying(50) NOT NULL,
    "password" character varying(128) NOT NULL,
    "salt" character varying(172) NOT NULL,
    email character varying(50) NOT NULL
);

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);

CREATE TABLE comments (
    commentid serial NOT NULL,
    userid integer,
    comment character varying(256) NOT NULL,
    addedat character varying(20) NOT NULL
);

ALTER TABLE ONLY comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (commentid);

ALTER TABLE ONLY comments
    ADD CONSTRAINT fk_userid FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE SET NULL;

CREATE TABLE followers (
    followerid serial NOT NULL,
    userid integer
);

ALTER TABLE ONLY followers
    ADD CONSTRAINT followers_pkey PRIMARY KEY (followerid,userid);

ALTER TABLE ONLY followers
    ADD CONSTRAINT fk_userid FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE SET NULL;