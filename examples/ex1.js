const {IServClient} = require("../index");
const { Calender } = require("../plugins/calender")


let client = new IServClient("https://rs-oehringen.de/iserv/", "user", "pass", true, false);

async function Main(){
    await client.Login();
    console.log(await client.Get("user/api/notifications"));
    client.LoadPlugin(Calender)
    await client.plugins.Calender.Update(client.plugins.Calender.GetTime(), client.plugins.Calender.GetTime(2592000))
    console.log(client.plugins.Calender.Get("<title> hi <when>"))
    console.log(client.plugins.Calender.Get())
}

Main()