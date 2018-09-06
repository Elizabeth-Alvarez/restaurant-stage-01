/**
 * Common database helper functions.
 */
var idbApp = (function() {
  'use strict';
 //Check to see if IndexedDB is supported by browser
 if(!('indexedDB' in window)) {
   console.log('This browser doesn\'t support IndexedDB');
   return;
 }

 //Create Database called 'restaurantDB'
 const dbPromise = idb.open('restaurantDB', 3, upgradeDB => {
   //switch cases created to update DB
   console.log('Creates a restaurant database');
   switch (upgradeDB.oldVersion) {
     case 0:

     case 1:
     console.log('Creates an object store');
     upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});

     /*
     case 2:
     console.log('Creates a name index');
     var store = upgradeDB.transaction.objectStore('restaurants');
     store.createIndex('name', 'name');
     */

   } //Closes switch statement
 }); //End of idb.open function
})(); //End of idbApp function


class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}/restaurants`;
    //http://localhost:1337/restaurants/{3}
  }
  /**
   * Fetch all restaurants.
   */
   //Changed usage of XHR objec to using Fetch.
   //Default HTTP method for Fetch request is GET method

      static fetchRestaurants(callback) {

        fetch(DBHelper.DATABASE_URL) //grabs data from http://localhost:1337/restaurants
        .then(response => response.json()) //reads and parses data using json()
        //.then(response => console.log(response.json())) //successfully grabbing data
        .then(restaurants => //promise where we indicate what to do with the data
          {
            //console.log('TEST:', restaurants);
            dbPromise.then(db => {
              const tx = db.transaction('restaurants', 'readwrite'); //create a transaction
              const store = tx.objectStore('restaurants'); //store objectStore
              restaurants.forEach(restaurant => {  //loop through the data
                store.add(restaurant); //add data to db
              });
               return tx.complete; //verifies transaction successfully completed
            });
            //Callback functions allow functions to use other functions within parameters
            //So they can be executed after the current function has finished
            callback(null, restaurants);
          })
        .catch(error => {//handles error messages
        const errorMessage = (`Request FAILED. Returned status of ${error.statusText}`);
        callback(errorMessage, null);
      });

    }//End of fetch function

/*
   static fetchRestaurants(callback) {
     fetch(DBHelper.DATABASE_URL)
     .then(response => response.json())
     .then(restaurants => callback(null, restaurants))
     .catch(error => {
     const errorMessage = (`Request failed. Returned status of ${error.statusText}`);
     callback(errorMessage, null);
   });
 }*/

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph) {
      return `/img/${restaurant.photograph}.jpg`;
    }
    return (`/img/${restaurant.id}.jpg`);
  }

  /**
  * Restaurant image alt url
  */
  static imageAltForRestaurant(restaurant) {
    return (`${restaurant.alt}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

} //End of DBHelper class
