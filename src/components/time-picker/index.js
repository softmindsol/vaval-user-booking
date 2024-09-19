import React, { useState, useRef } from "react";

function CustomTimePicker() {
  const [time, setTime] = useState("00:00");
  const inputRef = useRef(null);

  const handleFieldClick = () => {
    inputRef.current.focus();
  };

  return (
    <form className=" mx-auto">
      <div className="relative" onClick={handleFieldClick}>
        <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
          <svg
            className="w-5 h-5 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="time"
          id="time"
          ref={inputRef}
          className="w-full border rounded px-3 py-2 text-[#ffff] outline-none bg-transparent focus:border-[#898382]"
          min="09:00"
          max="18:00"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>
    </form>
  );
}

export default CustomTimePicker;
