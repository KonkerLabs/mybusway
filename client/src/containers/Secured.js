/*jshint esversion:9*/

import React, {useState, useEffect} from 'react';
import Keycloak from 'keycloak-js';
import { Link } from 'react-router-dom';

const Secured = (props) => {

  const [kc, setKC] = useState();
  const [authenticated, setAuthenticated] = useState();

  const { updateToken, roles } = props;

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
    // eslint-disable-next-line
  }, []);

  // render

  if (kc) {
    if (authenticated) {
      // check if the user has the required authorization 
      // after he/she passes the authentication process

      //console.log('TOKEN-KC');
      //console.log(kc);
      //console.log(kc.tokenParsed);
      // console.log(roles);
      // console.log(kc.resourceAccess.account.roles);

      if ((roles === undefined) || (roles.length === 0) || (roles && roles.map((role) => { if (!kc.tokenParsed.roles) { return -1 } else { return kc.tokenParsed.roles.indexOf(role) } } ).reduce((p,c) => p && (c !== -1), true))) {
        return (<div>{kc.tokenParsed.email} <Link to="/" onClick={() => kc.logout({redirectUri:window.location.protocol + "//" + window.location.host})}>logout</Link>{props.children}</div>);
      } else {
        return (<div>{kc.tokenParsed.email} <Link to="/" onClick={() => kc.logout({redirectUri:window.location.protocol + "//" + window.location.host})}>logout</Link><div>User not authorized to view this content ...</div></div>);
      }

    } else {
      return (<div>unable to authenticate user</div>);
    }
  } else { 
    return (<div>authorizing user ...</div>);
  }

};

export default Secured;
