# Vigil
Project resources for VIGIL, a platform service promoting reviews and queries of businesses and services across the globe.

## What is it?
Nothing revolutionary I can tell you that. You use Vigil to create a personal profile, post "Stations" (basically just submit a form review of a place you shopped, visited or investigated so other uses can view it for information), post reviews of any stations (rating and a comment), submit personalized articles (with your own links and photos) that expand on station info or other users' posts, and lastly you can use the Mapbox world-map to visualize the geographical data of each station.
But nonetheless a solid, sleek 

## Application folders and components
#### index.js
* All core framework utilities, databases and external APIs (Express, MongoDB, Mongoose, Cloudinary, Mapbox, etc.), and the primary routes (home page and error page)

#### /models
* Creates the Mongoose-derived class objects that describe the Collections of Users, Stations, Reviews and Articles, along with their JOI validation checkers

#### /routes
* Contains the CRUD route handlers for each Collection (Users, Stations, Reviews and Articles), separately accordingly between 4 .js files

#### /utils
* Specialized and mischellaneous functions used throughout the application. Validation.js is the essential one in here

#### /views
* Holds the HTML/EJS document files along with all other front-end assets, such as style sheets, sripts, images and fonts for every page.

-----------------------------------------------------------------------------------------
Private key info is needed to access the Mongo database, cloudinary storage and Mapbox API. 
CDNs from Bootstrap and JQuery are needed for front-end pages to display properly.


## Known issues/Unfinished components
* Not all form validation is error proof
* At some specific screen sizes, hovering navbar links can cause violent rapid element shifting 
* No links in the Footer section go anywhere, as they are not relevant to the project and half of them are borderline worthless (then again, most Footers are)

