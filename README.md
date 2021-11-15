# Vigil
Project resources for VIGIL, a platform service promoting reviews and queries of businesses and services across the globe.

#index.js
All core framework utilities, databases and external APIs (Express, MongoDB, Mongoose, Cloudinary, Mapbox, etc.), and the primary routes (home page and error page)

#/models
Creates the Mongoose-derived class objects that describe the Collections of Users, Stations, Reviews and Articles, along with their JOI validation checkers

#/routes
Contains the CRUD route handlers for each Collection (Users, Stations, Reviews and Articles), separately accordingly between 4 .js files

#/utils
Specialized and mischellaneous functions used throughout the application. Validation.js is the essential one in here

#/views
Holds the HTML/EJS document files along with all other front-end assets, such as style sheets, sripts, images and fonts for every page.

Private key info is needed to access the Mongo database, cloudinary storage and Mapbox API. CDNs from Bootstrap and JQuery are needed for front-end pages to display properly.
