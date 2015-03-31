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


