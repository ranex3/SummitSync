NOTE: Requires firebase authentication & firebase database to be active.

# SummitSync
SummitSync is a conference-volunteer management system

It allows organisers to create conferences, and manage/invite volunteers. Organisers can create tasks and assign them to volunteers,
approve time slips, as well as provide feedback and ratings to volunteers.

Volunteers are able to search for nearby conferences that may interest them, and request to join. From here they can volunteer for 
tasks, see their schedule and submit time slips.

# Installation Guide

`Python3.4` or later is required. Additionally `pip` is required as well, this comes with `Python` versions 3.4 or later. 
For more information for installing python please see: https://www.python.org/downloads/.
For more information on `pip`, please see: https://pypi.org/project/pip/.

To install all required python dependencies please run the following command in the root of the directory:
```
pip install -r requirements.txt
```

To run the frontend, please ensure that you have Node.js installed, and NPM. To find out more, please see the following link:
https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

`Node.js` version 16 or above is required.

To install all the required node packages, please navigate to the `frontend` directory and run the following command:
```
npm install
```

# How to run

To start the backend, please navigate to the `backend` directory and run the following command:
```
python3 app.py
```

To start the frontend, please navigate to the `frontend` directory and run the following command:
```
npm start
```

# Documentation

Please see the `SummitSync_Documentation.pdf` file in the root of the repository for detail on routes that can be called.
Additionally, all database functions and data structures are present.
