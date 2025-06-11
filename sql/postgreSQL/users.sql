-- CREATE TABLE public.users (
-- 	id serial,
-- 	firstname varchar(32) NULL,
-- 	lastname varchar(32) NULL,
-- 	username varchar(16) NOT NULL,
-- 	about text NULL,
-- 	dateregistered timestamp NOT NULL DEFAULT now(),
-- 	"password" varchar(32) NULL,
-- 	passwordsalt varchar(16) NULL,
-- 	email varchar(64) NOT NULL,
-- 	avatarurl varchar(64) NULL,
--   role text, 
-- 	CONSTRAINT users_email_key UNIQUE (email),
-- 	CONSTRAINT users_pkey PRIMARY KEY (id),
-- 	CONSTRAINT users_username_key UNIQUE (username)
-- );

-- Alter TABLE users 
-- ALTER COLUMN password TYPE	  varchar(64) ,
-- ALTER COLUMN passwordsalt TYPE	  varchar(32);

-- -- hashpwd:  $2b$10$P6.X99yS6MiqvfZaEjs70.rEI8279Gh1ik20QmSP8gohCe7ZcqM.m  123456
-- --           $2b$10$NpW4mE8akQzX9EBrj8l17O8YvJxu31op3VOSmxcuzE2zYiS1unusG  6003cem
-- -- avataurl: http://localhost:10888/api/v1/images/b965cb9e-f3d0-4f21-90c5-e05a07ca6a7d
-- -- 		  http://localhost:10888/api/v1/images/41cfeca7-790c-4736-8998-2aef04d69abf
-- -- 		  http://localhost:10888/api/v1/images/276600ef-d91e-4c12-bdaf-bc7b9a7ac6f3 

-- INSERT INTO users (username, email, password, role) VALUES
-- 	('alice', 'alice@example.com', '123456', 'admin'),
-- 	('bob', 'bob@example.com','123456', 'user'),
-- 	('colin', 'colin@example.com','123456', 'user'),
-- 	('cycheng', 'cycheng@example.com','654321', 'admin');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL,
  avatarurl VARCHAR(255),
  signupcode VARCHAR(255)
);
