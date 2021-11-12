const { IServClient } = require("..");
const { accessSync, constants } = require("fs");

/**
 * Foramts the cookies to be send as header
 * @param {String} filepath - the client objekt
 **/
function FileExists(filepath){
	let flag = true;
	try{
	  accessSync(filepath, constants.F_OK);
	}catch(e){
	  flag = false;
	}
	return flag;
  }

/**
 * Foramts the cookies to be send as header
 * @param {object} dict - the client objekt
 **/
function ForamtCookies(dict){
	out = [];
	for ( element in dict )
	  	{
			out.push(`${element}=${dict[element][0].value}; `)
	  	}
	return out;
}

/**
 * Gets the correct data to send
 * @param {IServClient} IServClient - the client objekt
 **/
function GenConnectionParams(IServClient) {
    // Uses URLSearchParams to get the right form data!
    const formData = new URLSearchParams();
    formData.append("_username", IServClient._username)
    formData.append("_password", IServClient._password)
    if (IServClient._rememberMe) formData.append("_remember_me", "on");

    return {
        payload : formData.toString(),
        method: 'POST',
        headers: {
            'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded"
              }
            }
        };

/**
 * Sends requests for the features
 * @param {IServClient} IServClient - the client objekt
 **/
function GenReqParams(IServClient) {
    return {
        method: 'GET',
		    credentials: 'include',
		    cookies: IServClient._request._fcookies,
        headers: {
            'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded",
              }
            }
        };


module.exports = {GenConnectionParams, GenReqParams, ForamtCookies, FileExists};