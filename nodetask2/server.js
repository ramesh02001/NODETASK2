const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // For generating unique booking IDs

const app = express();
app.use(bodyParser.json());

let rooms = [];
let bookings = [];

// 1. Create a Room
app.post('/rooms', (req, res) => {
    const { roomName, seatsAvailable, amenities, pricePerHour } = req.body;
    
    if (!roomName || !seatsAvailable || !amenities || !pricePerHour) {
        return res.status(400).json({ message: "All room details must be provided." });
    }

    const newRoom = {
        id: uuidv4(),
        roomName,
        seatsAvailable,
        amenities,
        pricePerHour,
        bookings: []
    };

    rooms.push(newRoom);
    res.status(201).json({ message: "Room created successfully", room: newRoom });
});

// 2. Book a Room
app.post('/bookings', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;

    if (!customerName || !date || !startTime || !endTime || !roomId) {
        return res.status(400).json({ message: "All booking details must be provided." });
    }

    const room = rooms.find(room => room.id === roomId);
    if (!room) {
        return res.status(404).json({ message: "Room not found." });
    }

    const newBooking = {
        bookingId: uuidv4(),
        customerName,
        date,
        startTime,
        endTime,
        roomId
    };

    bookings.push(newBooking);
    room.bookings.push(newBooking);

    res.status(201).json({ message: "Room booked successfully", booking: newBooking });
});

// 3. List all Rooms with Booked Data
app.get('/rooms', (req, res) => {
    const roomData = rooms.map(room => ({
        roomName: room.roomName,
        bookings: room.bookings.map(booking => ({
            customerName: booking.customerName,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime
        }))
    }));

    res.status(200).json(roomData);
});

// 4. List all customers with Booked Data
app.get('/customers', (req, res) => {
    const customerData = bookings.map(booking => ({
        customerName: booking.customerName,
        roomName: rooms.find(room => room.id === booking.roomId).roomName,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime
    }));

    res.status(200).json(customerData);
});

// 5. List how many times a customer has booked the room
app.get('/customer/:customerName', (req, res) => {
    const { customerName } = req.params;

    const customerBookings = bookings.filter(booking => booking.customerName === customerName);

    if (customerBookings.length === 0) {
        return res.status(404).json({ message: "No bookings found for this customer." });
    }

    const customerBookingDetails = customerBookings.map(booking => ({
        roomName: rooms.find(room => room.id === booking.roomId).roomName,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookingId: booking.bookingId
    }));

    res.status(200).json({
        customerName,
        totalBookings: customerBookings.length,
        bookings: customerBookingDetails
    });
});

// Starting the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
