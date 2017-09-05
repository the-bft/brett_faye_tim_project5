'use strict';

var app = {};

// call to Teleport autocomplete
app.callTeleport = function () {
	TeleportAutocomplete.init('.my-input').on('change', function (cityData) {
		var latitude = cityData.latitude;
		var longitude = cityData.longitude;
		app.callDarkSky(latitude, longitude);
	});
};

// ajax call to Dark Sky
app.callDarkSky = function (latitude, longitude) {
	var keyDarkSky = 'ecb6e7f16bb182021ecf519d1099721a';
	var weather = $.ajax({
		url: 'https://api.darksky.net/forecast/' + keyDarkSky + '/' + latitude + ',' + longitude + '?units=ca',
		method: 'GET',
		dataType: 'jsonp'
	}).then(function (res) {
		app.currentTemp = Math.round(res.currently.apparentTemperature);
		app.currentIcon = res.currently.icon;
		app.currentWeather = $('<h4>').text(res.currently.summary);
		app.weatherFilter();
	});
};

// a function that filters search results based on currentTemp
app.weatherFilter = function () {
	var foodPicks = [];
	if (app.currentTemp <= 0) {
		app.selectedFoods = ['roast', 'pasta', 'chili', 'pot pie', 'stew', 'winter'];
	} else if (app.currentTemp > 0 && app.currentTemp <= 10) {
		app.selectedFoods = ['soup', 'pizza', 'pumpkin', 'apple', 'slow cooker', 'dumpling', 'spicy', 'autumn'];
	} else if (app.currentTemp > 10 && app.currentTemp <= 20) {
		app.selectedFoods = ['sushi', 'sandwich', 'breakfast', 'brunch', 'fried', 'spring'];
	} else if (app.currentTemp > 20 && app.currentTemp <= 25) {
		app.selectedFoods = ['bbq', 'mexican', 'indian', 'greens', 'curry', 'berries'];
	} else {
		app.selectedFoods = ['salad', 'ice cream', 'cool', 'cucumber', 'summer', 'watermelon'];
	}
};

// function that chooses a random food category
app.randomCategory = function () {
	app.foodChoice = app.selectedFoods[Math.floor(Math.random() * app.selectedFoods.length)];
};

// a function that gathers dietary restrictions and passes them into an array
app.events = function () {
	var allergyRestrict = [];
	var dietRestrict = [];
	$('.userInfo').on('submit', function (e) {
		e.preventDefault();
		app.randomCategory();
		allergyRestrict = $(".allergy:checked").map(function () {
			return $(this).val();
		}).get();
		dietRestrict = $(".diet:checked").map(function () {
			return $(this).val();
		}).get();
		app.callYummly(app.foodChoice, allergyRestrict, dietRestrict);
		$('html, body').animate({
			scrollTop: $('#resultsContainer').offset().top
		}, 2500);
	});
	$('#recipeContainer').on('click', '.saveButton', function (e) {
		e.preventDefault();
		app.saveRecipes();
	});
	$('.ifClicked').click(function () {
		$(this).data('clicked', true);
	});
};

// ajax call to Yummly
app.callYummly = function (foodChoice, allergyRestrict, dietRestrict) {
	var idYummly = '95ec33fc';
	var keyYummly = '2410ab65b1957770177d384fa57c6070';
	var urlYummly = 'https://api.yummly.com/v1/api/recipes';
	var recipeYummly = $.ajax({
		url: urlYummly,
		dataType: 'jsonp',
		method: 'GET',
		data: {
			q: app.foodChoice,
			_app_id: idYummly,
			_app_key: keyYummly,
			allowedAllergy: allergyRestrict,
			allowedDiet: dietRestrict,
			excludedCourse: ["course^course-Cocktails", "course^course-Condiments and Sauces", "course^course-Beverages"]
		}
	}).then(function (res) {
		var recipeMatches = res.matches;
		var recipeChoice = recipeMatches[Math.floor(Math.random() * recipeMatches.length)];
		var recipeId = recipeChoice.id;
		app.callRecipeInfo(recipeId);
	});
};

// a function to call recipe info for selected item
app.callRecipeInfo = function (recipeId) {
	var idYummly = '95ec33fc';
	var keyYummly = '2410ab65b1957770177d384fa57c6070';
	var urlYummly = 'https://api.yummly.com/v1/api/recipe/' + recipeId;
	var recipeYummly = $.ajax({
		url: urlYummly,
		dataType: 'jsonp',
		method: 'GET',
		data: {
			_app_id: idYummly,
			_app_key: keyYummly
		}
	}).then(function (res) {
		app.chooseIcon(res);
	});
};

