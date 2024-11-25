drop table recordlabel cascade constraints;
drop table employsemployee1 cascade constraints;
drop table employsemployee2 cascade constraints; 
drop table employsemployee3 cascade constraints;
drop table writescontract1 cascade constraints;
drop table writescontract2 cascade constraints;
drop table artistsigns1 cascade constraints;
drop table artistsigns2 cascade constraints;
drop table collaborateswith cascade constraints;
drop table attends cascade constraints;
drop table musicprofessional cascade constraints;
drop table writer cascade constraints;
drop table producer cascade constraints;
drop table album cascade constraints;
drop table song cascade constraints;
drop table writes cascade constraints;
drop table studio cascade constraints;
drop table single cascade constraints;
drop table albumtrack cascade constraints;
drop table awardshow cascade constraints;
drop table performsat cascade constraints;
drop table concert1 cascade constraints;
drop table concert2 cascade constraints;
drop table issueticket1 cascade constraints;
drop table issueticket2 cascade constraints;

CREATE TABLE RecordLabel(
	labelName		VARCHAR2(50) 	PRIMARY KEY,
	yearEstablished	INT		
);



CREATE TABLE EmploysEmployee1(
role 			VARCHAR2(50) 	PRIMARY KEY,
dept			VARCHAR2(50) 	NOT NULL
);

CREATE TABLE EmploysEmployee2(
hireDate 		DATE		PRIMARY KEY,
salary			INT		NOT NULL
);

CREATE TABLE EmploysEmployee3(
employeeID 		VARCHAR2(50) 	PRIMARY KEY,
employeeName	VARCHAR2(50) 	NOT NULL,
SIN			VARCHAR2(50) 	UNIQUE NOT NULL,
hireDate		DATE		NOT NULL,
labelName		VARCHAR2(50) 	NOT NULL,
role			VARCHAR2(50) 	NOT NULL,
FOREIGN KEY (labelName) REFERENCES RecordLabel(labelName) ON DELETE CASCADE,
FOREIGN KEY (hireDate) REFERENCES EmploysEmployee2 (hireDate),
FOREIGN KEY (role) REFERENCES EmploysEmployee1 (role)
);


CREATE TABLE WritesContract1(
	type 			VARCHAR2(50) 	PRIMARY KEY,
	compensation		INT		NOT NULL
);



CREATE TABLE AwardShow(
	showVenue		VARCHAR2(50) ,	
	showDate 		DATE,		
	showName		VARCHAR2(50) ,
	organizer		VARCHAR2(50) ,	
	PRIMARY KEY (showName, showDate)
);


CREATE TABLE ArtistSigns1(
	legalName 		VARCHAR2(50) 	PRIMARY KEY,
	dateOfBirth		DATE		NOT NULL	
);

CREATE TABLE ArtistSigns2(
	stageName 		VARCHAR2(50) 	PRIMARY KEY,
	legalName 		VARCHAR2(50) 	NOT NULL,
	FOREIGN KEY (legalName) REFERENCES ArtistSigns1 (legalName)
);

CREATE TABLE WritesContract2(
	contractID		VARCHAR2(50) 	PRIMARY KEY,
	type			VARCHAR2(50) 	NOT NULL,
	stageName		VARCHAR2(50) 	UNIQUE NOT NULL,
	labelName		VARCHAR2(50) 	NOT NULL,
	startDate 		DATE		NOT NULL,
	endDate			DATE,		
	FOREIGN KEY (labelName) REFERENCES RecordLabel(labelName) ON DELETE CASCADE,
	FOREIGN KEY (stageName) REFERENCES ArtistSigns2(stageName),
	FOREIGN KEY (type) REFERENCES WritesContract1 (type) ON DELETE CASCADE
);

CREATE TABLE MusicProfessional(
	professionalName	VARCHAR2(50) 	PRIMARY KEY,
	yearsOfExp		INT
);


CREATE TABLE CollaboratesWith(
	professionalName	VARCHAR2(50) ,	
	stageName		VARCHAR2(50) ,			
	PRIMARY KEY (professionalName, stageName),
	FOREIGN KEY (professionalName) REFERENCES MusicProfessional(professionalName),
	FOREIGN KEY (stageName) REFERENCES ArtistSigns2(stageName)
);

