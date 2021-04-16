/*jshint esversion:9*/

import React, {useState, useEffect} from 'react';
import Keycloak from 'keycloak-js';

const Secured = (props) => {

  const [kc, setKC] = useState();
  const [authenticated, setAuthenticated] = useState();

  const { updateToken } = props;

  useEffect(() => {
    const keycloak = new Keycloak('/resources/keycloak.json');
    keycloak.init({onLoad: 'login-required',enableLogging:false}).success((_authenticated) => {
      setKC(keycloak);
      setAuthenticated(_authenticated);
      if (_authenticated) {
        let myStorage = window.sessionStorage;
        myStorage.setItem('token', keycloak.token);
        window.accessToken = keycloak.token;
        updateToken(keycloak.token);
      }

    });
  }, []);

  // render

  if (kc) {
    if (authenticated) {
      return (<div>{props.children}</div>);
    } else {
      return (<div>unable to authorize user</div>);
    }
  } else { 
    return (<div>authorizing user ...</div>);
  }

};

export default Secured;