// a function that chooses an icon to display based on the weather
app.chooseIcon = function (res) {
	app.weatherIcon = {};
	if (app.currentIcon === 'clear-day') {
		app.weatherIcon = $('<img class="weatherIcon">').attr('src', 'dev/assets/clear-day.svg');
	} else if (app.currentIcon === 'clear-night') {
		app.weatherIcon = $('<img class="weatherIcon">').attr('src', 'dev/assets/clear-night.svg');
	} else if (app.currentIcon === 'rain') {
		app.weatherIcon = $('<img class="weatherIcon">').attr('src', 'dev/assets/rain.svg');
	} else if (app.currentIcon === 'snow') {
		app.weatherIcon = $('<img class="weatherIcon">').attr('src', 'dev/assets/snow.svg');
	} else if (app.currentIcon === 'sleet') {
		app.weatherIcon = $('<img class="weatherIcon">').attr('src', 'dev/assets/sleet.svg');
	} else if (app.currentIcon === 'wind') {
		app.weatherIcon = $('<img class="weatherIcon">').attr('src', 'dev/assets/wind.svg');
	} else if (app.currentIcon === 'fog') {
		app.weatherIcon = $('<img class="weatherIcon">').attr('src', 'dev/assets/fog.svg');
	} else if (app.currentIcon === 'cloudy') {
		app.weatherIcon = $('<img class="weatherIcon">').attr('src', 'dev/assets/cloudy.svg');
	} else if (app.currentIcon === 'partly-cloudy-day') {
		app.weatherIcon = $('<img class="weatherIcon">').attr('src', 'dev/assets/partly-cloudy-day.svg');
	} else {
		app.weatherIcon = $('<img class="weatherIcon">').attr('src', 'dev/assets/partly-cloudy-night.svg');
	}
	app.display(res);
};

// a function that displays our information on the page
app.display = function (res) {
	$('#weatherContainer').empty();
	$('#weatherContainer').append(app.weatherIcon);
	$('#weatherContainer').append(app.currentWeather);
	$('#weatherContainer').append('<p>' + app.currentTemp + '&deg;C</p>');
	$('#recipeContainer').empty();
	$('.savedRecipes').empty();
	var selectedImage = $('<img>').attr('src', res.images[0].hostedLargeUrl);
	var selectedName = $('<h2>').text(res.name);
	var selectedTime = $('<h4>').text(res.totalTime);
	var selectedUrl = $('<a>').attr('href', res.source.sourceRecipeUrl).text('Link to full recipe');
	$('#recipeContainer').append(selectedImage, selectedName, selectedTime, selectedUrl);
	res.ingredientLines.forEach(function (ingredient) {
		$('#recipeContainer').append('<p>' + ingredient + '</p>');
	});
	var saveButton = $('<button>').addClass('saveButton').text('Save Recipe');
	$('#recipeContainer').append(saveButton);
	app.selectedRecipe = res;
	$('.savedRecipes').append('<h3>Saved Recipes</h3><ul></ul>');
	app.showSaved();
};

// a function that saves a selected recipe to firebase
var dbRef = firebase.database().ref();
app.saveRecipes = function () {
	var recipeItem = app.selectedRecipe;
	dbRef.push(recipeItem);
};

// a function that shows saved recipes
app.showSaved = function () {
	dbRef.on('value', function (snapshot) {
		var recipeList = snapshot.val();
		$('.savedRecipes ul').empty();
		for (item in recipeList) {
			var recipeName = recipeList[item];
			console.log(recipeName.images[0]);
			$('.savedRecipes ul').append('<li><a class="savedRecipeLink" href="' + recipeName.source.sourceRecipeUrl + '"><div class=savedRecipeItem><p>' + recipeName.name + '</p><img class="savedRecipeImage" src=' + recipeName.images[0].hostedLargeUrl + '></div></a></li>');
		}
	});
};

// General smooth scroll code inspired by: https://css-tricks.com/snippets/jquery/smooth-scrolling/
$('a[href*="#"]')
// Remove links that don't actually link to anything
.not('[href="#"]').not('[href="#0"]').click(function (event) {
	// On-page links
	if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
		// Figure out element to scroll to
		var target = $(this.hash);
		target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
		if (target.length) {
			event.preventDefault();
			$('html, body').animate({
				scrollTop: target.offset().top
			}, 700, function () {
				var $target = $(target);
				$target.focus();
				if ($target.is(":focus")) {
					return false;
				} else {
					$target.attr('tabindex', '-1');
					// Adding tabindex for elements not focusable
					$target.focus(); // Set focus again
				};
			});
		}
	}
});

// a function that initializes our code
app.init = function () {
	app.callTeleport();
	app.events();
};

// document ready
$(app.init);