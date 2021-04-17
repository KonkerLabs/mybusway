## CONTEXT 

this is the main web application and API server for MyBusWay application 
note: the application name should be changed to deploy in another context 

## ENVIRONMENT VARIABLES 

following are the environment variables needed to be defined before running this application

- environment (.env)

 - KONKER_API_TOKEN=<has the KONKER PLATFORM API TOKEN> that holds data for the devices
 - KONKER_APPLICATION=<application name -- created on the KONKER PLATFORM> that holds all data from the devices
 - BUS_STOP_CONFIG=local JSON file used to indicate stops geolocation (for development purpose)
 - DEBUG_MODE_CACHED_POSITIONS=<True/False> to indicate if one should present data in the console regarding the updated position of devices

 - KC_REALM= MyBusway
 - KC_SERVER_URL= <keycloack-server>/auth/ URL 
 - KC_RESOURCE=mybusway-microservice
 - KC_REALM_PUBLIC_KEY=<public key for this application>

- client environemnt (.env)

 - MYBUSWAY_SERVER=<http address where to find the server application running>

## DEVELOPMENT 

this application use a docker-based configuration composed of some containers:

* postgres (database used for the OpenID server)
* keycloak (OpenID server) 
* mongo (local database used to hold custom information regarding the application)
* mongo-express (used to managed the database) .. not required on production 
* server (server instance that execute process to handle data, cache information regarding the devices, and process application logic) 
* client (web interface for the end-user)

additionally some external services are used:

* GMail - to send authentication and validation emails

there are two major directories:

Folder  | Description
------- | ------------
./server | node application that handles information processing and integration with KONKER platform
./client | REACT leaflet application to present actual data to the user
./scripts | contains jupyter notebooks used to analyze data ..             
./data | data received by the customers regarding the general information of the project
./doc | project architectural information
./art | icon and label designs

```
NOTE: guarantee that 'credentials.json' is created locally 
      out of repository, with credentials used to access the platform ... 
      check 'credentials-sample.json' for the file format
```

to execute the application locally for development purpose use:

- docker-compose build
- docker-compose up 

or directly on each folder: client and server, execute `yarn start`


## DEPLOYMENT 

* update version information of the client and/or server packages on respective folder's package.json file
* execute 'yarn docker-build' to create an local image for this distribution 
* execute 'yarn docker-push' to send this new image to the repository 

on server environment, point to the new version deployed and recycle the container 
the specific command is platform dependent (AWS, GCP, AZURE, ALICLOD, DO, HEROKU, ...) and if you're using K8 
to provide the deployment 


## REFERENCES 

* for authorization and authentication used 
 * https://medium.com/devops-dudes/secure-front-end-react-js-and-back-end-node-js-express-rest-api-with-keycloak-daf159f0a94e
 * https://jasonwatmore.com/post/2019/02/01/react-role-based-authorization-tutorial-with-example
