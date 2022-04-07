const { IServClient } = require("..")
const { GenConnectionParams, GenReqParams, ForamtCookies, FileExists} = require("./helpers");
const { fetchUrl } = require("fetch/lib/fetch");
const { writeFileSync, readFileSync } = require("fs");
const time = require("moment-timezone");

class Request {
    /**
     * Gets the correct data to send
     * @param {IServClient} IServClient - the client objekt
     **/
    constructor(IServClient){
        this._client = IServClient;
        this._cookies = undefined;
        this._fcookies = undefined
        this._data = undefined;
        this.response = "";
    }
    /**
     * Only extracts the remberme cookie for login
     * @public
     * @param {object} dict the dict to extract the cookie from
     * @returns {object} the cookie
     */
    RememberMeCookies(dict){
        return {"REMEMBERME": dict.REMEMBERME};
    }

    /** 
     * Check if a cookie is expired
     * @param {object} cookie - the cookie to check
     * @returns {boolean} - true if expired
    */
    CheckCookieExpired(cookie){
        return cookie[0]._expires < time.utc();
    }

    /**
     * Login with saved cookies
     * @public
     * @returns {boolean} - true if login was successful
    */
    async LoginWithSavedCookies(){
        if (this._client._reuseCookies && !this.CheckCookieExpired(this._cookies.IServSession))
        {
            this._fcookies = ForamtCookies(this._cookies);
            await this.Send("");
            if (this._data.status == 200) return true;
        }
        return false;
    }
    /**
     * Login with remember me
     * @public
     * @returns {boolean} - true if login was successful
     */
    async LoginWithRememberMe(){
        if (this._client._rememberMe && !this.CheckCookieExpired(this._cookies.REMEMBERME))
        {
            this._fcookies = ForamtCookies(this.RememberMeCookies(this._cookies));
            await new Promise((resolve, reject) => {
                fetchUrl(this._client._url, GenReqParams(this._client), async (_, data, response) => {
                    data.status != 200 ? console.log("Error while loading: " + this._client._url) : null
                    this._data = data;
                    this.response = String.fromCharCode.apply(null, response);
                    resolve(response);
                });
            });
            this._cookies = this._data.cookieJar.cookies;
            this._cookies["REMEMBERME"] = [this._cookies["REMEMBERME"][1]];
            this._fcookies = ForamtCookies(this._cookies);
            if (this._client._reuseCookies){
                writeFileSync( this._client._cookieFile, JSON.stringify(this._cookies));
            }
            if (this._data.status == 200) return true;
        }
        return false;
    }


    /** 
     * Check if the session is expired
     * @public
    */
    async CheckSessionExpired(){
        if (this.CheckCookieExpired(this._cookies.IServSession))
        {
            if (!(await this.LoginWithSavedCookies() || await this.LoginWithRememberMe()))
            {
                await this.Login();
            }
        }
    }

    /** 
     * New login
     * @public
    */
    async Login(){
        console.log("New Login!");
        await new Promise((resolve, reject) => {
			fetchUrl(this._client._url + "app/login", GenConnectionParams(this._client), async (_, data, response) => {
				data.status != 200 ? console.log("Error while loading: " + this._client._url) : null
                this._data = data;
                this.response = String.fromCharCode.apply(null, response);
				resolve(response);
			});
		});
        this._cookies = this._data.cookieJar.cookies;
        this._fcookies = ForamtCookies(this._cookies);
        if (this._fcookies.toString() === ""){
            throw new Error("\n\nWrong login information provided!\n");
        }
        this._client.Log(this._data, this._cookies);
        // for setting reuseCookies
        if (this._client._reuseCookies){
            writeFileSync( this._client._cookieFile, JSON.stringify(this._cookies));
        }
    }
    /** 
     * Parse the json expire date from cookies
     * @private
    */
    ParseExpireDate(){
        Object.keys(this._cookies).forEach(cookie => {
            this._cookies[cookie][0]._expires = time(this._cookies[cookie][0]._expires);
        });
    }

    /**
     * Connects with the configured data
     * @public
     **/
    async Connect() {
        if (FileExists(this._client._cookieFile))
        {
            this._cookies = JSON.parse(readFileSync(this._client._cookieFile));
            this.ParseExpireDate();
            if (!(await this.LoginWithSavedCookies() || await this.LoginWithRememberMe()))
            {
                await this.Login();
            }
        }
        else{
            await this.Login();
        }
        //fetchUrl()
    }

    /**
     * Sends get request to the provided url
     * @param {String} url - The url minus the firstly provided bit
     * @public
     **/
    async Send(url)
    {
        await this.CheckSessionExpired();
        await new Promise((resolve, reject) => {
			fetchUrl(this._client._url + url, GenReqParams(this._client), async (_, data, response) => {
				data.status != 200 ? console.log("Error while loading: " + this._client._url) : null
                this._data = data;
                this.response = String.fromCharCode.apply(null, response);
				resolve(response);
			});
		});
        this._client.Log(this.response, this._data);
        return this.response;
    }
}

module.exports = {Request}