CREATE TABLE Studio(
	studioName		VARCHAR2(50) ,
	location		VARCHAR2(50) ,
	studioSize		VARCHAR2(50) ,
	PRIMARY KEY (studioName, location)
);



CREATE TABLE Attends (
	showName		VARCHAR2(50) ,
	showDate		DATE,
	stageName		VARCHAR2(50) ,
	numNominations	INT,
	awardsWon		INT,
	PRIMARY KEY (showName, showDate, stageName),
	FOREIGN KEY (stageName) REFERENCES ArtistSigns2(stageName),
	FOREIGN KEY (showName, showDate) REFERENCES AwardShow (showName, showDate) 
);



CREATE TABLE Writer(
professionalName	VARCHAR2(50) 	PRIMARY KEY,
numOfSongs		INT,
FOREIGN KEY (professionalName) REFERENCES MusicProfessional(professionalName)
);

CREATE TABLE Producer(
	professionalName	VARCHAR2(50) 	PRIMARY KEY,
	productionStyle	VARCHAR2(50) ,
	FOREIGN KEY (professionalName) REFERENCES MusicProfessional(professionalName)
);

CREATE TABLE Album(
	UPC			INT		PRIMARY KEY,
	professionalName	VARCHAR2(50) ,	
	stageName		VARCHAR2(50) 	NOT NULL,	
	title			VARCHAR2(50) 	NOT NULL,
	numTracks		INT		NOT NULL,
	length			VARCHAR2(50) 	NOT NULL,
	releaseDate		DATE		NOT NULL,
	copiesSold		INT,		
	FOREIGN KEY (professionalName) REFERENCES Producer(professionalName) ON DELETE SET NULL,
	FOREIGN KEY (stageName) REFERENCES ArtistSigns2(stageName) ON DELETE CASCADE,
	UNIQUE (stageName, title) 
);

CREATE TABLE Song(
	ISRC			VARCHAR2(50) 	PRIMARY KEY,
	title			VARCHAR2(50) 	NOT NULL,
	releaseDate		DATE		NOT NULL,
	genre			VARCHAR2(50) 	NOT NULL,
	duration		VARCHAR2(50) 	NOT NULL,
	stageName		VARCHAR2(50) 	NOT NULL,
	recordingDate		DATE		NOT NULL,
	studioName		VARCHAR2(50)  	NOT NULL,	
	location		VARCHAR2(50) 	NOT NULL,
	UPC			INT,
	FOREIGN KEY (stageName) REFERENCES ArtistSigns2(stageName) ON DELETE CASCADE,
	FOREIGN KEY (studioName, location) REFERENCES Studio(studioName, location) ON DELETE CASCADE, 
	FOREIGN KEY (UPC) REFERENCES Album(UPC) ON DELETE CASCADE,
	UNIQUE (stageName, title)
);



CREATE TABLE Writes(
	professionalName	VARCHAR2(50) ,
	ISRC			VARCHAR2(50) 	NOT NULL,
	PRIMARY KEY (professionalName, ISRC),
	FOREIGN KEY (professionalName) REFERENCES Writer(professionalName),
	FOREIGN KEY (ISRC) REFERENCES Song(ISRC)
	);




CREATE TABLE Single(
	ISRC			VARCHAR2(50) 	PRIMARY KEY,
	unitsSold		INT,
FOREIGN KEY (ISRC) REFERENCES Song(ISRC)
);


CREATE TABLE AlbumTrack(
	ISRC			VARCHAR2(50) 	PRIMARY KEY,
	TrackNo		INT,
	FOREIGN KEY (ISRC) REFERENCES Song(ISRC)
);


CREATE TABLE Concert1(
	concertVenue		VARCHAR2(50) PRIMARY KEY,
	capacity		INT
);

CREATE TABLE Concert2(
	concertVenue		VARCHAR2(50) ,
	concertDate		DATE,
	ticketsSold		INT,
	PRIMARY KEY (concertVenue, concertDate)
);

CREATE TABLE PerformsAt(
	stageName		VARCHAR2(50) ,
	concertDate		DATE ,
	concertVenue		VARCHAR2(50) ,
	PRIMARY KEY (concertDate, concertVenue, stageName),
	FOREIGN KEY (concertDate, concertVenue) REFERENCES Concert2(concertDate, concertVenue),
	FOREIGN KEY (stageName) REFERENCES ArtistSigns2(stageName)
);

