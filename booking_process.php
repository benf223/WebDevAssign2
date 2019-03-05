<?php

require("../../conf/settings.php");

$conn = mysqli_connect($host, $user, $password);

if ($conn)
{
	if (!mysqli_select_db($conn, $dbnm))
	{
		$ptr = mysqli_query($conn, "CREATE DATABASE $dbnm;");

		mysqli_free_result($ptr);
		mysqli_select_db($conn, $dbnm);
	}

	$ptr = mysqli_query($conn, 'SELECT referencenumber FROM bookings;');

	if (empty($ptr))
	{
		mysqli_query($conn, "CREATE TABLE bookings (bookingname VARCHAR(50), phone VARCHAR(15), pickupunitnumber VARCHAR(5), pickupstreetnumber VARCHAR(5), pickupstreetname VARCHAR(50), pickupsuburb VARCHAR(50), destsuburb VARCHAR(50), pickupdate VARCHAR(20), pickuptime VARCHAR(20), referencenumber INT AUTO_INCREMENT PRIMARY KEY, bookingdate VARCHAR(20), bookingtime VARCHAR(20), bookingstatus VARCHAR(20));");
	}

	mysqli_free_result($ptr);

	if (isset($_POST["data"]))
	{
		echo "yes";
		$data = $_POST["data"];
		$data = json_decode($data);

		addBooking($conn, $data);
	}

	if (isset($_GET["getbookings"]))
	{
		retrieveBookings($conn);
	}

	if (isset($_GET["assignbooking"]))
	{
		$reference = $_GET["assignbooking"];

		assignBooking($conn, $reference);
	}
}
else
{
	echo "Connection Error";
}

function addBooking($conn, $data)
{
	$funassigned = "unassigned";
	$fname = $data->name;
	$fphone = $data->phone;
	$funitNo = empty($data->unitno) ? '' : $data->unitno;
	$fstreetNo = $data->streetNo;
	$fstreetName = $data->streetName;
	$fsuburb = $data->suburb;
	$fdestSub = $data->destSub;
	$fpickupdate = $data->pickupdate;
	$fpickuptime = $data->pickuptime;
	$fbookingdate = $data->bookingdate;
	$fbookingtime = $data->bookingtime;

	$query = "INSERT INTO bookings (bookingname, phone, pickupunitnumber, pickupstreetnumber, pickupstreetname, pickupsuburb, destsuburb, pickupdate, pickuptime, bookingdate, bookingtime, bookingstatus)
				VALUES (\"$fname\", \"$fphone\", \"$funitNo\", \"$fstreetNo\", \"$fstreetName\", \"$fsuburb\", \"$fdestSub\", \"$fpickupdate\", \"$fpickuptime\", \"$fbookingdate\", \"$fbookingtime\", \"$funassigned\")";

	mysqli_query($conn, $query);

	$query = "SELECT pickuptime, pickupdate, referencenumber FROM bookings WHERE bookingtime LIKE \"$fbookingtime\" AND bookingdate LIKE \"$fbookingdate\"";

	$ptr = mysqli_query($conn, $query);

	$value = mysqli_fetch_row($ptr);

	$returnData = empty($value)? "{ \"empty\": true }" : "{ \"returnTime\":  \"$value[0]\", \"returnDate\": \"$value[1]\", \"reference\": \"$value[2]\", \"empty\": false }";

	echo $returnData;
}

function retrieveBookings($conn)
{
	$query = "SELECT referencenumber, bookingname, bookingtime, bookingdate, pickuptime, pickupdate, pickupsuburb, phone, bookingstatus FROM bookings";
	$ptr = mysqli_query($conn, $query);

	$output = "{\"data\": [";

	$row = mysqli_fetch_row($ptr);

	while ($row)
	{
		$output = $output . "{\"reference\": \"$row[0]\",
		 \"name\": \"$row[1]\", \"bookingtime\": \"$row[2]\", \"bookingdate\": \"$row[3]\", \"pickuptime\": \"$row[4]\", \"pickupdate\": \"$row[5]\", \"pickupsuburb\": \"$row[6]\", \"phone\": \"$row[7]\", \"bookingstatus\": \"$row[8]\"}";

		$row = mysqli_fetch_row($ptr);

		if ($row)
			$output = $output . ', ';
	}

	$output = $output . "]}";

	echo $output;
}

function assignBooking($conn, $reference)
{
	$query = "SELECT bookingname FROM bookings WHERE referencenumber = $reference";

	$ptr = mysqli_query($conn, $query);

	if (empty($ptr))
	{
		$output = "{\"updated\": \"Reference number: $reference doesn't exist\"}";
	}
	else
	{
		$output = "{\"updated\": \"Reference number: $reference has been assigned\"}";

		$query = "UPDATE bookings SET bookingstatus=\"assigned\" WHERE referencenumber = $reference";

		mysqli_query($conn, $query);
	}

	echo $output;
}