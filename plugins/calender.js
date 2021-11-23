const time = require("moment-timezone");

class Calender{
    /**
     * Calender plugin -https://momentjs.com/timezone/
     * @constructor
     * @param {IServClient} IServClient - the client objekt
     **/
    constructor (IServClient){
        this._client = IServClient;
        this._data = null;
        this.name = "Calender";
        this.timezone = "Europe/Berlin"; // https://github.com/moment/moment-timezone/blob/develop/data/packed/latest.json
    }

    /**
     * Get time
     * @function
     * @param {int} offset - offset in seconds
     **/
    GetTime(offset){
        
        return time().tz(this.timezone).add(time.duration(offset*1000));
    }

    /**
     * Update calender data
     * @function
     * @param {time.Moment} fromDay - start
     * @param {time.Moment} toDay - end
     **/
    async Update(fromDay, toDay) {
        this._data = JSON.parse(await this._client.Get(`calendar/feed/plugin?${new URLSearchParams({plugin: "exam-plan", start: fromDay.format(),end: toDay.format()}).toString()}`));

    }

    /**
     * Formats or returns Json
     * @function
     * @param {string} [format] format like "Exam is written on <title>"
     **/
    Get(format) {
        if (format === undefined){
            return this._data;
        }
        else{
            const out = [];
            this._data.forEach(element => {
                out.push(format.replace(new RegExp("<id>", 'g'), element.id)
                .replace(new RegExp("<id>", 'g'), element.id)
                .replace(new RegExp("<title>", 'g'), element.title)
                .replace(new RegExp("<start>", 'g'), element.start)
                .replace(new RegExp("end", 'g'), element.end)
                .replace(new RegExp("<allDay>", 'g'), element.allDay)
                .replace(new RegExp("<editable>", 'g'), element.editable)
                .replace(new RegExp("<when>", 'g'), element.when)
                .replace(new RegExp("<plugin>", 'g'), element.plugin)
                .replace(new RegExp("<details>", 'g'), element.details));
            });
            return out;
        }
    }
}

module.exports = {Calender}