CREATE TABLE IssueTicket2(
	ticketID		VARCHAR2(50) 	 PRIMARY KEY,
	seatNum		VARCHAR2(50) ,
	price			INT
);


CREATE TABLE IssueTicket1(
	concertVenue 	VARCHAR2(50) ,
	concertDate		DATE,
	ticketID		VARCHAR2(50) ,
	PRIMARY KEY (concertVenue, concertDate, ticketID),
	FOREIGN KEY (concertVenue, concertDate) REFERENCES Concert2(concertVenue, concertDate) ON DELETE CASCADE,
	FOREIGN KEY (ticketID) REFERENCES IssueTicket2 (ticketID)
);


INSERT INTO RecordLabel VALUES ('Sony Music', 1987);
INSERT INTO RecordLabel VALUES ('Warner Bros', 1958);
INSERT INTO RecordLabel VALUES ('Universal Music', 1934);
INSERT INTO RecordLabel VALUES ('Atlantic Records', 1947);
INSERT INTO RecordLabel VALUES ('Capitol Records', 1942);
INSERT INTO RecordLabel VALUES ('Republic Records', 1995);
INSERT INTO RecordLabel VALUES ('Interscope Records', 1990);
INSERT INTO RecordLabel VALUES ('Top Dawg Entertainment', 2004);
INSERT INTO RecordLabel VALUES ('Hollywood Records', 1989);

INSERT INTO EmploysEmployee1 VALUES ('Manager', 'HR');
INSERT INTO EmploysEmployee1 VALUES ('Producer', 'Production');
INSERT INTO EmploysEmployee1 VALUES ('Engineer', 'Studio');
INSERT INTO EmploysEmployee1 VALUES ('Marketing Head', 'Marketing');
INSERT INTO EmploysEmployee1 VALUES ('Artist Manager', 'Talent Management');
INSERT INTO EmploysEmployee1 VALUES ('Legal Advisor', 'Legal');
INSERT INTO EmploysEmployee1 VALUES ('Audio Engineer', 'Production');
INSERT INTO EmploysEmployee1 VALUES ('Financial Analyst', 'Finance');
INSERT INTO EmploysEmployee1 VALUES ('Sound Designer', 'Studio');
INSERT INTO EmploysEmployee1 VALUES ('HR Manager', 'HR');
INSERT INTO EmploysEmployee1 VALUES ('Marketing Specialist', 'Marketing');
INSERT INTO EmploysEmployee1 VALUES ('Sales Manager', 'Sales');
INSERT INTO EmploysEmployee1 VALUES ('Social Media Manager', 'Marketing');

INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2021-06-12', 'YYYY-MM-DD'), 55000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2019-05-30', 'YYYY-MM-DD'), 72000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2020-11-21', 'YYYY-MM-DD'), 60000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2018-08-13', 'YYYY-MM-DD'), 95000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2022-03-22', 'YYYY-MM-DD'), 47000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2017-04-15', 'YYYY-MM-DD'), 88000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2020-10-05', 'YYYY-MM-DD'), 67000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2021-02-12', 'YYYY-MM-DD'), 72000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2019-12-01', 'YYYY-MM-DD'), 85000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2020-09-14', 'YYYY-MM-DD'), 64000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2022-01-07', 'YYYY-MM-DD'), 56000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2018-11-23', 'YYYY-MM-DD'), 78000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2021-05-02', 'YYYY-MM-DD'), 82000);
INSERT INTO EmploysEmployee2 VALUES (TO_DATE('2022-06-18', 'YYYY-MM-DD'), 60000);


INSERT INTO Concert1 VALUES ('Lumen Field', 72000);
INSERT INTO Concert1 VALUES ('Staples Center', 18000);
INSERT INTO Concert1 VALUES ('Hyde Park', 65000);
INSERT INTO Concert1 VALUES ('Dodgers Stadium', 70000);
INSERT INTO Concert1 VALUES ('Little Caesars Arena', 20000);
INSERT INTO Concert1 VALUES ('Pacific Coliseum', 17713);
INSERT INTO Concert1 VALUES ('United Center', 19000);

