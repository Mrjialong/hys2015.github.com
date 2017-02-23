function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}
function renderingNowWeatherInfo(cname, degree, condi, condi_code, dir, sc){
	document.getElementById("cname").innerHTML = cname;
	document.getElementById("degree").innerHTML = degree;
	document.getElementById("condi").innerHTML = condi;
	var imgurl = "http://files.heweather.com/cond_icon/" + condi_code + ".png";
	document.getElementById("condi-img").src = imgurl;
	document.getElementById("winddir").innerHTML = dir;
	document.getElementById("windsc").innerHTML = sc;

}
function nowInfoHandler(){
	var xhr = this;
	var text = JSON.parse(xhr.responseText);
	var weatherInfo = text.HeWeather5[0];
	var cname = weatherInfo.basic.city;
	var degree = weatherInfo.now.tmp;
	var condi = weatherInfo.now.cond.txt;
	var condi_code = weatherInfo.now.cond.code;
	var dir = weatherInfo.now.wind.dir;
	var sc = weatherInfo.now.wind.sc + '级';
	renderingNowWeatherInfo(cname, degree, condi, condi_code, dir, sc);
}
var errorHandler = function() {
	alert('啊哦，天气插件出了点状况，不影响您的浏览');
};
//Core Func
function getWeatherInfo(api, eventHandlerFunc){
	var cityname = 'beijing'
	cityname = returnCitySN['cname'];
	var url = 'https://free-api.heweather.com/v5/'+api+'?city='+ cityname + '&key=f45e249ccc4c42e58fc5f733d1f250bd'
	var xhr = createCORSRequest("GET", url);
	if (!xhr) {
	  throw new Error('CORS not supported');
	}
	// Response handlers.
	xhr.onload = eventHandlerFunc;
	xhr.onerror = errorHandler;
	xhr.send();
}
function getAndRenderNowWeatherInfo(){
	getWeatherInfo("now", nowInfoHandler);
}
function renderForecastInfo(foreCastInfo){
	var forecastPanel = document.getElementById("forecast");
	var days = ['今天', '明天', '后天'];
	for(var i = 0; i < 3; ++i){
		var newp = document.createElement("p");
		var dayiInfo = foreCastInfo.daily_forecast[i];
		newp.innerHTML = days[i] + ' ' + dayiInfo.cond.txt_d;
		var condi_img = document.createElement("img");
		var condi_code = dayiInfo.cond.code_d;
		condi_img.src = "http://files.heweather.com/cond_icon/" + condi_code + ".png";
		condi_img.className = "condi-img"
		newp.appendChild(condi_img);
		var tmp_txt = document.createTextNode(dayiInfo.tmp.min + '°C~ ' + dayiInfo.tmp.max + '°C ');
		newp.appendChild(tmp_txt);
		forecastPanel.appendChild(newp);
	}
}
function forecastInfoHandler(){
	var xhr = this;
	var text = JSON.parse(xhr.responseText);
	var weatherInfo = text.HeWeather5[0];
	renderForecastInfo(weatherInfo);
}
function getAndRenderForcastWeatherInfo(){
	getWeatherInfo("forecast", forecastInfoHandler);
}
function hys_Weather(){
	getAndRenderNowWeatherInfo();
	getAndRenderForcastWeatherInfo();
}
