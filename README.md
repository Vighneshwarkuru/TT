# TT
### Clone the repo 
``` bash
git clone https://github.com/Vighneshwarkuru/TT.git
```
should have mysql,jdk and react pre-installed 

before starting we have to create new db
add a custom user to mysql and add the password and provide priviliages 

## MySQL Setup
### Log in to MySQL as root (or an admin user)
``` bash
mysql -u root -p
```
Enter the root password when prompted.
### Create the database
``` bash
CREATE DATABASE firstdb
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
```
### Create the application user
``` bash
CREATE USER 'firstuser'@'localhost'
IDENTIFIED BY 'First@123';
```
### Grant privileges to the user on the database
``` bash
GRANT ALL PRIVILEGES ON firstdb.* TO 'firstuser'@'localhost';
```
### Apply privilege changes
``` bash
FLUSH PRIVILEGES;
```
### (Optional but recommended) Verify access
``` bash
mysql -u firstuser -p firstdb
```
If you get a MySQL prompt without complaints, the universe is aligned.

## To start frontend
### Open frontend folder in cli
``` bash
cd React_Frontend
```
### Before starting install npm packages
``` bash
npm install
```
### Now start frontend server
``` bash
npm start 
```
## To start backend
### Open backend folder in cli (new terminal)
``` bash
cd Springboot_Backend
```
### Find FirstprojectApplication.java
``` bash
Springboot_Backend/src/main/java/com/example/firstproject/FirstprojectApplication.java
```
### Run the file using java 
Now all the servers are running in all ports congratulations 