KILL 5173 PORT FROM WINDOWS CMD
================================
netstat -ano | findstr :5173
if out is below TCP 127.0.0.1:5173 0.0.0.0:0 LISTENING 12340 then run below command taskkill /PID 12340 /F replacing 12340 with previous command value.

DOWNLOAD FROM GITHUB BY BELOW COMMAND
=====================================
Open git bash and run below command git clone https://github.com/sikdarriton/TECH-EXACTLY-RITON-MERN-MACHINE-TEST.git

FRONTEND
=========
entering into frontend folder run below command npm i

BACKEND
=========
entering into backend folder run below command npm i

RUN IN BROWSER
===============
Open browser and use http://localhost:5173/ url

DEMO VIDEO LINK
================
https://drive.google.com/file/d/1nKTQtO5CHFf_IU-HB75bxJ5j9apM74RJ/view?usp=sharing

FEATURES IMPLEMENTED
=====================
1) Registration ( default user type user) by normally as well Google Registration.
2) Login by by normally as well Google Login.
3) Logout functionality.
4) Connect other account with Google API from SETTINGS menu.
5) Admin can manage ALL POSTS.
6) Admin can manage ALL USERS.
7) Only logged in user can EDIT and DELETE their own POST.
8) Soft delete functionality.
9) Post details with SEO friendly URL can be viewed if not deleted.
10) JOI plugin validation for Edit Post.
11) REACT BOOTSTRAP UI plugin used for Edit Post GUI.
12) Access Token time is set up for 15 minutes and Refresh Token time is set up for 7 days.
13) JWT token with Role (Admin and User) based acces control.
14) Admin Dashboard with Total No Of Users and Total No Of Posts excluding Soft deleted count.
