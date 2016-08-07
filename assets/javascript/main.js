var 
starterDeck = ["Rick and Morty", "Family Guy", "Bob's Burgers", "The Simpsons", "American Dad"],
addDeck = [],
limit = 25;

//check for items in local storage
if (localStorage.getItem("addDeck")) {
	addDeck = JSON.parse(localStorage.getItem("addDeck"));
}

function init() {
	//combines starterDeck and addDeck
	var comboDeck = starterDeck.concat(addDeck);

	//creates buttons
	for (var i = 0; i < comboDeck.length; i++) {
		createButton(comboDeck[i]);
	}

	//focus on text input field
	$("#search").focus();
}

function createButton(text) {
	//random button color generator
	var colorValues = [];
	for (var i = 0; i < 3; i++) {
		var colorRandom = Math.floor(Math.random() * 255);
		colorValues.push(colorRandom);
	}

	var r = colorValues[0];
	var g = colorValues[1];
	var b = colorValues[2];

	var btn = $("<button>");

	//trying to detect if background color is dark, not good
	var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	var brightness = (r + b + g)/3;
	if (luma < 30)
		btn.css("color", "white");

	btn.addClass("btn btn-default searchBtn")
		.text(text)
		.appendTo(".buttonsHere")
		.css("background", "rgb(" + r + ", " + g + ", " + b + ")");

}

//when submit is pressed or enter key hit
function addItem() {
	//get search value and limit
	var searchTerm = $("#search").val();
	limit = $("#limit").val();

	//prevent empty string check
	if (searchTerm) {
		createButton(searchTerm);

		//add search to addDeck and store in local storage
		addDeck.push(searchTerm);
		localStorage.setItem("addDeck", JSON.stringify(addDeck));

		//empty search text field and focus
		$("#search").val("").focus();
	}
}

function fetchGiphy() {
	//$(this) refers to the button clicked
	//set search term to button text
	q = $(this).text();
	url = "https://api.giphy.com/v1/gifs/search?"
	//Jquery param function parses object into string for url
	url += $.param({
		'q': q,
		'limit': limit,
		'api_key': 'dc6zaTOxFJmzC',
	});

	$(".gifsHere").empty();

	//search Giphy API
	$.ajax({url: url, method: 'GET'})
		.done(function(response){
			console.log(response.data);
			for (var i = 0; i < response.data.length; i++) {
				// var multiplier = 1;
				// if (i == 4 || i == 9)
				// 	multiplier = 2;

				//create image for each button
				//with states for animated or still
				//and urls for each
				//set as background-image to clip
				var img = $("<img>")
					.addClass("gif")
					.css("background-image", "url(" + response.data[i].images.fixed_height.url + ")");

				//create container for img and add data properties in it
				var imgDiv = $("<div>")
					.addClass("item")
					// .css("width", (250 * multiplier).toString() + "px")
					// .css("height", (250 * multiplier).toString() + "px")
					.attr("data-state", "animated")
					.attr("data-animatedURL", response.data[i].images.fixed_height.url)
					.attr("data-stillURL", response.data[i].images.fixed_height_still.url)
					.attr("data-id", response.data[i].id)
					.attr("data-rating", response.data[i].rating);

				//tried to make a random tile size generator, not good
				var random = Math.floor(Math.random() * 4) + 4;
				if (i !== 0 && i < response.data.length - 5 && i%(2+random) == 0) {
					imgDiv.addClass("width2")
						.addClass("height2")
						.attr("data-animatedURL", response.data[i].images.original.url)
						.attr("data-stillURL", response.data[i].images.original_still.url);

					img.addClass("width2")
						.addClass("height2");
				}

				imgDiv.append(img);
				$(".gifsHere").append(imgDiv);

				//didn't use split or background color
				// var split = 1 - (i / response.data.length);
				$(imgDiv)
					// .css("background-color", "rgba(255, 255, 255, " + split + ")")
					.css("display", "inline-block");
				
			}
			
		}).then(function() {
			//use masonry tile layout
			tileLayout();
		});

		
		
}

function tileLayout() {
	//masonry defined things to do
	$(".gifsHere").imagesLoaded( function(){
			$(".gifsHere").masonry({
				itemSelector: '.item'
			});
			$(".gifsHere").masonry('reloadItems');
			$(".gifsHere").masonry('layout');
		}).on('layoutComplete', function() {
			console.log("worked");
		});
}

//change between animated gif or still image on img click
function toggleState() {
	console.log(this);
	var state = $(this).attr("data-state");
	console.log(state);
	if (state === 'animated') {
		$(this).attr("data-state", "still");
		$(this).children("img").css("background-image", "url(" + $(this).attr("data-stillURL") + ")");
	} else {
		$(this).attr("data-state", "animated");
		$(this).children("img").css("background-image", "url(" + $(this).attr("data-animatedURL") + ")");
	}
}

//create modal window on double click and show id, rating, and full image size
function openModal() {
	var url = $(this).attr("data-animatedURL");
	var id = $(this).attr("data-id");
	var rating = $(this).attr("data-rating");
	$(".modal-title").html("ID: " + id + ", Rating: " + rating);
	$(".modal_img").attr("src", url);
	
	//open modal window
	$("#myModal").modal("toggle");
}

$("#submit").on('click', addItem);

//added enter key submit functionality (optional)
$("#search").keypress(function(event) {
    if (event.which == 13) {
        // event.preventDefault();
        addItem();
        return false;
    }
});

//reset buttons to original starterDeck and clears storage
$("#reset").on('click', function() {
	localStorage.clear();
	addDeck = [];
	limit = 25;
	$(".buttonsHere").empty();
	for (var i = 0; i < starterDeck.length; i++) {
		createButton(starterDeck[i]);
	}
	$("#search").focus();
});

//add event handler whenever new button or img is added
$(document).on('click', '.searchBtn', fetchGiphy);
$(document).on('click', '.item', toggleState);
$(document).on('dblclick', '.item', openModal);

$(document).ready(init);
