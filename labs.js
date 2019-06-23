(() => {
	// Represent a number (that has a military time value) as a standard time string.	
	Number.prototype.asTime = function () {
		this.time = this % 2400; // Hack to allow earlier later values... that made more sense in my head
		if (this.time < 100) {
			return "12:" + (this.time.valueOf() + "").padStart(2, "0") + "AM";
		} else if (this.time == 2400) {
			return "12:00AM";
		} else if (this.time >= 1300) {
			let num = this.time.valueOf();
			num = num - 1200;
			let time = Math.trunc(num / 100) + ":" + (num % 100 + "").padStart(2, "0") + "PM";
			return time;
		} else if (this.time >= 1200) {
			return "12:" + (this.time % 100 + "").padStart(2, "0") + "PM";
		} else {
			let num = this.time.valueOf();
			return Math.trunc(num / 100) + ":" + (num % 100 + "").padStart(2, "0") + "AM";
		}
	}

	// Represent time as a decimal number.
	Number.prototype.timeAsDecimal = function () {
		return (this % 100 / 60) + Math.trunc(this / 100);
	}

	// Convert military time to minutes since midnight.
	Number.prototype.toMinutes = function () {
		return (this % 100) + Math.trunc(this / 100) * 60;
	}

	// Convert minutes to hours and minutes.
	Number.prototype.toHours = function () {
		var h = Math.trunc(this / 60);
		return (h ? (h + "h ") : "") + this % 60 + "m";
	}

	// The venerable Timeslot, with its start and end time.
	// Graceful in its place of subverting the two-dimensional array.
	class Timeslot {
		constructor(start, end) {
			this.start = start;
			this.end = end;
		}

		// Return the timeslot as a string.
		// eg. 9:30AM–12:00PM
		get range() {
			return this.start.asTime() + "–" + this.end.asTime();
		}

		// Check if a given time is in this timeslot.
		// Simple, yet effective.
		inTimeslot(time) {
			if (this.start <= time && time < this.end) {
				return true;
			} else {
				return false;
			}
		}
	}

	// Oh, what a Day. What a lovely Day... class.
	// Simply put, a subcontainer for timeslots.
	class Day {
		constructor(timeslots) {
			this.name = "day";
			this.timeslots = timeslots;
		}

		// Tells whether the given time is in any of the timeslots.
		// Or does it tell which timeslot is present at a given time?
		// Aren't multiple return types a beauty?
		isContained(time) {
			for (let i = 0; i < this.timeslots.length; i++) {
				if (this.timeslots[i].inTimeslot(time)) {
					return this.timeslots[i];
				}
			}
			return false;
		}

		// Like the function above, except this one tells us the timeslot following our time.
		nextOpen(time) {
			for (let i = 0; i < this.timeslots.length; i++) {
				if (time < this.timeslots[i].start) {
					return this.timeslots[i];
				}
			}
			return false;
		}
	}

	// The Room, the meat of this project. © Tommy Wiseau.
	// Members include the name, day-array, and a link, that a future Gabe will hopefully implement. Someday.
	// Also fully-featured with helpful day-getters that are never used.
	class Room {
		constructor(name, days, link = false, description = false, tier = false) {
			this.name = name;
			this.days = days;
			this.link = link;
			this.description = description;
			this.tier = tier;
		}
		get monday() {
			return this.days[0];
		}
		get tuesday() {
			return this.days[1];
		}
		get wednesday() {
			return this.days[2];
		}
		get thursday() {
			return this.days[3];
		}
		get friday() {
			return this.days[4];
		}
	}

	// Function to help Gabe print paragraphs instead of typing all this stuff out each time.
	// The divId (which I unambiguously named, "list", in the html) is where paragraph will be born.
	// Specify pId to give your paragraph an id, and 
	// subsequently start daisychaining these things.
	// Specify style and class to add values to those tags.
	// Oh, and I put in the option to not print out a paragraph at all, and use a different tag.
	function addParagraph(divId, text, pId, href, style, pClass, tag = "p") {
		let para = document.createElement(tag);
		let textNode = document.createTextNode(text);

		if (href) {
			var link = document.createElement("a");
			link.appendChild(textNode);		
			// link.href = href;
			pClass ? link.className = pClass : null;
			pId ? link.id = pId + "-link" : null;
			para.appendChild(link);
		} else {
			para.appendChild(textNode);
		}
		
		pId ? para.id = pId : null;
		style ? para.style = style : null;
		pClass ? para.classList.add(pClass) : null;
		let div = document.getElementById(divId);
		return div.appendChild(para);
	}

	// https://gomakethings.com/how-to-get-the-value-of-a-querystring-with-native-javascript/
	// Grab a query string.
	function getQueryString(field, url) {
		var href = url ? url : window.location.href;
		var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
		var str = reg.exec(href);
		return str ? str[1] : null;
	};

	// Compare time by converting to minutes.
	function compareTime(first, second) {
		return (first.toMinutes() - second.toMinutes());
	}

	// Returns the current time as a military number (0–2359)
	function getCurrentTime() {
		let d = new Date();
		return parseInt(d.getHours() + ("" + d.getMinutes()).padStart(2, "0"), 10);
	}

	// Print each room that's available at the given time, along with their range, and
	// time remaining.
	// Populate occupiedRooms with the remaining rooms.
	function checkRooms(time = getCurrentTime()) {
		for (let i = 0; i < rooms.length; i++) {
			if (timeslot = rooms[i].days[(currentDay - 1)].isContained(time)) {
				let para = addParagraph("list", rooms[i].name + " (" + timeslot.range + ") [", rooms[i].name, false, "text-align: center", "openlist");    
				para.onclick = ()=>{showView(rooms[i].name, rooms[i].description, rooms[i].tier)};
				para.style.cursor = "pointer";

				// Highlight based on how much time is remaining       
				let remaining = compareTime(timeslot.end, time);
				if(timeslot.end == 2400){
					addParagraph(rooms[i].name, compareTime(timeslot.end, time).toHours(), false, false, "text-align: center", "openlist", "span");                
				}else{
					addParagraph(rooms[i].name, compareTime(timeslot.end, time).toHours(), false, false, "text-align: center", remaining <= 15 ? "closedlist" : remaining <= 30 ? "laterlist" : remaining <= 60 ? "soonlist" : "openlist", "span");
				}
				addParagraph(rooms[i].name, "]", false, false, "text-align: center", "openlist", "span");
			} else {
				occupiedRooms.push(rooms[i]);
			}
		}
	}

	// Return the amount of rooms soon to be available at a time,
	// given `howSoon` amount of minutes, and print their name, time range, and minutes
	// till opening.
	// Specify an html class for formatting purposes.
	function checkSoon(time = getCurrentTime(), howSoon = 15, pClass) {
		let remaining = [];
		for (let i = 0; i < occupiedRooms.length; i++) {
			if (timeslot = occupiedRooms[i].days[(currentDay - 1)].nextOpen(time)) {
				if (compareTime(timeslot.start, time) <= howSoon) {					
					let name = occupiedRooms[i].name;
					let description = occupiedRooms[i].description;
					let tier = occupiedRooms[i].tier;
					let para = addParagraph("list", occupiedRooms[i].name + " (" + timeslot.range + ")  [" + compareTime(timeslot.start, time).toHours() + "]", occupiedRooms[i].name, false, "text-align: center", pClass);
					para.addEventListener("click", ()=>{showView(name, description, tier)});
					para.style.cursor = "pointer";				
				} else {
					remaining.push(occupiedRooms[i]);
				}
			}
		}
		return remaining;
	}

	// Driver. Putting the meat of the script in here for an Ajax request.
	function doIt() {
		addParagraph("list", "For the current time, " +
			currentTime.asTime() + ", the following labs are free:", "cur1");
		checkRooms(currentTime);

		// Change text if there are no open rooms.
		if (occupiedRooms.length == rooms.length) {
			document.getElementById("cur1").innerHTML = "For the current time, " +
				currentTime.asTime() + ", no labs are open.";
		}

		addParagraph("cur1", '†', false, false, false, false, "sup");

		// List occupiedRooms soon to be open.
		if (occupiedRooms.length > 0) {
			addParagraph("list", "These labs will be free soon (<15 minutes):", "soon-15");
			let tempLength = occupiedRooms.length;
			occupiedRooms = checkSoon(currentTime, 15, "soonlist");

			// Get rid of text if there are no labs available in 15 minutes.
			if (tempLength == occupiedRooms.length) {				
				let child = document.getElementById("soon-15");
				child.parentNode.removeChild(child);
			}
			// List rooms avaiable in an hour.
			if (occupiedRooms.length > 0) {
				addParagraph("list", "These labs will be free in an hour or less:", "soon-hour");
				let tempLength = occupiedRooms.length;
				occupiedRooms = checkSoon(currentTime, 60, "laterlist");

				// Get rid of text if there are no labs available in an hour.
				if (tempLength == occupiedRooms.length) {
					let child = document.getElementById("soon-hour");
					child.parentNode.removeChild(child);
				}
				if (occupiedRooms.length > 0) {
					// Sort rooms by the start of the next free timeslot.
					occupiedRooms.sort(function (a, b) { return compareTime(a.days[currentDay - 1].nextOpen(currentTime).start, b.days[currentDay - 1].nextOpen(currentTime).start) });

					addParagraph("list", "These labs will be free... eventually:", "eventually");
					checkSoon(currentTime, 2400, "closedlist");
				}
			}
		}

		// Add dagger footnote.
		addParagraph("list", "", false, false, false, false, "br");
		addParagraph("list", "", "cur1.5");
		addParagraph("cur1.5", '†', false, false, false, false, "sup");
		document.getElementById("cur1.5").innerHTML += "(open period indicated in parentheses)";
		addParagraph("list", "[time left in period, or time left until a new one begins, indicated in braces]", "cur3");
	}

	function fillRooms(roomsJ) {
		for (var i = 0; i < roomsJ.length; i++) {
			let days = [];
			for (var j = 0; j < roomsJ[i].days.length; j++) {
				let timeslots = [];
				for (var k = 0; k < roomsJ[i].days[j].timeslots.length; k++) {
					let timeslot = roomsJ[i].days[j].timeslots[k];
					timeslots[k] = new Timeslot(timeslot.start, timeslot.end);
				}
				days[j] = new Day(timeslots);
			}
			let room = roomsJ[i];
			rooms[i] = new Room(room.name, days, room.link, room.description, room.tier);
		}
	}

	// Fade in view with room name and description
	// Fade out main site
	function showView(name, description, tier){
		let view = document.querySelector(".wrapper");
		let list = document.querySelector("#list");
		let tierMain = document.querySelector(".tier");
		let tierExtra = document.querySelector(".tier span span");
		let title = document.querySelector(".view h1");
		let body = document.querySelector(".view p");
		let close = document.querySelector(".close");

		// tierMain.childNodes[0].nodeValue = tier.main;
		tierExtra.innerHTML = tier.extra;
		tierMain.innerHTML = tier.main;
		tierMain.appendChild(tierExtra.parentNode);
		close.style.pointerEvents = "auto";
		title.innerHTML = name;
		body.innerHTML = description;
		list.style.opacity = 0;
		list.style.pointerEvents = "none";		
		view.style.opacity = 1;
	}

	// Fade out view and fade in main site
	function hideView(){
		let view = document.querySelector(".wrapper");
		let list = document.querySelector("#list");
		let close = document.querySelector(".close");

		close.style.pointerEvents = "none";
		list.style.opacity = 1;
		list.style.pointerEvents = "auto";
		view.style.opacity = 0;
	}

	// Hide the view on clicking the X button
	document.querySelector(".close").addEventListener("click", (event) => {
		hideView();
	});

	// Hide the view on clicking outside
	document.querySelector(".wrapper").addEventListener("transitionend", () => {
		if(document.querySelector(".wrapper").style.opacity == 1){
			document.querySelector("html").addEventListener("click", handleClick);
		}else{
			document.querySelector("html").removeEventListener("click", handleClick);
		}
	});	

	const showExtra = () => document.querySelector(".tier span span").style.left == "-100%";

	document.querySelector(".tier").onclick = () => {document.querySelector(".tier span span").style.left = showExtra() ? "0%" : "-100%"; if (!showExtra()) document.querySelector(".tier span").style.width = "auto"};

	document.querySelector(".tier").addEventListener("transitionend", () =>{
		document.querySelector(".tier span").style.width = showExtra() ? "0" : "auto";
	});

	// Hide the view on hitting escape
	window.onkeyup = (key) => {
		if(key.keyCode === 27){
			hideView();
		}
	}
	
	function handleClick(event){
		if(!event.target.closest(".view")){
			hideView();
			document.querySelector("html").removeEventListener("click", handleClick);
		}
	}

	occupiedRooms = [];

	let d = new Date();

	// Let custom day be assigned in querystring.
	if ((aDay = parseInt(getQueryString('day'), 10)) && aDay >= 0 && aDay <= 6 || aDay == 0) {
		var currentDay = aDay;
	} else {
		var currentDay = (d).getDay();	
	}

	// Let custom time be assigned in querystring.
	if ((aTime = parseInt(getQueryString('time'), 10)) && aTime >= 0 && aTime < 2400 && aTime % 100 < 60) {
		var currentTime = aTime;
	} else {
		var currentTime = getCurrentTime();
	}

	if (currentDay === 0 || currentDay === 6) {
		addParagraph("list", "It's the weekend :P");
	} else {
		// Make an Ajax request to load data from a local json file.	
		let url = "labs.json"; 
		var labRequest = new XMLHttpRequest();
		labRequest.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				rooms = []; // yes, it's global 
				var roomsJ = JSON.parse(this.responseText);
				fillRooms(roomsJ);
				doIt();
			}
		};
		labRequest.open("GET", url, true);
		labRequest.send();
	}
})();