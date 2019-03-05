function connect()
{
	var xhr;

	if (window.XMLHttpRequest)
	{
		xhr = new XMLHttpRequest();
	}
	else if (window.ActiveXObject)
	{
		xhr = new ActiveXObject("Microsoft.XMLHTTP");
	}

	return xhr;
}

//debug
function logText(text)
{
	console.log(text);
}

function getDate()
{
	var date = new Date();
	//need to check that this works in the afternoon evening
	date.setTime(date.getTime() - date.getTimezoneOffset() * 60000);

	return date.toISOString().substring(0, 10);
}

function getTime()
{
	var date = new Date();
	return date.toTimeString().slice(0, 5);
}

function submitData()
{
	var accepted = true;
	var name = document.getElementById('namelabel').value;
	var phone = document.getElementById('phonelabel').value;
	var destsub = document.getElementById('destsuburblabel').value;
	var pupunitno = document.getElementById('unitnolabel').value;
	var pupstreetno = document.getElementById('streetnolabel').value;
	var pupstreetname = document.getElementById('streetnamelabel').value;
	var pupsuburb = document.getElementById('pickupsuburblabel').value;
	var date = document.getElementById('date').value;
	var time = document.getElementById('time').value;

	if (name)
	{
		document.getElementById('namelabel').setAttribute('class', 'form-control border-success');
	}
	else
	{
		document.getElementById('namelabel').setAttribute('class', 'form-control border-danger');
		accepted = false;
	}

	if (phone)
	{
		document.getElementById('phonelabel').setAttribute('class', 'form-control border-success');
	}
	else
	{
		document.getElementById('phonelabel').setAttribute('class', 'form-control border-danger');
		accepted = false;
	}

	if (destsub)
	{
		document.getElementById('destsuburblabel').setAttribute('class', 'form-control border-success');
	}
	else
	{
		document.getElementById('destsuburblabel').setAttribute('class', 'form-control border-danger');
		accepted = false;
	}

	if (pupunitno)
	{
		document.getElementById('unitnolabel').setAttribute('class', 'form-control border-success');
	}

	if (pupstreetno)
	{
		document.getElementById('streetnolabel').setAttribute('class', 'form-control border-success');
	}
	else
	{
		document.getElementById('streetnolabel').setAttribute('class', 'form-control border-danger');
		accepted = false;
	}

	if (pupstreetname)
	{
		document.getElementById('streetnamelabel').setAttribute('class', 'form-control border-success');
	}
	else
	{
		document.getElementById('streetnamelabel').setAttribute('class', 'form-control border-danger');
		accepted = false;
	}

	if (pupsuburb)
	{
		document.getElementById('pickupsuburblabel').setAttribute('class', 'form-control border-success');
	}
	else
	{
		document.getElementById('pickupsuburblabel').setAttribute('class', 'form-control border-danger');
		accepted = false;
	}

	if (date && time)
	{
		var dateSplit = date.split('-');
		var timeSplit = time.split(':');
		var dateTime = new Date(Number(dateSplit[0]), Number(dateSplit[1]) - 1, Number(dateSplit[2]), Number(timeSplit[0]), Number(timeSplit[1]), 59, 999);

		if (dateTime.valueOf() >= new Date().valueOf())
		{
			document.getElementById('date').setAttribute('class', 'form-control border-success');
			document.getElementById('time').setAttribute('class', 'form-control border-success');
		}
		else
		{
			document.getElementById('time').setAttribute('class', 'form-control border-danger');
			document.getElementById('date').setAttribute('class', 'form-control border-danger');
			accepted = false;
		}
	}
	else if (!time)
	{
		document.getElementById('time').setAttribute('class', 'form-control border-danger');
		accepted = false;
	}
	else if (!date)
	{
		document.getElementById('date').setAttribute('class', 'form-control border-danger');
		accepted = false;
	}

	var currentTime = new Date();

	if (accepted)
	{
		var data =
			{
				name: name,
				phone: phone,
				destSub: destsub,
				unitNo: pupunitno ? pupunitno : '',
				streetNo: pupstreetno,
				streetName: pupstreetname,
				suburb: pupsuburb,
				pickuptime: dateTime.toLocaleString('en-GB').split(', ')[1].slice(0, 5),
				pickupdate: dateTime.toLocaleString('en-GB').split(', ')[0],
				bookingtime: currentTime.toLocaleString('en-GB').split(', ')[1].slice(0, 5),
				bookingdate: currentTime.toLocaleString('en-GB').split(', ')[0]
			};

		postNewBookingData(data);
	}
}

function postNewBookingData(data)
{
	var xhr = connect();

	var target = 'booking_process.php';
	var replace = "output";

	if (xhr)
	{
	    replace = document.getElementById(replace);

	    xhr.open("POST", target, true);
	    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    //xhr.send("data=" + data);
		xhr.send("data=" + JSON.stringify(data));

	    xhr.onreadystatechange = function onStateChange()
	    {
	        if (xhr.readyState == 4 && xhr.status == 200)
	        {
	        	var res = JSON.parse(xhr.responseText);

				if (res.empty)
				{
					replace.innerHTML = "<b>Error</b>";
				}
				else
				{
					replace.innerHTML = "<b>You will be picked up at " + res.returnTime + " on the " + res.returnDate + ". Your booking number is: " + res.reference + ".</b>";
				}
	        }
	    };
	}
	else
	{
	    alert('Failed to add booking');
	}
}

