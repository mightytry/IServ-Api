const { IServClient } = require("..")
const { GenConnectionParams, GenReqParams, ForamtCookies, FileExists} = require("./helpers");
const { fetchUrl } = require("fetch/lib/fetch");
const { writeFileSync, readFileSync } = require("fs");

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
     * Connects with the configured data
     * @public
     **/
    async Connect() {
        if (this._client._reuseCookies && FileExists(this._client._cookieFile))
        {
            this._cookies = JSON.parse(readFileSync(this._client._cookieFile));
            this._fcookies = ForamtCookies(this._cookies);
            await this.Send("login_check");
            this._client.Log(this._data, this._cookies);
            if (this._data.status == 200) return;
        }
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
        //fetchUrl()
    }

    /**
     * Sends get request to the provided url
     * @param {String} url - The url minus the firstly provided bit
     * @public
     **/
    async Send(url)
    {
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