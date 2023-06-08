DROP DATABASE IF EXISTS testdb;
CREATE DATABASE testdb;
USE testdb;
DROP TABLE IF EXISTS login;

CREATE TABLE login
(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  userid TEXT NOT NULL,
  pass TEXT NOT NULL,
  username TEXT NOT NULL
)DEFAULT CHARACTER
  SET=utf8;

  INSERT INTO login
    (userid,pass,username)
  VALUES
    ("tanaka","abc","田中"),
    ("suzuki","pass","鈴木"),
    ("aaa","word","あああ");

DROP TABLE IF EXISTS chat;

CREATE TABLE chat
(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username TEXT,
  userid TEXT NOT NULL,
  ondate TEXT NOT NULL,
  onday TEXT NOT NULL,
  ontime TIME NOT NULL,
  content TEXT
)DEFAULT CHARACTER
  SET=utf8;

