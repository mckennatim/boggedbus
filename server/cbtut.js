var stt =  '1900-01-01 08:30:00.000'
var std = new Date(stt)
console.log(fdate(new Date(std.getTime()+30*60000)))

function genericPoemMaker(name, gender) {
    console.log(name + " is finer than fine wine.");
    console.log("Altruistic and noble for the modern time.");
    console.log("Always admirably adorned with the latest style.");
    console.log("A " + gender + " of unfortunate tragedies who still manages a perpetual smile");
}

function getUserInput(firstName, lastName, gender, callback) {
    var fullName = firstName + " " + lastName;
    if (typeof callback === "function") {
    // Execute the callback function and pass the parameters to it​
    callback(fullName, gender);
    }
}

getUserInput("Michael", "Fassbender", "Man", genericPoemMaker);
var res;
var sta = [{first:1, second:2}, {third:3, fourth:4}];
var ob = {name: 'tim', goob: {speed: 0, dist:0}}
var geo = ob.goob

function consolSta(sta, ob, cb){
	var con = sta[1]
	cb(ob, con)
}

function generic(x, y){
	res = x
	console.log(y)
}

consolSta(sta, geo, function(x,y){
	console.log(y)
	console.log(x)
})

if (typeof Date.prototype.toISOLocalString !== 'function') {
 
    (function () {
 
        'use strict';
 
        // Function which takes a 1 or 2-digit number and returns
        // it as a two-character string, padded with
        // an extra leading zero, if necessary.
        function pad(number) {
            var r = String(number);
            if (r.length === 1) {
                r = '0' + r;
            }
            return r;
        }
 
        Date.prototype.toISOString = function () {
            return this.getUTCFullYear()
                + '-' + pad(this.getMonth() + 1)
                + '-' + pad(this.getDate())
                + ' ' + pad(this.getHours())
                + ':' + pad(this.getMinutes())
                + ':' + pad(this.getSeconds())
                + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5);
         };
 
    }());
}

function fdate(d){
        function pad(number) {
            var r = String(number);
            if (r.length === 1) {
                r = '0' + r;
            }
            return r;
        }    
        return '1900'
            + '-' + pad(d.getMonth() +1)
            + '-' + pad(d.getDate())
            + ' ' + pad(d.getHours())
            + ':' + pad(d.getMinutes())
            + ':' + pad(d.getSeconds())
            + '.' + String((d.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5);

}