INSERT INTO Concert2 VALUES ('Lumen Field', TO_DATE('2023-07-22', 'YYYY-MM-DD'), 71500);
INSERT INTO Concert2 VALUES ('Staples Center', TO_DATE('2019-05-06', 'YYYY-MM-DD'), 17500);
INSERT INTO Concert2 VALUES ('Hyde Park', TO_DATE('2018-07-14', 'YYYY-MM-DD'), 64000);
INSERT INTO Concert2 VALUES ('Dodgers Stadium', TO_DATE('2022-09-10', 'YYYY-MM-DD'), 65000);
INSERT INTO Concert2 VALUES ('Little Caesars Arena', TO_DATE('2022-03-12', 'YYYY-MM-DD'), 19500);
INSERT INTO Concert2 VALUES ('Pacific Coliseum', TO_DATE('2024-11-04', 'YYYY-MM-DD'), 15500);
INSERT INTO Concert2 VALUES ('United Center', TO_DATE('2023-07-05', 'YYYY-MM-DD'), 18000);

INSERT INTO EmploysEmployee3 VALUES ('E123', 'Harry Potter', '111-223-333', TO_DATE('2021-06-12', 'YYYY-MM-DD'), 'Sony Music', 'Manager');
INSERT INTO EmploysEmployee3 VALUES ('E124', 'Hermione Granger', '222-334-444', TO_DATE('2019-05-30', 'YYYY-MM-DD'), 'Warner Bros', 'Producer');
INSERT INTO EmploysEmployee3 VALUES ('E125', 'Ron Weasley', '333-445-555', TO_DATE('2020-11-21', 'YYYY-MM-DD'), 'Universal Music', 'Engineer');
INSERT INTO EmploysEmployee3 VALUES ('E126', 'Parvati Patil', '444-556-666', TO_DATE('2018-08-13', 'YYYY-MM-DD'), 'Atlantic Records', 'Marketing Head');
INSERT INTO EmploysEmployee3 VALUES ('E127', 'Severus Snape', '555-667-777', TO_DATE('2022-03-22', 'YYYY-MM-DD'), 'Capitol Records', 'Artist Manager');
INSERT INTO EmploysEmployee3 VALUES ('E128', 'Draco Malfoy', '666-774-888', TO_DATE('2017-04-15', 'YYYY-MM-DD'), 'Sony Music', 'Legal Advisor');
INSERT INTO EmploysEmployee3 VALUES ('E129', 'Rubeus Hagrid', '777-883-999', TO_DATE('2020-10-05', 'YYYY-MM-DD'), 'Warner Bros', 'Audio Engineer');
INSERT INTO EmploysEmployee3 VALUES ('E131', 'Bellatrix Lestrange', '999-112-222', TO_DATE('2019-12-01', 'YYYY-MM-DD'), 'Atlantic Records', 'Financial Analyst');
INSERT INTO EmploysEmployee3 VALUES ('E132', 'Neville Longbottom', '111-221-333', TO_DATE('2020-09-14', 'YYYY-MM-DD'), 'Capitol Records', 'Sound Designer');
INSERT INTO EmploysEmployee3 VALUES ('E133', 'Luna Lovegood', '222-314-444', TO_DATE('2022-01-07', 'YYYY-MM-DD'), 'Sony Music', 'HR Manager');
INSERT INTO EmploysEmployee3 VALUES ('E134', 'Minerva McGonagall', '333-441-555', TO_DATE('2018-11-23', 'YYYY-MM-DD'), 'Warner Bros', 'Marketing Specialist');
INSERT INTO EmploysEmployee3 VALUES ('E135', 'Ginny Weasley', '444-551-666', TO_DATE('2021-05-02', 'YYYY-MM-DD'), 'Universal Music', 'Sales Manager');
INSERT INTO EmploysEmployee3 VALUES ('E136', 'Cho Chang', '555-661-777', TO_DATE('2022-06-18', 'YYYY-MM-DD'), 'Atlantic Records', 'Social Media Manager');

INSERT INTO WritesContract1 VALUES ('Exclusive', 1000000);
INSERT INTO WritesContract1 VALUES ('Non-Exclusive', 750000);
INSERT INTO WritesContract1 VALUES ('Single-Album Deal', 500000);
INSERT INTO WritesContract1 VALUES ('Multi-Album Deal', 2000000);
INSERT INTO WritesContract1 VALUES ('Tour Support', 300000);

