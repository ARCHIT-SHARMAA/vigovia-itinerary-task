import { useState, useRef, Fragment } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './App.css';
// LOGO IMPORT REMOVED TO RESOLVE VITE CRASH
// We use a text placeholder instead.

function App() {
  const [formData, setFormData] = useState({
    // --- CONTROL STATE ---
    travelType: 'International', // NEW: 'Domestic' or 'International'
    
    // --- EMPTY FIELDS FOR USER INPUT (All mandatory global details here) ---
    name: '', 
    phone: '', 
    email: '',
    destination: '',
    startDate: '', // Departure Date
    endDate: '',   // Arrival Date
    travellers: 1, // Default to 1, user can change
    nights: 4,
    
    // --- ALL ARRAY DATA STARTS EMPTY ---
    flightBookings: [], 
    hotelBookings: [],
    activityPlans: [],
    activityTable: [],
    inclusionSummary: [], 
    importantNotes: [], 
    serviceScope: [], 
    paymentPlan: [], 
    
    // --- Payment Data (must be added/edited by user) ---
    totalAmount: '₹ 0.00', // Default visual value
    tcsCollected: 'N/A',
    visaType: '',
    visaValidity: '',
    visaProcessingDate: '',
  });

  const itineraryRef = useRef();
  // New variable to simplify conditional checks
  const isInternational = formData.travelType === 'International';

  // --- Utility Functions ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special handler for the domestic/international toggle switch
    if (name === 'travelType') {
        setFormData({ ...formData, [name]: value });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleTableArrayChange = (e, arrayName, index, fieldName) => {
    const newArray = [...formData[arrayName]];
    if (newArray[index]) { // Safely check if the element exists
        newArray[index][fieldName] = e.target.value;
        setFormData({ ...formData, [arrayName]: newArray });
    }
  };

  const handleAddRow = (arrayName, defaultObject) => {
    setFormData({
      ...formData,
      [arrayName]: [...formData[arrayName], defaultObject],
    });
  };
  
  // Handles deleting a row from an array state
  const handleDeleteRow = (arrayName, index) => {
    const newArray = formData[arrayName].filter((_, i) => i !== index);
    setFormData({
      ...formData,
      [arrayName]: newArray,
    });
  };


  // Convert date format from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };
  
  // --- PDF GENERATION ---
  const handleGeneratePdf = () => {
    const input = itineraryRef.current;
    if (input) {
      setTimeout(() => {
        // Use a higher scale and useCORS for better image quality and handling placeholders
        html2canvas(input, { scale: 3, useCORS: true }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgWidth = 210;
          const pageHeight = 297;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save('vigovia-itinerary.pdf');
        });
      }, 500);
    }
  };

  // Custom Daily Itinerary Component (Replicating the Figma visual timeline)
  const DailyItinerary = ({ day, date, city, morning, afternoon, evening }) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'long' });
    // Using Picsum for better visual realism and uniqueness per day
    const imagePlaceholder = `https://picsum.photos/seed/${day * 10}/100/100`;

    return (
      <div className="flex mb-8 items-start">
          {/* Day Label (Dark Purple Sidebar) */}
          <div className="w-16 flex-shrink-0 bg-indigo-900 rounded-l-lg flex flex-col items-center justify-center text-white font-bold text-xl p-2 min-h-[150px]">
              <span className="text-sm">Day</span>
              {day}
          </div>
          
          {/* Content Card */}
          <div className="flex-grow bg-white p-4 rounded-r-lg shadow-lg border-t border-r border-b border-gray-200 hover:shadow-xl transition-shadow duration-300">
              {/* Header and Image */}
              <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={imagePlaceholder} onError={(e) => e.target.src='https://placehold.co/100x100/A387E9/ffffff?text=Image'} alt={`Day ${day} in ${city}`} className="w-full h-full object-cover"/>
                  </div>
                  <div className='flex flex-col'>
                      <h4 className="text-sm text-gray-500">{city}</h4>
                      <h5 className="text-xl font-bold text-indigo-800">{formattedDate}</h5>
                      <p className="text-xs text-gray-600 mt-1">Arrival in {city} & Exploration</p>
                  </div>
              </div>

              {/* Timeline Activities */}
              <ul className="space-y-3 pl-0 list-none">
                  {[{time: 'Morning', activity: morning}, {time: 'Afternoon', activity: afternoon}, {time: 'Evening', activity: evening}].map((item, i) => (
                      <li key={i} className="flex items-start space-x-3">
                          <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-indigo-500 rounded-full flex-shrink-0"></div>
                              {i < 2 && <div className="w-0.5 h-6 bg-indigo-300"></div>}
                          </div>
                          
                          <div className='flex-grow'>
                              <span className="font-semibold text-indigo-800 text-sm">{item.time}: </span>
                              <span className="text-gray-700 text-sm">{item.activity}</span>
                          </div>
                      </li>
                  ))}
              </ul>
          </div>
      </div>
    );
  };
  
  // Custom styled shape for Payment Plan summary rows
  const PaymentRibbon = ({ title, value }) => (
    <div className="flex justify-between items-center bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm overflow-hidden relative mb-3">
        <div className="bg-indigo-700 text-white font-bold p-3 relative transform -skew-x-12 w-32 text-center mr-6">
            <span className="inline-block transform skew-x-12">{title}</span>
        </div>
        <div className="flex-grow text-right p-3 text-lg font-bold text-indigo-900 pr-4">
            {value}
        </div>
    </div>
);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8 flex justify-center">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-xl shadow-2xl lg:w-1/2 flex-shrink-0 border border-indigo-100">
          <h1 className="text-3xl font-extrabold text-indigo-900 mb-6 border-b pb-3">Itinerary Builder</h1>
          <form className="space-y-4">
            
            {/* NEW: Domestic / International Toggle */}
            <div className="flex space-x-4 mb-4 pt-2 border-b pb-4">
                <h2 className="text-xl font-bold text-indigo-700">Trip Type:</h2>
                <button
                    type="button"
                    name="travelType"
                    value="Domestic"
                    onClick={(e) => handleInputChange(e)}
                    className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${formData.travelType === 'Domestic' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'}`}
                >
                    Domestic
                </button>
                <button
                    type="button"
                    name="travelType"
                    value="International"
                    onClick={(e) => handleInputChange(e)}
                    className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${formData.travelType === 'International' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'}`}
                >
                    International
                </button>
            </div>
            
            {/* General Details */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Traveler Details</h2>
            <input type="text" id="name" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border-indigo-200 focus:border-indigo-500 rounded-md shadow-sm p-2 bg-indigo-50/50" />
            <input type="tel" id="phone" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full border-indigo-200 focus:border-indigo-500 rounded-md shadow-sm p-2 bg-indigo-50/50" />
            <input type="email" id="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border-indigo-200 focus:border-indigo-500 rounded-md shadow-sm p-2 bg-indigo-50/50" />
            <input type="text" id="destination" name="destination" placeholder="Destination (e.g., Singapore Itinerary)" value={formData.destination} onChange={handleInputChange} className="mt-1 block w-full border-indigo-200 focus:border-indigo-500 rounded-md shadow-sm p-2 bg-indigo-50/50" />
            
            {/* New Inputs Added for Summary Bar */}
            <div className='grid grid-cols-3 gap-4'>
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Departure Date</label>
                    <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} className="mt-1 p-2 border rounded-md w-full" />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Arrival Date</label>
                    <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange} className="mt-1 p-2 border rounded-md w-full" />
                </div>
                <div>
                    <label htmlFor="travellers" className="block text-sm font-medium text-gray-700">Travellers</label>
                    <input type="number" id="travellers" name="travellers" placeholder="No. of Travellers" value={formData.travellers} onChange={handleInputChange} className="mt-1 p-2 border rounded-md w-full" />
                </div>
            </div>

            {/* --- FLIGHT BOOKINGS INPUTS --- */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Flight Bookings</h2>
            {formData.flightBookings.map((flight, index) => (
              <div key={index} className="space-y-3 bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-inner relative">
                <h3 className="text-base font-semibold text-indigo-900">Flight {index + 1} Details</h3>
                
                {/* Delete Button */}
                <button 
                  type="button" 
                  onClick={() => handleDeleteRow('flightBookings', index)} 
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
                >
                  &times; Remove
                </button>

                <input type="text" placeholder="Flight Name (e.g., Fly Air India)" value={flight.flightName} onChange={(e) => handleTableArrayChange(e, 'flightBookings', index, 'flightName')} className="p-2 border rounded-md" />
                <input type="text" placeholder="Flight Number (e.g., AX-123)" value={flight.flightNumber} onChange={(e) => handleTableArrayChange(e, 'flightBookings', index, 'flightNumber')} className="p-2 border rounded-md" />
                
                <div className='grid grid-cols-2 gap-4'>
                    <input type="text" placeholder="From City (e.g., Mumbai BOM)" value={flight.from} onChange={(e) => handleTableArrayChange(e, 'flightBookings', index, 'from')} className="p-2 border rounded-md" />
                    <input type="text" placeholder="To City (e.g., Singapore SIN)" value={flight.to} onChange={(e) => handleTableArrayChange(e, 'flightBookings', index, 'to')} className="p-2 border rounded-md" />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                    {/* Explicitly labeled Flight Date Inputs */}
                    <div>
                        <label htmlFor={`flight-dep-${index}`} className="block text-xs font-medium text-gray-600">Departure Date</label>
                        <input type="date" id={`flight-dep-${index}`} value={flight.departure} onChange={(e) => handleTableArrayChange(e, 'flightBookings', index, 'departure')} className="mt-1 p-2 border rounded-md w-full" />
                    </div>
                    <div>
                        <label htmlFor={`flight-arr-${index}`} className="block text-xs font-medium text-gray-600">Arrival Date</label>
                        <input type="date" id={`flight-arr-${index}`} value={flight.arrival} onChange={(e) => handleTableArrayChange(e, 'flightBookings', index, 'arrival')} className="mt-1 p-2 border rounded-md w-full" />
                    </div>
                </div>
              </div>
            ))}
            {/* Button to ADD First/Another Row */}
            <button type="button" onClick={() => handleAddRow('flightBookings', { departure: '', arrival: '', flightName: '', flightNumber: '', from: '', to: '' })} className="text-indigo-600 font-medium hover:text-indigo-800 transition">
                + Add Flight Booking
            </button>

            {/* Hotel Bookings Input */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Hotel Bookings</h2>
            {formData.hotelBookings.map((hotel, index) => (
              <div key={index} className="space-y-3 bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-inner relative">
                <h3 className="text-base font-semibold text-indigo-900">Hotel {index + 1} Details</h3>
                
                {/* Delete Button */}
                <button 
                  type="button" 
                  onClick={() => handleDeleteRow('hotelBookings', index)} 
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
                >
                  &times; Remove
                </button>

                <div className='grid grid-cols-2 gap-4'>
                    <input type="text" placeholder="City" value={hotel.city} onChange={(e) => handleTableArrayChange(e, 'hotelBookings', index, 'city')} className="p-2 border rounded-md" />
                    <input type="text" placeholder="Hotel Name" value={hotel.hotelName} onChange={(e) => handleTableArrayChange(e, 'hotelBookings', index, 'hotelName')} className="p-2 border rounded-md" />
                </div>
                {/* Check In/Out and Nights */}
                <div className='grid grid-cols-3 gap-4'>
                    {/* Explicitly labeled Hotel Date Inputs */}
                    <div>
                        <label htmlFor={`hotel-checkin-${index}`} className="block text-xs font-medium text-gray-600">Check In</label>
                        <input type="date" id={`hotel-checkin-${index}`} value={hotel.checkIn} onChange={(e) => handleTableArrayChange(e, 'hotelBookings', index, 'checkIn')} className="mt-1 p-2 border rounded-md w-full" />
                    </div>
                    <div>
                        <label htmlFor={`hotel-checkout-${index}`} className="block text-xs font-medium text-gray-600">Check Out</label>
                        <input type="date" id={`hotel-checkout-${index}`} value={hotel.checkOut} onChange={(e) => handleTableArrayChange(e, 'hotelBookings', index, 'checkOut')} className="mt-1 p-2 border rounded-md w-full" />
                    </div>
                    <div>
                        <label htmlFor={`hotel-nights-${index}`} className="block text-xs font-medium text-gray-600">Nights</label>
                        <input type="number" id={`hotel-nights-${index}`} placeholder="Nights" value={hotel.nights} onChange={(e) => handleTableArrayChange(e, 'hotelBookings', index, 'nights')} className="mt-1 p-2 border rounded-md w-full" />
                    </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => handleAddRow('hotelBookings', { city: '', checkIn: '', checkOut: '', nights: 1, hotelName: '' })} className="text-indigo-600 font-medium hover:text-indigo-800 transition">
                + Add Hotel Booking
            </button>
            
            {/* Daily Activities Input */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Daily Activity Builder</h2>
            {formData.activityPlans.map((activity, index) => (
              <div key={index} className="space-y-3 bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-inner relative">
                <h3 className="text-base font-semibold text-indigo-900">Day {index + 1} Details</h3>
                
                {/* Delete Button */}
                <button 
                  type="button" 
                  onClick={() => handleDeleteRow('activityPlans', index)} 
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
                >
                  &times; Remove Day
                </button>

                <input type="date" placeholder="Date of Activity" value={activity.date} onChange={(e) => handleTableArrayChange(e, 'activityPlans', index, 'date')} className="w-full p-2 border rounded-md" />
                <input type="text" placeholder="City" value={activity.city} onChange={(e) => handleTableArrayChange(e, 'activityPlans', index, 'city')} className="w-full p-2 border rounded-md" />
                <textarea placeholder="Morning Activity" rows="1" value={activity.morning} onChange={(e) => handleTableArrayChange(e, 'activityPlans', index, 'morning')} className="w-full p-2 border rounded-md resize-none"></textarea>
                <textarea placeholder="Afternoon Activity" rows="1" value={activity.afternoon} onChange={(e) => handleTableArrayChange(e, 'activityPlans', index, 'afternoon')} className="w-full p-2 border rounded-md resize-none"></textarea>
                <textarea placeholder="Evening Activity" rows="1" value={activity.evening} onChange={(e) => handleTableArrayChange(e, 'activityPlans', index, 'evening')} className="w-full p-2 border rounded-md resize-none"></textarea>
              </div>
            ))}
            <button type="button" onClick={() => handleAddRow('activityPlans', { day: formData.activityPlans.length + 1, date: '', city: '', morning: '', afternoon: '', evening: '' })} className="text-indigo-600 font-medium hover:text-indigo-800 transition">
                + Add New Day to Itinerary
            </button>

            {/* Activity Table Inputs */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Activity Table Details (Used for Pricing/Notes)</h2>
             {formData.activityTable.map((activity, index) => (
                <div key={index} className="space-y-3 bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-inner relative">
                    <h3 className="text-base font-semibold text-indigo-900">Activity Row {index + 1}</h3>
                    
                    {/* Delete Button */}
                    <button 
                      type="button" 
                      onClick={() => handleDeleteRow('activityTable', index)} 
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
                    >
                      &times; Remove
                    </button>

                    <div className='grid grid-cols-2 gap-4'>
                        <input type="text" placeholder="City (e.g., Rio De Janeiro)" value={activity.city} onChange={(e) => handleTableArrayChange(e, 'activityTable', index, 'city')} className="p-2 border rounded-md" />
                        <input type="text" placeholder="Activity Name" value={activity.activity} onChange={(e) => handleTableArrayChange(e, 'activityTable', index, 'activity')} className="p-2 border rounded-md" />
                    </div>
                    
                    <input type="text" placeholder="Type (e.g., Nature/Sightseeing)" value={activity.type} onChange={(e) => handleTableArrayChange(e, 'activityTable', index, 'type')} className="p-2 border rounded-md" />
                    
                    {/* Structured Time Input */}
                    <div className='grid grid-cols-3 gap-4 items-center'>
                        <span className="text-sm text-gray-700">Duration:</span>
                        <input 
                            type="number" 
                            min="0" 
                            placeholder="Value" 
                            value={activity.timeValue} 
                            onChange={(e) => handleTableArrayChange(e, 'activityTable', index, 'timeValue')} 
                            className="p-2 border rounded-md" 
                        />
                        <select 
                            value={activity.timeUnit} 
                            onChange={(e) => handleTableArrayChange(e, 'activityTable', index, 'timeUnit')} 
                            className="p-2 border rounded-md"
                        >
                            <option value="Hours">Hours</option>
                            <option value="Minutes">Minutes</option>
                            <option value="Days">Days</option>
                        </select>
                    </div>
                </div>
             ))}
             <button type="button" onClick={() => handleAddRow('activityTable', { city: '', activity: '', type: '', timeValue: '', timeUnit: 'Hours' })} className="text-indigo-600 font-medium hover:text-indigo-800 transition">
                + Add Activity Row
            </button>


            {/* --- INCLUSION SUMMARY INPUTS --- */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Inclusion Summary</h2>
            <div className='space-y-3 p-4 border rounded-md bg-purple-50'>
                <button type="button" onClick={() => handleAddRow('inclusionSummary', { category: '', count: '', details: '' })} className="text-indigo-600 text-sm hover:text-indigo-800 transition block mb-2">
                    + Add Inclusion Row
                </button>
                {formData.inclusionSummary.map((item, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 border-t pt-2 relative">
                        {/* Delete Button */}
                        <button 
                          type="button" 
                          onClick={() => handleDeleteRow('inclusionSummary', index)} 
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
                        >
                          &times;
                        </button>

                        <input type="text" placeholder="Category" value={item.category} onChange={(e) => handleTableArrayChange(e, 'inclusionSummary', index, 'category')} className="p-2 text-sm border rounded-md col-span-1" />
                        <input type="number" placeholder="Count" value={item.count} onChange={(e) => handleTableArrayChange(e, 'inclusionSummary', index, 'count')} className="p-2 text-sm border rounded-md col-span-1" />
                        <input type="text" placeholder="Details" value={item.details} onChange={(e) => handleTableArrayChange(e, 'inclusionSummary', index, 'details')} className="col-span-3 p-2 text-sm border rounded-md" />
                    </div>
                ))}
            </div>

            {/* --- IMPORTANT NOTES INPUTS --- */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Important Notes</h2>
            <div className='space-y-3 p-4 border rounded-md bg-purple-50'>
                <button type="button" onClick={() => handleAddRow('importantNotes', { point: '', details: '' })} className="text-indigo-600 text-sm hover:text-indigo-800 transition block mb-2">
                    + Add Note Row
                </button>
                {formData.importantNotes.map((note, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 border-t pt-2 relative">
                         {/* Delete Button */}
                        <button 
                          type="button" 
                          onClick={() => handleDeleteRow('importantNotes', index)} 
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
                        >
                          &times;
                        </button>

                         <input type="text" placeholder="Point" value={note.point} onChange={(e) => handleTableArrayChange(e, 'importantNotes', index, 'point')} className="p-2 text-sm border rounded-md col-span-1" />
                         <textarea placeholder="Details" rows="1" value={note.details} onChange={(e) => handleTableArrayChange(e, 'importantNotes', index, 'details')} className="p-2 text-sm border rounded-md resize-none col-span-2" />
                    </div>
                ))}
            </div>

            {/* --- SCOPE OF SERVICE INPUTS --- */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Scope of Service</h2>
            <div className='space-y-3 p-4 border rounded-md bg-purple-50'>
                <button type="button" onClick={() => handleAddRow('serviceScope', { service: '', details: '' })} className="text-indigo-600 text-sm hover:text-indigo-800 transition block mb-2">
                    + Add Service Row
                </button>
                {formData.serviceScope.map((service, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2 border-t pt-2 relative">
                         {/* Delete Button */}
                        <button 
                          type="button" 
                          onClick={() => handleDeleteRow('serviceScope', index)} 
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
                        >
                          &times;
                        </button>

                         <input type="text" placeholder="Service" value={service.service} onChange={(e) => handleTableArrayChange(e, 'serviceScope', index, 'service')} className="p-2 text-sm border rounded-md" />
                         <textarea placeholder="Details" rows="1" value={service.details} onChange={(e) => handleTableArrayChange(e, 'serviceScope', index, 'details')} className="p-2 text-sm border rounded-md resize-none" />
                    </div>
                ))}
            </div>


            {/* Payment & Visa Details Input */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Payment & Visa Details</h2>
            <div className='space-y-3 p-4 border rounded-md bg-purple-50'>
                <input type="text" name="totalAmount" placeholder="Total Amount (e.g., ₹ 9,00,000)" value={formData.totalAmount} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                <input type="text" name="tcsCollected" placeholder="TCS Status (e.g., Not Collected)" value={formData.tcsCollected} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                
                {/* Installment Plan Input */}
                <h3 className="text-base font-semibold text-indigo-900 mt-4 mb-2">Installment Plan</h3>
                <button type="button" onClick={() => handleAddRow('paymentPlan', { installment: '', amount: '', dueDate: '' })} className="text-indigo-600 text-sm hover:text-indigo-800 transition block mb-2">
                    + Add Installment Row
                </button>
                {formData.paymentPlan.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 border-t pt-2 relative">
                        {/* Delete Button */}
                        <button 
                          type="button" 
                          onClick={() => handleDeleteRow('paymentPlan', index)} 
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
                        >
                          &times;
                        </button>

                        <input type="text" placeholder="Installment Name" value={item.installment} onChange={(e) => handleTableArrayChange(e, 'paymentPlan', index, 'installment')} className="p-2 text-sm border rounded-md col-span-1" />
                        <input type="text" placeholder="Amount" value={item.amount} onChange={(e) => handleTableArrayChange(e, 'paymentPlan', index, 'amount')} className="p-2 text-sm border rounded-md col-span-1" />
                        <input type="text" placeholder="Due Date" value={item.dueDate} onChange={(e) => handleTableArrayChange(e, 'paymentPlan', index, 'dueDate')} className="col-span-2 p-2 text-sm border rounded-md" />
                    </div>
                ))}

                {/* Visa Details Input (CONDITIONAL) */}
                {isInternational && (
                    <div className="space-y-3 mt-4 pt-2 border-t border-indigo-200 transition-opacity duration-500">
                        <h3 className="text-base font-semibold text-indigo-900 mb-2">Visa Details <span className="text-red-500">*</span></h3>
                        <div className='space-y-2'>
                            <input 
                                type="text" 
                                name="visaType" 
                                placeholder="Visa Type (e.g., Tourist Visa)" 
                                value={formData.visaType} 
                                onChange={handleInputChange} 
                                className="w-full p-2 border rounded-md" 
                                required={isInternational}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" name="visaValidity" placeholder="Visa Validity (e.g., 6 Months)" value={formData.visaValidity} onChange={handleInputChange} className="p-2 border rounded-md" />
                                <input type="date" name="visaProcessingDate" placeholder="Processing Date" value={formData.visaProcessingDate} onChange={handleInputChange} className="p-2 border rounded-md" />
                            </div>
                        </div>
                    </div>
                )}
            </div>


            <button type="button" onClick={handleGeneratePdf} className="w-full py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-indigo-700 hover:bg-indigo-800 transition duration-300 ease-in-out mt-8">
              Generate Final PDF Itinerary
            </button>
          </form>
        </div>

        {/* Itinerary Preview Section (Figma Replication) */}
        <div className="itinerary-preview bg-white p-6 rounded-xl shadow-2xl lg:w-1/2 overflow-y-auto relative">
          <div ref={itineraryRef} className="p-4 lg:p-6 min-h-full bg-white font-sans">
            {/* Header Section (Top Logo & Traveler Info) */}
            <div className="flex justify-between items-start border-b pb-4 mb-6">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-extrabold text-indigo-900">Hi, {formData.name || 'Traveler'}!</h1>
                    <p className="text-xl font-semibold text-indigo-700 mt-1">{formData.destination || 'Your Dream Itinerary'}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-900">Vigovia</p>
                    <p className="text-xs text-gray-500">Email: {formData.email || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Phone: {formData.phone || 'N/A'}</p>
                </div>
            </div>

            {/* Itinerary Summary Bar */}
            <div className="p-4 bg-indigo-600 rounded-lg shadow-md text-white mb-8">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                    <div className="flex flex-col">
                        <span className="text-indigo-200">Departure</span>
                        <span className="font-bold">{formatDate(formData.startDate)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-indigo-200">Arrival</span>
                        <span className="font-bold">{formatDate(formData.endDate)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-indigo-200">Destination</span>
                        <span className="font-bold">{formData.destination || 'City'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-indigo-200">Travellers</span>
                        <span className="font-bold">{formData.travellers} Pax</span>
                    </div>
                </div>
            </div>

            {/* Flight Summary Table (Break after this if content is long) */}
            <h3 className="text-lg font-bold mb-4 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1">Flight Summary</h3>
            <div className="shadow-lg rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-5 text-xs font-bold text-white bg-indigo-900 text-center">
                    <div className="p-3">Flight</div>
                    <div className="p-3">From</div>
                    <div className="p-3">To</div>
                    <div className="p-3">Departure</div>
                    <div className="p-3">Arrival</div>
                </div>
                {/* Only display flights if the array is not empty */}
                {formData.flightBookings.length > 0 ? (
                    formData.flightBookings.map((flight, index) => (
                        <div key={index} className="grid grid-cols-5 text-xs border-b border-gray-200 text-center">
                            <div className="p-3 font-semibold bg-gray-50 text-indigo-800">{flight.flightName} ({flight.flightNumber})</div>
                            <div className="p-3 text-gray-700">{flight.from}</div>
                            <div className="p-3 text-gray-700">{flight.to}</div>
                            <div className="p-3 text-gray-700">{formatDate(flight.departure)}</div>
                            <div className="p-3 text-gray-700">{formatDate(flight.arrival)}</div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-500">No flight bookings added.</div>
                )}
            </div>

            {/* Hotel Bookings Table */}
            <h3 className="text-lg font-bold mb-4 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1">Hotel Bookings</h3>
            <div className="shadow-lg rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-5 text-xs font-bold text-white bg-indigo-900 text-center">
                    <div className="p-3">City</div>
                    <div className="p-3">Check In</div>
                    <div className="p-3">Check Out</div>
                    <div className="p-3">Nights</div>
                    <div className="p-3">Hotel Name</div>
                </div>
                {/* Only display hotels if the array is not empty */}
                {formData.hotelBookings.length > 0 ? (
                    formData.hotelBookings.map((hotel, index) => (
                        <div key={index} className="grid grid-cols-5 text-xs border-b border-gray-200 text-center">
                            <div className="p-3 font-semibold bg-gray-50">{hotel.city || 'N/A'}</div>
                            <div className="p-3 text-gray-700">{formatDate(hotel.checkIn) || 'N/A'}</div>
                            <div className="p-3 text-gray-700">{formatDate(hotel.checkOut) || 'N/A'}</div>
                            <div className="p-3 text-gray-700">{hotel.nights}</div>
                            <div className="p-3 text-indigo-800 font-semibold">{hotel.hotelName || 'N/A'}</div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-500">No hotel bookings added.</div>
                )}
            </div>


            {/* Daily Activity Plan (Timeline) */}
            <h3 className="text-lg font-bold mb-4 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1">Daily Activities</h3>
            {formData.activityPlans.length > 0 ? (
                <div className='mb-8'>
                    {formData.activityPlans.map((activity, index) => (
                        <DailyItinerary key={index} {...activity} />
                    ))}
                </div>
            ) : (
                <div className="p-4 text-center text-gray-500 mb-8">No daily activity plans defined.</div>
            )}


            {/* Activity Table (From SS 4) */}
            <h3 className="text-lg font-bold mb-4 pt-16 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1 print-new-page">Activity Table</h3>
            <div className="shadow-lg rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-4 text-sm font-bold text-white bg-indigo-900">
                    <div className="p-3">City</div>
                    <div className="p-3">Activity</div>
                    <div className="p-3">Type</div>
                    <div className="p-3">Time Required</div>
                </div>
                {formData.activityTable.length > 0 ? (
                    formData.activityTable.map((activity, index) => (
                        <div key={index} className="grid grid-cols-4 text-sm border-b border-gray-200">
                            <div className="p-3 font-semibold bg-gray-50">{activity.city}</div>
                            <div className="p-3 text-gray-700">{activity.activity}</div>
                            <div className="p-3 text-gray-700">{activity.type}</div>
                            <div className="p-3 text-gray-700">{activity.timeValue} {activity.timeUnit}</div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-500 col-span-4">No activities defined in the table.</div>
                )}
            </div>


            {/* Inclusion Summary (From SS 3) */}
            <h3 className="text-lg font-bold mb-4 pt-16 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1 print-new-page">Inclusion Summary</h3>
            <div className="shadow-lg rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-4 text-sm font-bold text-white bg-indigo-900">
                    <div className="p-3">Category</div>
                    <div className="p-3">Count</div>
                    <div className="col-span-2 p-3">Details</div>
                </div>
                {/* Auto-populated technical section: Should always show content by default if not removed */}
                {formData.inclusionSummary.length > 0 ? (
                    formData.inclusionSummary.map((item, index) => (
                        <div key={index} className="grid grid-cols-4 text-sm border-b border-gray-200">
                            <div className="p-3 font-semibold bg-gray-50">{item.category}</div>
                            <div className="p-3 text-center text-gray-700">{item.count}</div>
                            <div className="col-span-2 p-3 text-gray-700">{item.details}</div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-500 col-span-4">No inclusion summary added.</div>
                )}
            </div>


            {/* Important Notes Table (From SS 2) */}
            <h3 className="text-lg font-bold mb-4 pt-16 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1 print-new-page">Important Notes</h3>
            <div className="shadow-lg rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-5 text-sm font-bold text-white bg-indigo-900">
                    <div className="col-span-1 p-3">Point</div>
                    <div className="col-span-4 p-3 border-l border-indigo-700">Details</div>
                </div>
                {/* Auto-populated technical section: Should always show content by default if not removed */}
                {formData.importantNotes.length > 0 ? (
                    formData.importantNotes.map((note, index) => (
                        <div key={index} className="grid grid-cols-5 text-sm border-b border-gray-200">
                            <div className="col-span-1 p-3 font-semibold bg-gray-50">{note.point}</div>
                            <div className="col-span-4 p-3 text-gray-700 whitespace-pre-wrap">{note.details}</div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-500 col-span-5">No important notes added.</div>
                )}
            </div>
            
            {/* Scope of Service Table (From SS 3) */}
            <h3 className="text-lg font-bold mb-4 pt-16 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1 print-new-page">Scope of Service</h3>
            <div className="shadow-lg rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-5 text-sm font-bold text-white bg-indigo-900">
                    <div className="col-span-1 p-3">Service</div>
                    <div className="col-span-4 p-3 border-l border-indigo-700">Details</div>
                </div>
                {/* Auto-populated technical section: Should always show content by default if not removed */}
                {formData.serviceScope.length > 0 ? (
                    formData.serviceScope.map((service, index) => (
                        <div key={index} className="grid grid-cols-5 text-sm border-b border-gray-200">
                            <div className="col-span-1 p-3 font-semibold bg-gray-50">{service.service}</div>
                            <div className="col-span-4 p-3 text-gray-700">{service.details}</div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-500 col-span-5">No service scope defined.</div>
                )}
            </div>
            
            {/* Payment Plan (From SS 5) */}
            <h3 className="text-lg font-bold mb-4 pt-16 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1 print-new-page">Payment Plan</h3>
            <PaymentRibbon title="Total Amount" value={`${formData.totalAmount} For ${formData.travellers} Pax (Inclusive Of GST)`} />
            <PaymentRibbon title="TCS" value={formData.tcsCollected} />

            <div className="grid grid-cols-3 gap-1 shadow-lg rounded-lg overflow-hidden mb-8">
                {['Installment', 'Amount', 'Due Date'].map(header => (
                    <div key={header} className="p-3 text-center text-sm font-bold text-white bg-indigo-900 border-r border-indigo-700 last:border-r-0">{header}</div>
                ))}
                {formData.paymentPlan.length > 0 ? (
                    formData.paymentPlan.map((item, index) => (
                        <Fragment key={index}>
                            <div className="p-3 text-sm text-center font-semibold bg-indigo-50 border-b border-gray-200">{item.installment}</div>
                            <div className="p-3 text-sm text-center text-gray-700 border-b border-gray-200">{item.amount}</div>
                            <div className="p-3 text-sm text-center text-gray-700 border-b border-gray-200">{item.dueDate}</div>
                        </Fragment>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-500 col-span-3">No payment plan details added.</div>
                )}
            </div>
            
            {/* Visa Details (CONDITIONAL) */}
            {isInternational && (
                <div className="transition-opacity duration-500">
                    <h3 className="text-lg font-bold mb-4 pt-16 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1 print-new-page">Visa Details</h3>
                    <div className="flex justify-between p-4 border rounded-lg shadow-sm mb-8">
                        <span className="font-semibold">Visa Type: <span className="font-normal text-gray-700">{formData.visaType || 'N/A'}</span></span>
                        <span className="font-semibold">Validity: <span className="font-normal text-gray-700">{formData.visaValidity || 'N/A'}</span></span>
                        <span className="font-semibold">Processing Date: <span className="font-normal text-gray-700">{formData.visaProcessingDate || 'N/A'}</span></span>
                    </div>
                </div>
            )}
            
            {/* Final Footer (From SS 4/5) */}
            <div className="mt-12 pt-4 border-t border-gray-300">
                 <p className="text-xs text-indigo-900 font-bold text-center">
                    PLAN.PACK.GO!
                 </p>
                 <button className="block w-40 mx-auto mt-3 py-2 px-4 rounded-lg text-white font-bold bg-indigo-700 hover:bg-indigo-800">
                    Book Now
                 </button>
                 <p className="text-xs text-gray-500 text-center mt-3">
                    Vigovia Tech Pvt. Ltd. | Registered Office: Links Business Park, Karnataka, India.
                 </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
