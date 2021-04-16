import axios from 'axios';

const instance = axios.create();

instance.interceptors.request.use(
  config => {
    // let tk = window.sessionStorage.getItem('token');
    // const token = tk ? tk : 'notoken';
    // console.log('CONFIG <<<<<');
    // console.log(token);
    // console.log(tk);
    // console.log(`USING THIS TOKEN TO MAKE REQUEST = ${instance._token}`);
    config.headers['Authorization'] = `Bearer ${instance._token}`;
    return config;
  },
  error => {
    // console.log('ERROR1');
    // console.log(error);
    Promise.reject(error);
  }
);


export default instance;