INSERT INTO ArtistSigns1 VALUES ('Taylor Swift', TO_DATE('1989-12-13', 'YYYY-MM-DD'));
INSERT INTO ArtistSigns1 VALUES ('Ariana Grande-Butera', TO_DATE('1993-06-26', 'YYYY-MM-DD'));
INSERT INTO ArtistSigns1 VALUES ('Peter Hernandez', TO_DATE('1985-10-08', 'YYYY-MM-DD'));
INSERT INTO ArtistSigns1 VALUES ('Stefani Germanotta', TO_DATE('1986-03-28', 'YYYY-MM-DD'));
INSERT INTO ArtistSigns1 VALUES ('Billie OConnell', TO_DATE('2001-12-18', 'YYYY-MM-DD'));
INSERT INTO ArtistSigns1 VALUES ('Sabrina Carpenter', TO_DATE('1999-05-11', 'YYYY-MM-DD'));
INSERT INTO ArtistSigns1 VALUES ('Chappell Roan', TO_DATE('1998-02-19', 'YYYY-MM-DD'));
INSERT INTO ArtistSigns1 VALUES ('Kendrick Lamar', TO_DATE('1987-06-17', 'YYYY-MM-DD'));
INSERT INTO ArtistSigns1 VALUES ('Drake', TO_DATE('1986-10-24', 'YYYY-MM-DD'));
INSERT INTO ArtistSigns1 VALUES ('Linkin Park', TO_DATE('1996-03-01', 'YYYY-MM-DD'));

INSERT INTO ArtistSigns2 VALUES ('Taylor Swift', 'Taylor Swift');
INSERT INTO ArtistSigns2 VALUES ('Ariana Grande', 'Ariana Grande-Butera');
INSERT INTO ArtistSigns2 VALUES ('Bruno Mars', 'Peter Hernandez');
INSERT INTO ArtistSigns2 VALUES ('Lady Gaga', 'Stefani Germanotta');
INSERT INTO ArtistSigns2 VALUES ('Billie Eilish', 'Billie OConnell');
INSERT INTO ArtistSigns2 VALUES ('Sabrina Carpenter', 'Sabrina Carpenter');

INSERT INTO WritesContract2 VALUES ('C101', 'Exclusive', 'Taylor Swift', 'Republic Records', TO_DATE('2018-01-01', 'YYYY-MM-DD'), TO_DATE('2024-12-31', 'YYYY-MM-DD'));
INSERT INTO WritesContract2 VALUES ('C102', 'Non-Exclusive', 'Ariana Grande', 'Republic Records', TO_DATE('2017-01-01', 'YYYY-MM-DD'), TO_DATE('2022-12-31', 'YYYY-MM-DD'));
INSERT INTO WritesContract2 VALUES ('C103', 'Single-Album Deal', 'Bruno Mars', 'Atlantic Records', TO_DATE('2020-01-01', 'YYYY-MM-DD'), NULL);
INSERT INTO WritesContract2 VALUES ('C104', 'Multi-Album Deal', 'Lady Gaga', 'Interscope Records', TO_DATE('2019-01-01', 'YYYY-MM-DD'), TO_DATE('2025-12-31', 'YYYY-MM-DD'));
INSERT INTO WritesContract2 VALUES ('C105', 'Tour Support', 'Billie Eilish', 'Interscope Records', TO_DATE('2022-01-01', 'YYYY-MM-DD'), TO_DATE('2023-12-31', 'YYYY-MM-DD'));
INSERT INTO WritesContract2 VALUES ('C106', 'Tour Support', 'Sabrina Carpenter', 'Hollywood Records', TO_DATE('2022-01-02', 'YYYY-MM-DD'), TO_DATE('2024-12-31', 'YYYY-MM-DD'));


INSERT INTO MusicProfessional VALUES ('Max Martin', 25);
INSERT INTO MusicProfessional VALUES ('Tommy Brown', 10);
INSERT INTO MusicProfessional VALUES ('Mark Ronson', 15);
INSERT INTO MusicProfessional VALUES ('RedOne', 12);
INSERT INTO MusicProfessional VALUES ('Finneas', 5);
INSERT INTO MusicProfessional VALUES ('Greg Kurstin', 20);
INSERT INTO MusicProfessional VALUES ('Jack Antonoff', 12);
INSERT INTO MusicProfessional VALUES ('Sounwave', 15);
INSERT INTO MusicProfessional VALUES ('Noah Goldstein', 10);
INSERT INTO MusicProfessional VALUES ('Rik Simpson', 8);
INSERT INTO MusicProfessional VALUES ('Julian Bunetta', 11);

