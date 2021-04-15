/*jshint esversion: 6 */

var axios = require('axios');

class KonkerAPI { 

  constructor() { 
    // initialize properties 
    this.token = undefined;
    this.baseURI = 'https://api.prod.konkerlabs.net';
    this.apiVersion = 'v1';
    this.application = 'default';
    
  }

  getConfig() {
    return {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      }
    };
  }

  get(url) {
    return new Promise((resolve, reject) => {
      axios.get(url, this.getConfig()).then(res => resolve(res)).catch(ex => reject(ex));
    });
  }

  post(url, data) {
    return new Promise((resolve, reject) => {
      axios.post(url, data=data, this.getConfig()).then(res => resolve(res)).catch(ex => reject(ex));
    });
  }

  put(url, data) {
    return new Promise((resolve, reject) => {
      axios.put(url, data=data, this.getConfig()).then(res => resolve(res)).catch(ex => reject(ex));
    });
  }

  login(apiToken) {
    this.token = apiToken;
  }

  // API calls 

  setApplication(application) {
    this.application = application;
  }

  getApplications() {
    return new Promise((resolve, reject) => {
      this.get(`${this.baseURI}/${this.apiVersion}/applications/`)
        .then(res => resolve(res.data.result))
        .catch(ex => reject(ex));
    });
  }

  getAllDevices(application=undefined) {
    if (!application) {
      application = this.application; // get default configured applicaiton if not specified
    }
    return new Promise((resolve, reject) => {
      this.get(`${this.baseURI}/${this.apiVersion}/${application}/devices/?size=500`)
        .then(res => resolve(res.data.result))
        .catch(ex => reject(ex));
    });
  }

  updateDeviceState(options) {
    var guid = this.getValueOrDefault(options, 'guid');
    var state = this.getValueOrDefault(options, 'state');

    // console.log(`KONKERAPI: new state ${state}`);
    
    return new Promise((resolve, reject) => {
      this.get(`${this.baseURI}/${this.apiVersion}/${this.application}/devices/${guid}`)
      .then(res => {
        if (res.data.code === 200) {
          // OK
          let record = res.data.result;

          return(record);
        }
        return undefined; 
      })
      .then(record => {
        if (record) {
          // update this record for new values ...
          // and return the executed transition when success 
          // 
          let info = JSON.parse(record.description);
          if (!info) { info = {}; }
          let oldState = info.state;

          if (oldState !== state) {

            info.state = state;
            record.description = JSON.stringify(info);

            this.put(`${this.baseURI}/${this.apiVersion}/${this.application}/devices/${guid}`, record)
              .then(res => { 
                // console.log(res.data);
                if (res.data.code === 200) {
                  console.log(`KONKER.API => executed state transition on ${record.id} from '${oldState}' -> '${state}'`);
                  resolve({transition:true, from:oldState, to:state});
                } else {
                  reject({transition:false, message: JSON.stringify(res.data)});
                }
              })
              .catch(ex => {
                reject({transition:false, message: JSON.stringify(res.data)});
              });
          } else { 
            resolve({transition:false, message:`already in the same state '${state}'`});
          }

        } else {
          reject({transition:false, message: 'INVALID DEVICE'});
        }
      })
      .catch(ex => {
        console.log('GET ERROR');
        console.log(ex);
        reject(ex);
      });
    });
  }

  getValueOrDefault(options, field, defaultValue=undefined) {
    if (Object.keys(options).includes(field)) {
      return options[field];
    }
    return defaultValue;
  }

  readData(options={}) {

    // get parameters 
    var guid=this.getValueOrDefault(options, 'guid');
    var application=this.getValueOrDefault(options, 'application');
    var limit=this.getValueOrDefault(options, 'limit');

    if (!application) {
      application = this.application;
    }
    var q = '' ; // define query parameter 
    if (guid) {
      q = `device:${guid}`;
    }

    if (q) {
      q = `q=${q}`;
    }

    var params = `limit=${(limit ? limit : 100)}&sort=newest`;

    // console.log(`${this.baseURI}/${this.apiVersion}/${application}/incomingEvents/?${q}&${params}`)
    
    return new Promise((resolve, reject) => {
      this.get(`${this.baseURI}/${this.apiVersion}/${application}/incomingEvents/?${q}&${params}`)
        .then(res => resolve(res.data.result))
        .catch(ex => reject(ex));
    });
  }

}

var api = new KonkerAPI();

module.exports = { api } ;