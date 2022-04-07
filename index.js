#!/usr/bin/env node

const { Request } = require("./tools/request");

class IServClient {
    /**
     * Create a IServTool instance
     * @constructor
     * @param {String} ServerUrl - the server url
     * @param {String} username - username used for login
     * @param {String} password - password used for login
     * @param {boolean} [rememberMe] - Set true if you dont want to log in everytime
     * @param {boolean} [log] - Enable debug logging
     * @param {boolean} [reuseCookies] - save cookies and reuse them. only works for one user
     * @param {object} [options] - Options {cookieFile: "./cookies.json"}
     **/
    constructor (serverUrl, username, password, rememberMe, log, reuseCookies=true, options={}){
        this._url = serverUrl;
        this._username = username;
        this._password = password;
        this._rememberMe = rememberMe;
        this._log = log;
        this._reuseCookies = reuseCookies;
        this._request = new Request(this);
        this._cookieFile = options["cookieFile"] ? options["cookieFile"] : "./cookies.json"
        this.plugins = {}
        this.Log(`\nLogging : ${this._log ? true : false}!`);
        this.Log(`reuseCookies : ${this._reuseCookies ? true : false}!`);
        this.Log(`Autologin : ${this._reuseCookies ? true : false}!\n`);

    }
    /**
     * Logs into your provided 
     * @public
     * @function
     **/
    async Login() {
        this.Log(`\nLogging in to: "${this._url}", please wait!\n`); 
        await this._request.Connect();
    }
    /**
     * Logs into your provided 
     * @public
     * @function
     * @param {string} url The url minus the firstly provided bit
     **/
    async Get(url) {
        return await this._request.Send(url);
    }

    /**
     * Loads the given plugin
     * @public
     * @function
     * @param {object} plugin The plugin class
     * @param {string} [params] Optionally params
    **/ 
    LoadPlugin(plugin, ...params){
        var a = new plugin(this, params);
        this.plugins[a.name] = a;
    }

    /**
     * Logs the text
     * @public
     * @function
     * @param {string} text what is printed to console
    **/
    Log(...text)
    {
        if (this._log) text.forEach(t => {
            console.log(t)
        });
    }

}

module.exports = {IServClient};