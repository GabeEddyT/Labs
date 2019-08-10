(() => {
	/** 
	 * jQuery-imitating alias for document.querySelector to condense code a bit.
	 * @returns {HTMLElement} An element matching the query.
	 */
	const $ = (query) => document.querySelector(query);
	/** @returns {HTMLElement} First element with class */
	$.class = (query) => document.getElementsByClassName(query)[0];	
	/** @returns {HTMLElement} Element with ID */
	$.id = (query) => document.getElementById(query);
	/** @returns {HTMLElement} First element of tag */
	$.tag = (query) => document.getElementsByTagName(query)[0];

	// Represent a number (that has a military time value) as a standard time string.	
	Number.prototype.asTime = function () {
		this.time = this % 2400; // Hack to allow earlier later values... that made more sense in my head
		if (this.time < 100) {
			return "12:" + (this.time.valueOf() + "").padStart(2, "0") + " AM";
		} else if (this.time == 2400) {
			return "12:00 AM";
		} else if (this.time >= 1300) {
			let num = this.time.valueOf();
			num = num - 1200;
			let time = Math.trunc(num / 100) + ":" + (num % 100 + "").padStart(2, "0") + " PM";
			return time;
		} else if (this.time >= 1200) {
			return "12:" + (this.time % 100 + "").padStart(2, "0") + " PM";
		} else {
			let num = this.time.valueOf();
			return Math.trunc(num / 100) + ":" + (num % 100 + "").padStart(2, "0") + " AM";
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

	// Convert String to military time Number.
	String.prototype.toMilitary = function () {
		const parts = this.split(":");
		let time = parseInt(parts[0] + parts[1], 10);
		
		if (parts[0] == "12"){ 
			if(this.toUpperCase().includes("AM")){
				time -= 1200;
			}
		}else if (this.toUpperCase().includes("PM")) {
			time += 1200;
		}
		return time;
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
	// Members include the name, day-array, and a link, that a future Gabe has deprecated.
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
	function addParagraph(divId, content, pId, href, style, pClass, tag = "p") {
		let para = document.createElement(tag);
		if (href) {
			var link = document.createElement("a");
			link.innerHTML = content;
			link.href = href;
			pClass ? link.className = pClass : null;
			pId ? link.id = pId + "-link" : null;
			para.appendChild(link);
		} else {
			para.innerHTML = content;
		}
		
		pId ? para.id = pId : null;
		style ? para.style = style : null;
		pClass ? para.classList.add(pClass) : null;
		let div = document.getElementById(divId);
		return div.appendChild(para);
	}

	/**
	 * Element builder class to hopefully deprecate `addParagraph`.
	 * Complete with a host of chain methods so we can truly "daisychain these things".
	 */
	class Para{
		/**
		 * Calls `document.createElement` with the given tag.
		 * @param {string} tag The type of element to create.
		 * @param {boolean} literal If true, `append` will append given strings as they are, instead of trying to inject raw HTML into the DOM.
		 */
		constructor(tag = "p", literal = false){
			/**
			 * Specifies how raw HTML strings are appended.  
			 * @type {boolean} 
			 */
			this.literal = literal;
			/** 
			 * The actual DOM element being manipulated. 
			 * @type {HTMLElement}
		     */
			this.element = document.createElement(tag);
		}

		/**
		 * @param {string} id A unique ID to give the element. 
		 */
		id(id){			
			this.element.id = id;
			return this;
		}

		/**
		 * Appends this `Para` to a parent node.
		 * @param {HTMLElement | string} parent A parent element or ID.
		 */
		parent(parent){
			parent.appendChild(this.element) || $.id(parent).appendChild(this.element);
			return this;
		}

		/** @param { ...(HTMLElement | Para | string)} children One or more elements to append. */
		append(...children){
			for(let child of children){
				if(typeof child == "string" && !this.literal){
					this.raw(child);
				}else{
					child.hasOwnProperty("raw") ? this.raw(child.raw) : 
						this.element.append(child.element || child);
				}
			};
			return this;
		}

		/**
		 * Add classes to `classList`.
		 * @param  {...string} name One or more class names.
		 */
		class(...name){
			this.element.classList.add(...name);
			return this;
		}

		/**
		 * Adds an href to (hopefully) an anchor tag.
		 * @param {string} href String containing href.
		 */
		href(href){
			this.element.href = href;
			return this;
		}
		
		/**
		 * Appends raw html. Handles tags, `&nbsp;`, `&rsquo;`, `&mdash;` and the like.
		 * Used in `append` by default unless `Para.literal` is true.
		 * @param {string} html String containing raw html.
		 * @example 
		 * // Helpful for rich text tags which would be counterproductive to write out as
		 * new Para().append("I ", new Para("strong").append("don't"), " speak ", new Para("em").append("I T A L I C S"), ".")
		 * // instead of
		 * new Para().raw("I <strong>don't</strong> speak <em>I T A L I C S</em>.")
		 */
		raw(html){
			this.element.insertAdjacentHTML("beforeend", html);
			return this;
		}

		/**
		 * Add styles to element based on object properties.
		 * @template Property, Value
		 * @param {...{Property: Value}} styles Object(s) containing CSS properties and values.
		 * @param {Property | string} styles.Property CSS property to change
		 * @param {string} styles.Value Value to assign property
		 * @example 		 
		 * // This ludicrously long style chain containing three objects 
		 * // with differing amounts of properties
		 * new Para("table").append("yes").parent(document.body)
		 * .style({color: "yellow", "z-index": 40}, // (two properties)
		 * {"line-height": 2, "font-size":`${54}pt`, "font-family": "Orkney Medium Italic", "--custom-color-rating": "favourite"}, // (four properties)
		 * {cursor: "help"}); // (single property)
		 * 
		 * // could also have styles applied from a single object 
		 * // with eight properties
		 * new Para("table").append("yes").parent(document.body)
		 * .style({color: "yellow", "z-index": 40, "line-height": 2, "font-size":`${54}pt`, "font-family": "Orkney Medium Italic", "--custom-color-rating": "favourite", cursor: "help"}); 
		 * 
		 * // Either method results in this DOM element
		 * <table style="color: yellow; z-index: 40; line-height: 2; font-size: 54pt; font-family: 'Orkney Medium Italic'; --custom-color-rating:favourite; cursor: help;">yes</table>
		 * 
		 * // Though you should probably be using a class 
		 * // if you have this much styling to do. 
		 * // Probably.
		 */
		style(...styles){
			for (let props of styles){
				for (let prop in props){
					this.element.style.setProperty(prop, props[prop]);
				}
			}
			return this;
		}
	}	

	// Grab a query string.
	function getQueryString(field) {
		return new URLSearchParams(document.location.search).get(field);
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
			let timeslot;
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
			let timeslot;
			if (timeslot = occupiedRooms[i].days[(currentDay - 1)].nextOpen(time)) {
				if (compareTime(timeslot.start, time) <= howSoon) {					
					let name = occupiedRooms[i].name;
					let description = occupiedRooms[i].description;
					let tier = occupiedRooms[i].tier;
					let para = addParagraph("list", `${occupiedRooms[i].name} (${timeslot.range}) [${compareTime(timeslot.start, time).toHours()}]`, occupiedRooms[i].name, false, "text-align: center", pClass);
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
		const capitalizedDay = `<span class="capitalized">${dayMap[currentDay - 1]}</span>`;
		addParagraph("list", `On ${capitalizedDay}s at ${currentTime.asTime()}, the following labs are free:`, "current");
		checkRooms(currentTime);

		// Change text if there are no open rooms.
		if (occupiedRooms.length == rooms.length) {
			document.getElementById("current").innerHTML = 
				`No labs are open on ${capitalizedDay}s at ${currentTime.asTime()}.`;
		}

		addParagraph("current", '†', false, false, false, false, "sup");

		// List occupiedRooms soon to be open.
		if (occupiedRooms.length > 0) {
			addParagraph("list", "These labs will be free soon:", "soon-15");
			let tempLength = occupiedRooms.length;
			occupiedRooms = checkSoon(currentTime, 15, "soonlist");

			// Get rid of text if there are no labs available in 15 minutes.
			if (tempLength == occupiedRooms.length) {				
				let child = document.getElementById("soon-15");
				child.parentNode.removeChild(child);
			}
			// List rooms available in an hour.
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
		addParagraph("list", "", "footnote1");
		addParagraph("footnote1", '†', false, false, false, false, "sup");
		document.getElementById("footnote1").innerHTML += "(open period indicated in parentheses)";
		addParagraph("list", "[time left in period, or time left until a new one begins, indicated in braces]", "footnote2");
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
		const view = $.class("wrapper");
		const list = $.id("list");
		const tierMain = $.id("tier-main");
		const tierExtra = $.id("tier-extra");
		const title = $(".view h1");
		const body = $(".view p");
		const close = $.class("close");
		
		tierExtra.innerHTML = tier.extra;
		tierMain.innerHTML = tier.main;		
		close.style.pointerEvents = "auto";
		title.innerHTML = name;
		body.innerHTML = description;
		
		const origin = $.id(name);
		hideView.origin = origin;
		
		view.style.setProperty("--offset", origin.getBoundingClientRect().top * 2 - view.getBoundingClientRect().height + "px");
		view.classList.remove("y-animated");		

		// Wrapping this in another `requestAnimationFrame` because Firefox loves racing.
		window.requestAnimationFrame(() => {
			window.requestAnimationFrame(() => view.classList.add("y-animated"));
			window.requestAnimationFrame(() => {
				view.classList.remove("hidden");
				list.classList.add("hidden");
			});
		});
		

		setTimeout(() => showExtra() && shake(), 200);
	}

	// Fade out view and fade in main site
	function hideView(){		
		const view = $.class("wrapper");
		const list = $.id("list");
		const close = $.class("close");

		const origin = hideView.origin;
		view.style.setProperty("--offset", origin.getBoundingClientRect().top * 2 - view.getBoundingClientRect().height + "px");

		close.style.pointerEvents = "none";

		list.classList.remove("hidden");
		view.classList.add("hidden");
	}

	// Hide the view on clicking the X button
	$.class("close").addEventListener("click", () => {
		hideView();
	});

	// Hide the view on clicking outside
	$.class("wrapper").addEventListener("transitionend", () => {
		if(window.getComputedStyle($.class("wrapper")).opacity == 1){
			document.addEventListener("click", handleClick);
		}else{
			document.removeEventListener("click", handleClick); 
		}
	});	

	const showExtra = () => $.id("tier-extra").style.left == "-100%";

	// Toggle tier visibility, triggering animations.
	$.class("tier").onclick = () => {
		$.id("tier-extra").style.left = showExtra() ? "0%" : "-100%"; 
		if (!showExtra()) {
			$.id("tier-container").style.width = "auto";
			$.id("tier-main").style.transform = "rotate(-360deg)";
		}else{
			let icon = $.id("tier-main");
			icon.style.transform = "rotate(0deg)";	
		}
	};

	// Set width for tier so that it isn't clickable when hidden.
	$.id("tier-extra").addEventListener("transitionend", () =>{
		$.id("tier-container").style.width = showExtra() ? "0" : "auto";
	});

	// Hide the view on hitting escape
	window.onkeyup = (key) => {
		if(key.keyCode === 27){
			hideView();
		}
	}
	
	const shaker = $.id("tier-shake");
	let shaking = false;
	shaker.onmouseover = () => shaking || shake(3, 10);

	// Shake tier icon when view revealed.
	function shake(limit = 4, degrees = 15){
		shaking = true;
		for(let i = 0; i <= limit; i++){
			setTimeout(() => {shaker.style.transform = 
					// negate on odds
					`rotate(${(i & 1 && "-") + degrees * ((limit - i) / limit)}deg)`;
					limit === i && (shaking = false)}, 
				100 * i
			);
		}
	}
	
	
	function handleClick(event){
		if(!event.target.closest(".view")){
			hideView();
			document.removeEventListener("click", handleClick);
		}
	}

	$(".wrapper").style = null;

	let occupiedRooms = [];

	// Map for getting number values of days (-1).	
	const dayMap = ["monday", "tuesday", "wednesday", "thursday", "friday"];

	// Let custom day be assigned in querystring.
	const dayQuery = getQueryString('day') || NaN; // using NaN here, because *apparently* null >= 0 is true.
	
	const aDay = dayQuery && (parseInt(dayQuery, 10) || dayMap.indexOf(dayQuery.toLowerCase()) + 1);

	const currentDay = aDay >= 0 && aDay <= 6 ? aDay : (new Date()).getDay();
	
	// Let custom time be assigned in querystring.
	const timeQuery = getQueryString('time') || "";
	let aTime = timeQuery.includes(":") ? timeQuery.toMilitary() : parseInt(timeQuery, 10);
	
	let currentTime = aTime >= 0 && aTime < 2400 && aTime % 100 < 60 ? aTime : getCurrentTime();

	if (currentDay === 0 || currentDay === 6) {
		$.id("weekend").style.display = "unset";
	} else {
		// Make an Ajax request to load data from a local json file.	
		let url = "labs.json"; 
		let labRequest = new XMLHttpRequest();
		var rooms = []; // yes, it's (less) global 
		labRequest.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let roomsJ = JSON.parse(this.responseText);
				fillRooms(roomsJ);
				doIt();
			}
		};
		labRequest.open("GET", url, true);
		labRequest.send();
	}
})();