function assignBooking(referenceNumber)
{
	var xhr = connect();

	var target = 'booking_process.php';

	if (xhr)
	{
		xhr.open("GET", target + "?assignbooking=" + referenceNumber, true);

		xhr.onreadystatechange = function onStateChange()
		{
			if (xhr.readyState == 4 && xhr.status == 200)
			{
				console.log(xhr.responseText);
				var res = JSON.parse(xhr.responseText);

				if (res.empty)
				{
					alert('Error assigning reference number: ' + referenceNumber);
				}
				else
				{
					var updated = res.updated;
					alert(updated);

					if (document.getElementById("requestButton").disabled && updated.includes('assigned'))
					{
						document.getElementById("bookings").innerHTML = '';

						retrieveBookingsData();
					}
				}
			}
		};

		xhr.send(null);
	}
	else
	{
		alert('Failed to update booking');
	}
}

function retrieveBookingsData()
{
	var xhr = connect();

	var target = 'booking_process.php';
	var replace = "bookings";

	if (xhr)
	{
		replace = document.getElementById(replace);

		xhr.open("GET", target + "?getbookings=yes", true);

		xhr.onreadystatechange = function onStateChange()
		{
			if (xhr.readyState == 4 && xhr.status == 200)
			{
				var res = JSON.parse(xhr.responseText);

				if (res.empty)
				{
					alert('Error with request');
				}
				else
				{
					var data = res.data;

					createHeaders(replace);

					data.forEach(function (element){
						appendRow(replace, element.reference, element.name, element.bookingtime, element.bookingdate, element.pickuptime, element.pickupdate, element.pickupsuburb, element.phone, element.bookingstatus);
					});

					document.getElementById("requestButton").disabled = true;
				}
			}
		};

		xhr.send(null);
	}
	else
	{
		alert('Failed to retrieve bookings');
	}

}

function createHeaders(table)
{
	var container = document.createElement('thead');
	// container.setAttribute('class', 'thead-dark');

	var newRow = document.createElement('tr');
	var headers = document.createElement('th');
	var header = document.createTextNode('Reference Number');

	headers.appendChild(header);
	newRow.appendChild(headers);

	headers = document.createElement('th');
	header = document.createTextNode('Name');

	headers.appendChild(header);
	newRow.appendChild(headers);

	headers = document.createElement('th');
	header = document.createTextNode('Booking Time');

	headers.appendChild(header);
	newRow.appendChild(headers);

	headers = document.createElement('th');
	header = document.createTextNode('Booking Date');

	headers.appendChild(header);
	newRow.appendChild(headers);

	headers = document.createElement('th');
	header = document.createTextNode('Pickup Time');

	headers.appendChild(header);
	newRow.appendChild(headers);

	headers = document.createElement('th');
	header = document.createTextNode('Pickup Date');

	headers.appendChild(header);
	newRow.appendChild(headers);

	headers = document.createElement('th');
	header = document.createTextNode('Pickup Suburb');

	headers.appendChild(header);
	newRow.appendChild(headers);

	headers = document.createElement('th');
	header = document.createTextNode('Phone');

	headers.appendChild(header);
	newRow.appendChild(headers);

	headers = document.createElement('th');
	header = document.createTextNode('Status');

	headers.appendChild(header);
	newRow.appendChild(headers);

	container.appendChild(newRow);
	table.appendChild(container);
}

function appendRow(table, referenceNumber, name, bookingTime, bookingDate, pickupTime, pickupDate, pickupSuburb, phone, bookingStatus)
{
	var tBody = document.createElement("TBODY");
	table.appendChild(tBody);

	var newRow = document.createElement("tr");
	var column = document.createElement("td");
	var text = document.createTextNode(referenceNumber);

	column.appendChild(text);
	newRow.appendChild(column);

	column = document.createElement("td");
	text = document.createTextNode(name);

	column.appendChild(text);
	newRow.appendChild(column);

	column = document.createElement("td");
	text = document.createTextNode(bookingTime);

	column.appendChild(text);
	newRow.appendChild(column);

	column = document.createElement("td");
	text = document.createTextNode(bookingDate);

	column.appendChild(text);
	newRow.appendChild(column);

	column = document.createElement("td");
	text = document.createTextNode(pickupTime);

	column.appendChild(text);
	newRow.appendChild(column);

	column = document.createElement("td");
	text = document.createTextNode(pickupDate);

	column.appendChild(text);
	newRow.appendChild(column);

	column = document.createElement("td");
	text = document.createTextNode(pickupSuburb);

	column.appendChild(text);
	newRow.appendChild(column);

	column = document.createElement("td");
	text = document.createTextNode(phone);

	column.appendChild(text);
	newRow.appendChild(column);

	column = document.createElement("td");
	text = document.createTextNode(bookingStatus);

	column.appendChild(text);
	newRow.appendChild(column);

	tBody.appendChild(newRow);
}