INSERT INTO CollaboratesWith VALUES ('Max Martin', 'Taylor Swift');
INSERT INTO CollaboratesWith VALUES ('Tommy Brown', 'Ariana Grande');
INSERT INTO CollaboratesWith VALUES ('Mark Ronson', 'Bruno Mars');
INSERT INTO CollaboratesWith VALUES ('RedOne', 'Lady Gaga');
INSERT INTO CollaboratesWith VALUES ('Finneas', 'Billie Eilish');


INSERT INTO AwardShow VALUES ('MGM Grand Garden Arena', TO_DATE('2022-04-03', 'YYYY-MM-DD'), 'Grammy Awards', 'Recording Academy');
INSERT INTO AwardShow VALUES ('Staples Center', TO_DATE('2021-01-31', 'YYYY-MM-DD'), 'Grammy Awards', 'Recording Academy');
INSERT INTO AwardShow VALUES ('Radio City Music Hall', TO_DATE('2019-08-26', 'YYYY-MM-DD'), 'MTV Video Music Awards', 'MTV');
INSERT INTO AwardShow VALUES ('Microsoft Theater', TO_DATE('2021-06-27', 'YYYY-MM-DD'), 'BET Awards', 'BET Network');
INSERT INTO AwardShow VALUES ('Microsoft Theater', TO_DATE('2016-11-02', 'YYYY-MM-DD'), 'American Music Awards', 'ABC');
INSERT INTO AwardShow VALUES ('Barclays Center', TO_DATE('2018-08-20', 'YYYY-MM-DD'), 'MTV Video Music Awards', 'MTV');
INSERT INTO AwardShow VALUES ('Staples Center', TO_DATE('2023-02-05', 'YYYY-MM-DD'), 'Grammy Awards', 'Recording Academy');
INSERT INTO AwardShow VALUES ('Staples Center', TO_DATE('2024-03-15', 'YYYY-MM-DD'), 'MTV Video Music Awards', 'Recording Academy');
INSERT INTO AwardShow VALUES ('Staples Center', TO_DATE('2022-11-15', 'YYYY-MM-DD'), 'Billboard Music Awards', 'Recording Academy');

INSERT INTO Attends VALUES ('Grammy Awards', TO_DATE('2022-04-03', 'YYYY-MM-DD'), 'Taylor Swift', 6, 3);
INSERT INTO Attends VALUES ('Grammy Awards', TO_DATE('2022-04-03', 'YYYY-MM-DD'), 'Ariana Grande', 2, 1);
INSERT INTO Attends VALUES ('MTV Video Music Awards', TO_DATE('2024-03-15', 'YYYY-MM-DD'), 'Bruno Mars', 4, 3);
INSERT INTO Attends VALUES ('American Music Awards', TO_DATE('2016-11-02', 'YYYY-MM-DD'), 'Lady Gaga', 5, 2);
INSERT INTO Attends VALUES ('Billboard Music Awards', TO_DATE('2022-11-15', 'YYYY-MM-DD'), 'Billie Eilish', 7, 3);

INSERT INTO Writer VALUES ('Max Martin', 100);
INSERT INTO Writer VALUES ('Tommy Brown', 50);
INSERT INTO Writer VALUES ('Mark Ronson', 80);
INSERT INTO Writer VALUES ('RedOne', 60);
INSERT INTO Writer VALUES ('Finneas', 40);
INSERT INTO Writer VALUES ('Jack Antonoff', 120);
INSERT INTO Writer VALUES ('Sounwave', 45);

INSERT INTO Producer VALUES ('Max Martin', 'Pop');
INSERT INTO Producer VALUES ('Tommy Brown', 'Pop');
INSERT INTO Producer VALUES ('Mark Ronson', 'Funk');
INSERT INTO Producer VALUES ('RedOne', 'Pop');
INSERT INTO Producer VALUES ('Finneas', 'Alternative');
INSERT INTO Producer VALUES ('Greg Kurstin', 'Pop');
INSERT INTO Producer VALUES ('Rik Simpson', 'Rock');
INSERT INTO Producer VALUES ('Julian Bunetta', 'Pop');


