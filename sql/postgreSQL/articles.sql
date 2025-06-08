CREATE TABLE public.articles (
	id serial,
	title varchar(32) NOT NULL,
	alltext text NOT NULL,
	summary text NULL,
	datecreated timestamp NOT NULL DEFAULT now(),
	datemodified timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	imageurl varchar(2048) NULL,
	published bool NULL,
	authorid int4 NULL,
	description text NULL,
	CONSTRAINT articles_pkey PRIMARY KEY (id),
  CONSTRAINT fk_articles FOREIGN KEY (authorid) REFERENCES users (id)
);


INSERT INTO articles (title, alltext, imageurl, authorid, description) VALUES
	('Galaxy V', 'some stuff','http://localhost:10888/api/v1/images/2acd3785-05c9-4bbf-92b6-968aa49cc3a3',	 1,'The selection process was fair for the Panel of Judges led by  Ir CY CHENG in view of Hotel popularity in Hong Kong.'),
	('Great Empire', 'interesting','http://localhost:10888/api/v1/images/4cc13a0c-d8ab-4cb6-9889-aaf60dfdeec8',	 4,'The selection process was fair for the Panel of Judges led by r Ir CY CHENG in view of Hotel popularity in Japan.'),
	('Galaxy VII', 'ok','http://localhost:10888/api/v1/images/3113f948-c1a1-40a8-b83f-23bdc4735b2a',	 1,'The selection process was fair for the Panel of Judges led by  Ir CY CHENG in view of Hotel popularity in Macau.' ),
	('Holiday Inn', 'some text', 'http://localhost:10888/api/v1/images/2580aebf-1a2a-495a-9dff-8b6168deafe0	',	4,'The selection process was fair for the Panel of Judges led by  Ir CY CHENG in view of Hotel popularity in PRC.'),
	('Great Empire', 'some text', 'http://localhost:10888/api/v1/images/de93257a-f45d-469d-979c-9b1c5eee61a1	',	4,'The selection process was fair for the Panel of Judges led by  Ir CY CHENG in view of Hotel popularity in PRC.'),
	('New Island', 'some text', 'http://localhost:10888/api/v1/images/b9b3848d-8370-4dc0-a3de-f3a6531ffcc2	',	4,'The selection process was fair for the Panel of Judges led by  Ir CY CHENG in view of Hotel popularity in PRC.');


INSERT INTO articles (title, alltext,   authorid, description) VALUES
	('title 1', 'some stuff',	 1,'The selection process was fair for the Panel of Judges led by Ir CY CHENG in view of Hotel popularity.'),
	('another title', 'interesting',	 4,'The selection process was fair for the Panel of Judges led by  Ir CY CHENG in view of Hotel popularity.'),
	('last one', 'ok',	 1,'The selection process was fair for the Panel of Judges led by  Ir CY CHENG in view of Hotel popularity.' ),
	('this title is good', 'some text', 	4,'The selection process was fair for the Panel of Judges led by Ir CY CHENG in view of Hotel popularity.');
