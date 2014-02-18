#Ananda Yoga Lander Website

##About

This website began as a personal project, done pro bono without being requested by the studio itself, as an exercise in putting together technologies I had no worked with before, specifically crucial parts of the *MEAN* stack. 

##Getting Started
<code>npm install</code> will get dependencies out of packages.json

###Technologies
* NodeJS
* ExpressJS
* MongoDB
* Mongoose
* Bootstrap
* jQuery

##Road-map
###Model & CRUD completion
The following Models have currently been sketched out, and are the first thing being built.
#####Teacher:Complete
Teachers are, well, teachers. Their main feature is having their "firstName" be their unique primary key, helping me create beautiful routes.

#####Event:Complete
Event is the powerful object that will power both regular, weekly classes as well as special events.

#####Substitution:Complete
A substitution is an object denoting a one-time overwrite of a class's teacher. A substitution is made of three easy parts
* teacher (foreign key)
* class (foreign key)
* date

#####News / Post?:Far off
The user's going to need some way to easily update content on the front page


###Wireframe
See views/mockup.html
Anticipated pages include

* Landing/Home page
* Teachers/Instructors page
* Class schedule
* Class descriptions
* Pricing page
* Retail information
* Admin page (requires login)
    * forms for each model's crud pages