INSERT INTO Studio VALUES ('Capital Records Recording Studios', 'NY', '1200');
INSERT INTO Studio VALUES ('Clear Lake Recording Studios', 'LA', 500);
INSERT INTO Studio VALUES ('Electro-Vox', 'LA', 720);
INSERT INTO Studio VALUES ('Paramount Recording Studios', 'LA', 1500);
INSERT INTO Studio VALUES ('Sunset Sound', 'NY', 600);
INSERT INTO Studio VALUES ('Studio6', 'Hensen Recording Studios', 650);
INSERT INTO Studio VALUES ('Studio7', 'Miami Recording Studios', 823);

INSERT INTO Album VALUES (602435648583, 'Max Martin', 'Taylor Swift', 'Evermore', 15, '01:01:00', TO_DATE('2020-12-11', 'YYYY-MM-DD'), 2000000);
INSERT INTO Album VALUES (602435864563, 'Tommy Brown', 'Ariana Grande', 'Positions', 14, '00:41:00', TO_DATE('2020-10-30', 'YYYY-MM-DD'), 1200000);
INSERT INTO Album VALUES (075678662737, 'Mark Ronson', 'Bruno Mars', '24K Magic', 9, '00:33:00', TO_DATE('2016-11-18', 'YYYY-MM-DD'), 1500000);
INSERT INTO Album VALUES (00602508854064, 'RedOne', 'Lady Gaga', 'Chromatica', 16, '00:43:00', TO_DATE('2020-05-29', 'YYYY-MM-DD'), 1300000);
INSERT INTO Album VALUES (602438241644, 'Finneas', 'Billie Eilish', 'Happier Than Ever', 16, '00:56:00', TO_DATE('2021-07-30', 'YYYY-MM-DD'), 1800000);
INSERT INTO Album VALUES (093624839842, 'Julian Bunetta', 'Sabrina Carpenter', 'Emails I Cant Send', 17, '00:50:56', TO_DATE('2022-07-15', 'YYYY-MM-DD'), 850000);

INSERT INTO Song VALUES ('USUG12004699', 'Willow', TO_DATE('2020-12-11', 'YYYY-MM-DD'), 'Pop', '00:03:35', 'Taylor Swift', TO_DATE('2020-11-25', 'YYYY-MM-DD'), 'Capital Records Recording Studios', 'NY', 602435648583);
INSERT INTO Song VALUES ('USUM72019412', 'Positions', TO_DATE('2020-10-30', 'YYYY-MM-DD'), 'Pop', '00:02:52', 'Ariana Grande', TO_DATE('2020-09-15', 'YYYY-MM-DD'), 'Clear Lake Recording Studios', 'LA', 602435864563);
INSERT INTO Song VALUES ('USAT21602944', '24K Magic', TO_DATE('2016-11-18', 'YYYY-MM-DD'), 'Funk', '00:03:45', 'Bruno Mars', TO_DATE('2016-10-20', 'YYYY-MM-DD'), 'Electro-Vox', 'LA', 075678662737);
INSERT INTO Song VALUES ('USUM72004304', 'Rain on Me', TO_DATE('2020-05-29', 'YYYY-MM-DD'), 'Pop', '00:03:02', 'Lady Gaga', TO_DATE('2020-03-15', 'YYYY-MM-DD'), 'Paramount Recording Studios', 'LA', 00602508854064);
INSERT INTO Song VALUES ('USUM72105934', 'Your Power', TO_DATE('2021-07-30', 'YYYY-MM-DD'), 'Alternative', '00:04:05', 'Billie Eilish', TO_DATE('2021-05-10', 'YYYY-MM-DD'), 'Sunset Sound', 'NY', 602438241644);
INSERT INTO Song VALUES ('USUM72210694', 'Read Your Mind', TO_DATE('2022-07-15', 'YYYY-MM-DD'), 'Pop', '00:03:27', 'Sabrina Carpenter', TO_DATE('2021-06-10', 'YYYY-MM-DD'), 'Sunset Sound', 'NY', 093624839842);
INSERT INTO Song VALUES ('USUM72200377', 'Fast Times', TO_DATE('2022-07-15', 'YYYY-MM-DD'), 'Pop', '00:02:54', 'Sabrina Carpenter', TO_DATE('2021-07-10', 'YYYY-MM-DD'), 'Sunset Sound', 'NY', 093624839842);
INSERT INTO Song VALUES ('USUM72114679', 'Skinny Dipping', TO_DATE('2022-07-15', 'YYYY-MM-DD'), 'Pop', '00:02:57', 'Sabrina Carpenter', TO_DATE('2021-08-10', 'YYYY-MM-DD'), 'Sunset Sound', 'NY', 093624839842);
INSERT INTO Song VALUES ('USUM72301876', 'Feather', TO_DATE('2022-07-15', 'YYYY-MM-DD'), 'Pop', '00:03:05', 'Sabrina Carpenter', TO_DATE('2021-09-10', 'YYYY-MM-DD'), 'Sunset Sound', 'NY', 093624839842);
INSERT INTO Song VALUES ('USUM72210708', 'Nonsense', TO_DATE('2022-07-15', 'YYYY-MM-DD'), 'Pop', '00:02:43', 'Sabrina Carpenter', TO_DATE('2021-10-10', 'YYYY-MM-DD'), 'Sunset Sound', 'NY', 093624839842);

