import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-time-picker/dist/TimePicker.css";
import image from "../../assets/images/bg.png";
import logo from "../../assets/images/brand-logo.png";
import axios from 'axios';
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { disableTomorrow, formatDate } from "../../helper/formatDate";
import { timeArray } from "../../helper/timeSlots";

const Form = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [user, setUser] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [skills, setSkills] = useState([]);


  const [availableSlots, setAvailableSlots] = useState([]);
  const [offDays, setOffDays] = useState([]);
  const [formattedDate, setFormattedDate] = useState('')
  const [formData, setFormData] = useState({
    userName: "",
    phone: "",
    service: "",
    chooseBarberName: "",
    date: "",
    time: "",
    barberId: ""
  });

  useEffect(() => {
    if (formData.barberId) {
      const selectedBarberInfo = user.find(barber => barber._id === formData.barberId);
      setSelectedBarber(selectedBarberInfo);
    }
  }, [formData.barberId, user]);

  useEffect(() => {
    axios
      .get(`https://barber.mykilo.co.uk/public/get-barber`)
      .then((response) => {
        setUser(response?.data?.barberData);
      })
      .catch((error) => {
        console.error("Error while fetching services:", error);
      });
  }, []);

  useEffect(() => {
    register("date");
  }, [register]);

  const fetchSkills = async (barberId) => {
    try {
      const response = await axios.get(`https://barber.mykilo.co.uk/public/get-single-barber/${barberId}`);
      setSkills(response?.data?.barberObj?.skills)
      return response.data?.skills;
    } catch (error) {
      console.error("Error while fetching skills:", error);
      return [];
    }
  };

  const handleBarberChange = async (e) => {
    const selectedBarberName = e.target.value;
    const selectedBarberInfo = user.find(barber => barber.barberName === selectedBarberName);
    await fetchSkills(selectedBarberInfo._id);
    setSelectedBarber(selectedBarberInfo);
    setFormData({
      ...formData,
      chooseBarberName: selectedBarberName,
      barberId: selectedBarberInfo._id,
      service: "",
    });
  };


  const handleDateChange = async (date) => {
    setFormData({ ...formData, date });
    try {
      const formattedDate = formatDate(date);
      setFormattedDate(formattedDate);
      const response = await axios.get(`https://barber.mykilo.co.uk/public/get-availability?id=${selectedBarber?._id}&date=${formattedDate}`);

    
      const availableSlots = response.data?.slots.map(slot => slot.time);
      setAvailableSlots(availableSlots);

      const offDays = response.data?.fullDayOff.map(slot => slot);
      setOffDays(offDays);
    } catch (error) {
      console.error('Error fetching availability data:', error);
    }
  };


  const updatedTimeSlots = timeArray.map(slot => {
    return {
      ...slot,
      disabled: availableSlots.includes(slot.startTime) | offDays.includes(formattedDate)
    };
  });

  const barberNames = user?.map(item => item?.barberName);


  const fields = [
    {
      id: "userName",
      label: "Name",
      type: "text",
      name: "userName",
      placeholder: "Enter Name",
    },
    {
      id: "phone",
      label: "Phone",
      type: "text",
      name: "phone",
      placeholder: "Enter Phone",
    },
    {
      id: "chooseBarberName",
      label: "Choose Doctor",
      type: "select",
      name: "chooseBarberName",
      options: barberNames,
      onChange: handleBarberChange,
    },
    {
      id: "service",
      label: "Services",
      type: "select",
      name: "service",
      options: selectedBarber?.skills || [],
    },
    { id: "date", label: "Date", type: "calendar", name: "date" },
    { id: "time", label: "Time", type: "time", name: "time" },
  ];


  const onSubmit = async (data) => {
    const formDataToSend = {
      ...data,
      date: formattedDate,
      time: data.time.split(" - ")[0].toLowerCase(),
      barberId: selectedBarber ? selectedBarber._id : undefined
    };

    try {
      const response = await axios.post(`https://barber.mykilo.co.uk/public/order`, formDataToSend);
      console.log('Response from API:', response.data);
      Swal.fire({
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
      reset()
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error.message}`,
      });
      console.error('Error while calling API:', error);
    }
  }

  return (
    <div
      className="bg-cover bg-center flex justify-center h-full min-h-screen"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="container mx-auto p-6">
        <img src={logo} className="w-[125px] pb-20" alt="Logo" />
        <div className="flex justify-center mb-6 ">
          <h1 className="text-[25px] text-white font-semibold">
          Get the Care You Deserve: Schedule Your Treatment Appointment Now!{" "}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex justify-center bg-white shadow-lg backdrop-blur-sm bg-opacity-25 rounded-sm flex-wrap px-4 lg:px-12 py-12 mx-2">
          {fields?.map((field) => (
            <div key={field.id} className="w-full md:w-1/2 px-2 mb-4">
              <label htmlFor={field.id} className="block text-white text-sm mb-1">
                {field.label}
              </label>
              {field.type === "text" && (
                <input
                  type="text"
                  id={field.id}
                  name={field.name}
                  {...register(field.name, { required: true })}
                  placeholder={field.placeholder}
                  className={`w-full border rounded px-3 py-2 text-white outline-none bg-transparent placeholder:text-white ${errors[field.name] ? 'border-red-500' : ''}`}
                />
              )}
              {field.id == "chooseBarberName" && (
                <>
                  <select
                    id={field.id}
                    name={field.name}
                    {...register(field.name, { required: true })}
                    className={`w-full border rounded px-3 text-white py-2 outline-none bg-transparent capitalize ${errors[field.name] ? 'border-red-500' : ''}`}
                    onChange={field.onChange}
                  >
                    <option className="px-6" disabled selected value="">
                      Select...
                    </option>
                    {field?.options?.map((option) => (
                      <option key={option} className="text-black capitalize" value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </>
              )}
              {field.id == "service" && (
                <>
                  <select
                    id={field.id}
                    name={field.name}
                    {...register(field.name, { required: true })}
                    className={`w-full border rounded px-3 text-white py-2 outline-none bg-transparent capitalize ${errors[field.name] ? 'border-red-500' : ''}`}
                    onChange={field.onChange}
                  >
                    <option className="px-6" disabled selected value="">
                      Select...
                    </option>
                    {skills?.map((option) => (
                      <option key={option} className="text-black capitalize" value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {field.type === "calendar" && (
                <DatePicker
                  selected={formData.date}
                  placeholderText="Enter Date"
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  minDate={disableTomorrow()}
                  className={`w-full border rounded px-3 py-2 text-white outline-none bg-transparent ${errors[field.name] ? 'border-red-500' : ''}`}
                />
              )}

              {field.type === "time" && (
                <select
                  disabled={offDays.includes(formattedDate)}
                  className={`w-full border rounded px-3 py-2 text-white outline-none bg-transparent ${errors[field.name] ? 'border-red-500' : ''}`}
                  {...register(field.name, { required: true })}
                >
                  <option value="" className="px-6" disabled selected>
                    {offDays.includes(formattedDate) ? "Whole day off" : "Select Time"}
                  </option>

                  {updatedTimeSlots?.map((slot, i) => (
                    <option key={i} value={slot.label} className={`text-base ${slot.disabled ? 'text-gray-500' : 'text-black'}`} disabled={slot.disabled}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              )}
              {errors[field.name] && <p className="text-red-500 text-xs mt-1">This field is required</p>}
            </div>
          ))}

          <button
            type="submit"
            className="text-white px-20 py-2  mt-6 bg-[#c2a74e] cursor-pointer rounded-sm"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;
