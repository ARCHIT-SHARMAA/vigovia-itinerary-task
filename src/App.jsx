import { useState, useRef, Fragment } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './App.css';
// LOGO IMPORT REMOVED TO RESOLVE VITE CRASH
// We use a text placeholder instead.

function App() {
  const [formData, setFormData] = useState({
    // --- DUMMY DATA ---
    name: 'Alex Johnson', 
    phone: '9876543210',
    email: 'dummy.traveler@example.com',
    destination: 'Singapore Itinerary',
    startDate: '2025-10-20',
    endDate: '2025-10-25',
    travellers: 3,
    nights: 4,
    // --- Sample Bookings (Initial Data for Stability) ---
    flightBookings: [{ 
        departure: '2025-10-20', 
        arrival: '2025-10-20', 
        flightName: 'Fly Air India', 
        flightNumber: 'AX-123',
        from: 'Mumbai (BOM)', 
        to: 'Singapore (SIN)' 
    }],
    hotelBookings: [{ city: 'Singapore', checkIn: '2025-02-24', checkOut: '2025-02-26', nights: 2, hotelName: 'Super Townhouse Oak' }],
    activityPlans: [
      { day: 1, date: '2025-10-20', city: 'Singapore', morning: 'Arrival & Check-in', afternoon: 'Visit Marina Bay Sands Sky Park', evening: 'Gardens By The Bay' },
      { day: 2, date: '2025-10-21', city: 'Singapore', morning: 'Singapore City Excursion', afternoon: 'Sentosa Island', evening: 'Explore Clarke Quay' },
    ],
    // --- Sample Notes/Service Scope (Required for Tables) ---
    importantNotes: [
        { point: 'Airlines Standard Policy', details: 'In Case Of Visa Rejection, Visa Fees Or Any Other Non Cancellable Component Cannot Be Reimbursed At Any Cost.' },
        { point: 'Trip Insurance', details: 'Highly recommended for travel protection and medical emergencies.' },
    ],
    serviceScope: [
        { service: 'Support', details: 'Chat Support – Response Time: 4 Hours' },
        { service: 'Cancellation Support', details: 'Provided' },
    ],
    inclusionSummary: [
        { category: 'Flight', count: 2, details: 'All Flights Mentioned', status: 'Awaiting Confirmation' },
        { category: 'Tourist Tax', count: 2, details: 'Yotel (Singapore), Oakwood (Sydney), Mercure (Cairns)', status: 'Awaiting Confirmation' },
        { category: 'Hotel', count: 2, details: 'Airport To Hotel - Hotel To Attractions - Day Trips If Any', status: 'Included' },
    ],
    activityTable: [
        { city: 'Rio De Janeiro', activity: 'Sydney Harbour Cruise & Taronga Zoo', type: 'Nature/Sightseeing', timeRequired: '2-3 Hours' },
        { city: 'Rio De Janeiro', activity: 'Sydney Harbour Cruise & Taronga Zoo', type: 'Airlines Standard', timeRequired: '2-3 Hours' },
        { city: 'Rio De Janeiro', activity: 'Sydney Harbour Cruise & Taronga Zoo', type: 'Airlines Standard', timeRequired: '2-3 Hours' },
    ],
    // --- Payment Data ---
    totalAmount: '₹ 9,00,000',
    tcsCollected: 'Not Collected',
    paymentPlan: [
        { installment: 'Installment 1', amount: '₹3,50,000', dueDate: 'Initial Payment' },
        { installment: 'Installment 2', amount: '₹4,00,000', dueDate: 'Post Visa Approval' },
        { installment: 'Installment 3', amount: 'Remaining', dueDate: '20 Days Before Departure' },
    ],
    visaType: 'Tourist Visa',
    visaValidity: '6 Months',
    visaProcessingDate: '123456',
  });

  const itineraryRef = useRef();

  // --- Utility Functions ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    // Note: The original Figma uses hardcoded date names for days 1-4, 
    // but this dynamic component uses the actual date logic.
    const formattedDate = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'long' });
    const imagePlaceholder = `https://placehold.co/100x100/A387E9/ffffff?text=Day+${day}`;

    return (
      <div className="flex mb-8 items-start">
          {/* Day Label (Dark Purple Sidebar) */}
          <div className="w-16 flex-shrink-0 bg-indigo-900 rounded-l-lg flex flex-col items-center justify-center text-white font-bold text-xl p-2 min-h-[150px]">
              <span className="text-sm">Day</span>
              {day}
          </div>
          
          {/* Content Card */}
          <div className="flex-grow bg-white p-4 rounded-r-lg shadow-lg border-t border-r border-b border-gray-200">
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
        <div className="bg-white p-6 rounded-xl shadow-2xl lg:w-1/2 flex-shrink-0">
          <h1 className="text-3xl font-extrabold text-indigo-900 mb-6 border-b pb-3">Itinerary Builder</h1>
          <form className="space-y-4">
            {/* General Details */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Traveler Details</h2>
            <input type="text" id="name" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border-indigo-200 focus:border-indigo-500 rounded-md shadow-sm p-2 bg-indigo-50/50" />
            <input type="email" id="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border-indigo-200 focus:border-indigo-500 rounded-md shadow-sm p-2 bg-indigo-50/50" />
            
            {/* --- FLIGHT BOOKINGS INPUTS --- */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Flight Bookings</h2>
            {formData.flightBookings.map((flight, index) => (
              <div key={index} className="space-y-3 bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-inner">
                <h3 className="text-base font-semibold text-indigo-900">Flight {index + 1} Details</h3>
                <input type="text" placeholder="Flight Name (e.g., Fly Air India)" value={flight.flightName} onChange={(e) => handleTableArrayChange(e, 'flightBookings', index, 'flightName')} className="p-2 border rounded-md" />
                <input type="text" placeholder="Flight Number (e.g., AX-123)" value={flight.flightNumber} onChange={(e) => handleTableArrayChange(e, 'flightBookings', index, 'flightNumber')} className="p-2 border rounded-md" />
                <div className='grid grid-cols-2 gap-4'>
                    <input type="text" placeholder="From City" value={flight.from} onChange={(e) => handleTableArrayChange(e, 'flightBookings', index, 'from')} className="p-2 border rounded-md" />
                    <input type="text" placeholder="To City" value={flight.to} onChange={(e) => handleTableArrayChange(e, 'flightBookings', index, 'to')} className="p-2 border rounded-md" />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                    <input type="date" value={flight.departure} onChange={(e) => handleTableArrayChange(e, 'flightBookings', index, 'departure')} className="p-2 border rounded-md" />
                    <input type="date" value={flight.arrival} onChange={(e) => handleTableArrayChange(e, 'flightBookings', index, 'arrival')} className="p-2 border rounded-md" />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => handleAddRow('flightBookings', { departure: '', arrival: '', flightName: '', flightNumber: '', from: '', to: '' })} className="text-indigo-600 font-medium hover:text-indigo-800 transition">
                + Add Another Flight
            </button>

            {/* Hotel Bookings Input */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Hotel Bookings</h2>
            {formData.hotelBookings.map((hotel, index) => (
              <div key={index} className="space-y-3 bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-inner">
                <h3 className="text-base font-semibold text-indigo-900">Hotel {index + 1} Details</h3>
                <div className='grid grid-cols-2 gap-4'>
                    <input type="text" placeholder="City" value={hotel.city} onChange={(e) => handleTableArrayChange(e, 'hotelBookings', index, 'city')} className="p-2 border rounded-md" />
                    <input type="text" placeholder="Hotel Name" value={hotel.hotelName} onChange={(e) => handleTableArrayChange(e, 'hotelBookings', index, 'hotelName')} className="p-2 border rounded-md" />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => handleAddRow('hotelBookings', { city: '', checkIn: '', checkOut: '', nights: 1, hotelName: '' })} className="text-indigo-600 font-medium hover:text-indigo-800 transition">
                + Add Another Hotel
            </button>
            
            {/* Activity Table Inputs */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Activity Table Details</h2>
             {formData.activityTable.map((activity, index) => (
                <div key={index} className="space-y-3 bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-inner">
                    <h3 className="text-base font-semibold text-indigo-900">Activity {index + 1}</h3>
                    <input type="text" placeholder="City (e.g., Rio De Janeiro)" value={activity.city} onChange={(e) => handleTableArrayChange(e, 'activityTable', index, 'city')} className="p-2 border rounded-md" />
                    <input type="text" placeholder="Activity Name" value={activity.activity} onChange={(e) => handleTableArrayChange(e, 'activityTable', index, 'activity')} className="p-2 border rounded-md" />
                    <input type="text" placeholder="Time Required (e.g., 2-3 Hours)" value={activity.timeRequired} onChange={(e) => handleTableArrayChange(e, 'activityTable', index, 'timeRequired')} className="p-2 border rounded-md" />
                </div>
             ))}
             <button type="button" onClick={() => handleAddRow('activityTable', { city: '', activity: '', type: '', timeRequired: '' })} className="text-indigo-600 font-medium hover:text-indigo-800 transition">
                + Add Another Activity
            </button>


            {/* Payment Plan Input */}
            <h2 className="text-xl font-bold text-indigo-700 pt-4">Payment & Visa Details</h2>
            <div className='space-y-3 p-4 border rounded-md bg-purple-50'>
                <input type="text" name="totalAmount" placeholder="Total Amount (e.g., ₹ 9,00,000)" value={formData.totalAmount} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                <input type="text" name="tcsCollected" placeholder="TCS Status (e.g., Not Collected)" value={formData.tcsCollected} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                <input type="text" name="visaType" placeholder="Visa Type" value={formData.visaType} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
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
                    <h1 className="text-3xl font-extrabold text-indigo-900">Hi, {formData.name.split(' ')[0] || 'Rahul'}!</h1>
                    <p className="text-xl font-semibold text-indigo-700 mt-1">{formData.destination || 'Travel Itinerary'}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-900">Vigovia</p>
                    <p className="text-xs text-gray-500">Email: {formData.email}</p>
                    <p className="text-xs text-gray-500">Phone: {formData.phone}</p>
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
                        <span className="font-bold">{formData.destination.split(' ')[0] || 'City'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-indigo-200">Travellers</span>
                        <span className="font-bold">{formData.travellers} Pax</span>
                    </div>
                </div>
            </div>

            {/* --- FLIGHT SUMMARY TABLE --- */}
            <h3 className="text-lg font-bold mb-4 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1">Flight Summary</h3>
            <div className="shadow-lg rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-5 text-xs font-bold text-white bg-indigo-900 text-center">
                    <div className="p-3">Flight</div>
                    <div className="p-3">From</div>
                    <div className="p-3">To</div>
                    <div className="p-3">Departure</div>
                    <div className="p-3">Arrival</div>
                </div>
                {formData.flightBookings.map((flight, index) => (
                    <div key={index} className="grid grid-cols-5 text-xs border-b border-gray-200 text-center">
                        <div className="p-3 font-semibold bg-gray-50 text-indigo-800">{flight.flightName} ({flight.flightNumber})</div>
                        <div className="p-3 text-gray-700">{flight.from}</div>
                        <div className="p-3 text-gray-700">{flight.to}</div>
                        <div className="p-3 text-gray-700">{formatDate(flight.departure)}</div>
                        <div className="p-3 text-gray-700">{formatDate(flight.arrival)}</div>
                    </div>
                ))}
            </div>

            {/* Hotel Bookings Table (Matching Figma 5-Column Style) */}
            <h3 className="text-lg font-bold mb-4 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1">Hotel Bookings</h3>
            <div className="shadow-lg rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-5 text-xs font-bold text-white bg-indigo-900 text-center">
                    <div className="p-3">City</div>
                    <div className="p-3">Check In</div>
                    <div className="p-3">Check Out</div>
                    <div className="p-3">Nights</div>
                    <div className="p-3">Hotel Name</div>
                </div>
                {formData.hotelBookings.map((hotel, index) => (
                    <div key={index} className="grid grid-cols-5 text-xs border-b border-gray-200 text-center">
                        <div className="p-3 font-semibold bg-gray-50">{hotel.city || 'N/A'}</div>
                        <div className="p-3 text-gray-700">{formatDate(hotel.checkIn) || 'N/A'}</div>
                        <div className="p-3 text-gray-700">{formatDate(hotel.checkOut) || 'N/A'}</div>
                        <div className="p-3 text-gray-700">{hotel.nights}</div>
                        <div className="p-3 text-indigo-800 font-semibold">{hotel.hotelName || 'N/A'}</div>
                    </div>
                ))}
            </div>


            {/* Daily Activity Plan (From SS 1) */}
            <h3 className="text-lg font-bold mb-4 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1">Daily Activities</h3>
            <div className='mb-8'>
                {formData.activityPlans.map((activity, index) => (
                    <DailyItinerary key={index} {...activity} />
                ))}
            </div>

            {/* Activity Table (From SS 4) */}
            <h3 className="text-lg font-bold mb-4 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1">Activity Table</h3>
            <div className="shadow-lg rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-4 text-sm font-bold text-white bg-indigo-900">
                    <div className="p-3">City</div>
                    <div className="p-3">Activity</div>
                    <div className="p-3">Type</div>
                    <div className="p-3">Time Required</div>
                </div>
                {formData.activityTable.map((activity, index) => (
                    <div key={index} className="grid grid-cols-4 text-sm border-b border-gray-200">
                        <div className="p-3 font-semibold bg-gray-50">{activity.city}</div>
                        <div className="p-3 text-gray-700">{activity.activity}</div>
                        <div className="p-3 text-gray-700">{activity.type}</div>
                        <div className="p-3 text-gray-700">{activity.timeRequired}</div>
                    </div>
                ))}
            </div>


            {/* Inclusion Summary (From SS 3) */}
            <h3 className="text-lg font-bold mb-4 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1">Inclusion Summary</h3>
            <div className="shadow-lg rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-4 text-sm font-bold text-white bg-indigo-900">
                    <div className="p-3">Category</div>
                    <div className="p-3">Count</div>
                    <div className="col-span-2 p-3">Details</div>
                </div>
                {formData.inclusionSummary.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 text-sm border-b border-gray-200">
                        <div className="p-3 font-semibold bg-gray-50">{item.category}</div>
                        <div className="p-3 text-center text-gray-700">{item.count}</div>
                        <div className="col-span-2 p-3 text-gray-700">{item.details}</div>
                    </div>
                ))}
            </div>


            {/* Important Notes Table (From SS 2) */}
            <h3 className="text-lg font-bold mb-4 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1">Important Notes</h3>
            <div className="shadow-lg rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-5 text-sm font-bold text-white bg-indigo-900">
                    <div className="col-span-1 p-3">Point</div>
                    <div className="col-span-4 p-3 border-l border-indigo-700">Details</div>
                </div>
                {formData.importantNotes.map((note, index) => (
                    <div key={index} className="grid grid-cols-5 text-sm border-b border-gray-200">
                        <div className="col-span-1 p-3 font-semibold bg-gray-50">{note.point}</div>
                        <div className="col-span-4 p-3 text-gray-700 whitespace-pre-wrap">{note.details}</div>
                    </div>
                ))}
            </div>
            
            {/* Scope of Service Table (From SS 3) */}
            <h3 className="text-lg font-bold mb-4 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1">Scope of Service</h3>
            <div className="shadow-lg rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-5 text-sm font-bold text-white bg-indigo-900">
                    <div className="col-span-1 p-3">Service</div>
                    <div className="col-span-4 p-3 border-l border-indigo-700">Details</div>
                </div>
                {formData.serviceScope.map((service, index) => (
                    <div key={index} className="grid grid-cols-5 text-sm border-b border-gray-200">
                        <div className="col-span-1 p-3 font-semibold bg-gray-50">{service.service}</div>
                        <div className="col-span-4 p-3 text-gray-700">{service.details}</div>
                    </div>
                ))}
            </div>
            
            {/* Payment Plan (From SS 5) */}
            <h3 className="text-lg font-bold mb-4 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1">Payment Plan</h3>
            <PaymentRibbon title="Total Amount" value={`${formData.totalAmount} For ${formData.travellers} Pax (Inclusive Of GST)`} />
            <PaymentRibbon title="TCS" value={formData.tcsCollected} />

            <div className="grid grid-cols-3 gap-1 shadow-lg rounded-lg overflow-hidden mb-8">
                {['Installment', 'Amount', 'Due Date'].map(header => (
                    <div key={header} className="p-3 text-center text-sm font-bold text-white bg-indigo-900 border-r border-indigo-700 last:border-r-0">{header}</div>
                ))}
                {formData.paymentPlan.map((item, index) => (
                    <Fragment key={index}>
                        <div className="p-3 text-sm text-center font-semibold bg-indigo-50 border-b border-gray-200">{item.installment}</div>
                        <div className="p-3 text-sm text-center text-gray-700 border-b border-gray-200">{item.amount}</div>
                        <div className="p-3 text-sm text-center text-gray-700 border-b border-gray-200">{item.dueDate}</div>
                    </Fragment>
                ))}
            </div>
            
            {/* Visa Details (From SS 5) */}
            <h3 className="text-lg font-bold mb-4 text-indigo-800 uppercase border-b-2 border-indigo-200 pb-1">Visa Details</h3>
            <div className="flex justify-between p-4 border rounded-lg shadow-sm mb-8">
                <span className="font-semibold">Visa Type: <span className="font-normal text-gray-700">{formData.visaType}</span></span>
                <span className="font-semibold">Validity: <span className="font-normal text-gray-700">{formData.visaValidity}</span></span>
                <span className="font-semibold">Processing Date: <span className="font-normal text-gray-700">{formData.visaProcessingDate}</span></span>
            </div>
            
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