INSERT INTO Single VALUES ('USUG12004699', 500000);
INSERT INTO Single VALUES ('USUM72019412', 1200000);
INSERT INTO Single VALUES ('USAT21602944', 1500000);
INSERT INTO Single VALUES ('USUM72004304', 1000000);
INSERT INTO Single VALUES ('USUM72105934', 1800000);

INSERT INTO AlbumTrack VALUES ('USUM72210694', 3);
INSERT INTO AlbumTrack VALUES ('USUM72105934', 10);
INSERT INTO AlbumTrack VALUES ('USUM72114679', 11);
INSERT INTO AlbumTrack VALUES ('USUM72301876', 15);
INSERT INTO AlbumTrack VALUES ('USUM72210708', 9);


INSERT INTO PerformsAt VALUES ('Taylor Swift', TO_DATE('2023-07-22', 'YYYY-MM-DD'), 'Lumen Field');
INSERT INTO PerformsAt VALUES ('Ariana Grande', TO_DATE('2019-05-06', 'YYYY-MM-DD'), 'Staples Center');
INSERT INTO PerformsAt VALUES ('Bruno Mars', TO_DATE('2018-07-14', 'YYYY-MM-DD'), 'Hyde Park');
INSERT INTO PerformsAt VALUES ('Lady Gaga', TO_DATE('2022-09-10', 'YYYY-MM-DD'), 'Dodgers Stadium');
INSERT INTO PerformsAt VALUES ('Billie Eilish', TO_DATE('2022-03-12', 'YYYY-MM-DD'), 'Little Caesars Arena');
INSERT INTO PerformsAt VALUES ('Sabrina Carpenter', TO_DATE('2024-11-04', 'YYYY-MM-DD'), 'Pacific Coliseum');

INSERT INTO IssueTicket2 VALUES ('D1201', 'FLR3', 1500);
INSERT INTO IssueTicket2 VALUES ('F12302', 'B15', 250);
INSERT INTO IssueTicket2 VALUES ('A12303', 'C10', 350);
INSERT INTO IssueTicket2 VALUES ('D12304', 'D1', 500);
INSERT INTO IssueTicket2 VALUES ('B123205', 'E20', 400);
INSERT INTO IssueTicket2 VALUES ('D12306', 'F25', 200);
INSERT INTO IssueTicket2 VALUES ('F12307', 'G5', 275);


INSERT INTO IssueTicket1 VALUES ('Lumen Field', TO_DATE('2023-07-22', 'YYYY-MM-DD'), 'D1201');
INSERT INTO IssueTicket1 VALUES ('Staples Center', TO_DATE('2019-05-06', 'YYYY-MM-DD'), 'F12302');
INSERT INTO IssueTicket1 VALUES ('Hyde Park', TO_DATE('2018-07-14', 'YYYY-MM-DD'), 'A12303');
INSERT INTO IssueTicket1 VALUES ('Dodgers Stadium', TO_DATE('2022-09-10', 'YYYY-MM-DD'), 'D12304');
INSERT INTO IssueTicket1 VALUES ('Little Caesars Arena', TO_DATE('2022-03-12', 'YYYY-MM-DD'), 'B123205');
INSERT INTO IssueTicket1 VALUES ('Pacific Coliseum', TO_DATE('2024-11-04', 'YYYY-MM-DD'), 'D12306');
INSERT INTO IssueTicket1 VALUES ('United Center', TO_DATE('2023-07-05', 'YYYY-MM-DD'), 'F12307');


